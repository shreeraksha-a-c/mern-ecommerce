import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { stripe } from "../lib/stripe.js";
import User from "../models/user.model.js";

// set CURRENCY=inr in .env to charge in rupees (default usd)
const CURRENCY = (process.env.CURRENCY || "usd").toLowerCase();

// same "which coupons can this user use" rule as coupon.controller.js
const findUsableCoupon = async (code, userId) => {
	return Coupon.findOne({
		code,
		isActive: true,
		$or: [{ userId }, { userId: null }, { userId: { $exists: false } }],
	});
};

// POST /api/payments/create-checkout-session  body: { products, couponCode? }
export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		// Look every product up in the DB instead of trusting the price/name/image the
		// client sent - otherwise anyone could edit the request and pay whatever they want.
		const ids = products.map((p) => p._id || p.id);
		const dbProducts = await Product.find({ _id: { $in: ids } });
		const dbProductsById = new Map(dbProducts.map((p) => [p._id.toString(), p]));

		let totalAmount = 0;
		const orderProducts = []; // trusted {id, quantity, price} used for the order + Stripe metadata

		for (const requested of products) {
			const id = requested._id || requested.id;
			const dbProduct = dbProductsById.get(String(id));
			if (!dbProduct) {
				return res.status(404).json({ message: `Product ${id} not found` });
			}

			const quantity = Math.max(1, parseInt(requested.quantity) || 1);
			if (dbProduct.stock < quantity) {
				return res.status(400).json({ message: `${dbProduct.name} only has ${dbProduct.stock} in stock` });
			}

			orderProducts.push({ id: dbProduct._id.toString(), quantity, price: dbProduct.price });
			totalAmount += Math.round(dbProduct.price * 100) * quantity;
		}

		const lineItems = orderProducts.map((p) => {
			const dbProduct = dbProductsById.get(p.id);
			return {
				price_data: {
					currency: CURRENCY,
					product_data: {
						name: dbProduct.name,
						images: [dbProduct.image],
					},
					unit_amount: Math.round(dbProduct.price * 100),
				},
				quantity: p.quantity,
			};
		});

		let coupon = null;
		if (couponCode) {
			coupon = await findUsableCoupon(couponCode, req.user._id);
			if (coupon && coupon.expirationDate < new Date()) coupon = null;
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			shipping_address_collection: { allowed_countries: ["IN", "US"] },
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			discounts: coupon
				? [
						{
							coupon: await createStripeCoupon(coupon.discountPercentage),
						},
				  ]
				: [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: coupon ? coupon.code : "",
				products: JSON.stringify(orderProducts),
			},
		});

		res.status(200).json({ id: session.id, url: session.url, totalAmount: totalAmount / 100 });
	} catch (error) {
		console.error("Error processing checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

// Builds the order for a paid Stripe session. Safe to call twice for the same session.
async function createOrderFromSession(session) {
	const existing = await Order.findOne({ stripeSessionId: session.id });
	if (existing) return { order: existing, created: false };

	const items = JSON.parse(session.metadata.products);
	const dbProducts = await Product.find({ _id: { $in: items.map((item) => item.id) } });
	const productsById = new Map(dbProducts.map((p) => [p._id.toString(), p]));

	// Stripe API versions before 2025 use session.shipping_details, newer ones collected_information
	const shipping = session.collected_information?.shipping_details || session.shipping_details;

	let order;
	try {
		order = await Order.create({
			user: session.metadata.userId,
			products: items.map((item) => ({
				product: item.id,
				quantity: item.quantity,
				price: item.price,
				vendor: productsById.get(item.id)?.vendor,
			})),
			totalAmount: session.amount_total / 100,
			stripeSessionId: session.id,
			paymentIntentId: session.payment_intent,
			shippingAddress: shipping
				? {
						name: shipping.name,
						line1: shipping.address?.line1,
						line2: shipping.address?.line2,
						city: shipping.address?.city,
						state: shipping.address?.state,
						postalCode: shipping.address?.postal_code,
						country: shipping.address?.country,
				  }
				: undefined,
		});
	} catch (error) {
		if (error.code === 11000) {
			return { order: await Order.findOne({ stripeSessionId: session.id }), created: false };
		}
		throw error;
	}

	// decrement stock; never below 0
	for (const item of items) {
		const dbProduct = productsById.get(item.id);
		if (!dbProduct) continue;
		await Product.findByIdAndUpdate(item.id, { stock: Math.max(0, dbProduct.stock - item.quantity) });
	}

	// a user-specific coupon is single-use
	if (session.metadata.couponCode) {
		await Coupon.findOneAndUpdate(
			{ code: session.metadata.couponCode, userId: session.metadata.userId },
			{ isActive: false }
		);
	}

	// big orders earn a reward coupon, only after payment actually succeeded
	if (session.amount_total >= 20000) {
		await createNewCoupon(session.metadata.userId);
	}

	await User.findByIdAndUpdate(session.metadata.userId, { appliedCouponCode: null });

	return { order, created: true };
}

// POST /api/payments/checkout-success  body: { sessionId }
export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		if (!sessionId) {
			return res.status(400).json({ message: "sessionId is required" });
		}

		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.metadata.userId !== req.user._id.toString()) {
			return res.status(403).json({ message: "This checkout session does not belong to you" });
		}
		if (session.payment_status !== "paid") {
			return res.status(400).json({ success: false, message: "Payment not completed" });
		}

		const { order, created } = await createOrderFromSession(session);

		res.status(200).json({
			success: true,
			message: created ? "Payment successful, order created." : "Order already created for this payment.",
			orderId: order._id,
		});
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
	}
};

async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
}

async function createNewCoupon(userId) {
	// only replace earlier auto-generated reward coupons - never an admin-assigned one
	await Coupon.deleteMany({ userId, code: { $regex: "^GIFT" } });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}
