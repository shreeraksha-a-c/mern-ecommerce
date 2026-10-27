import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { stripe } from "../lib/stripe.js";

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
					currency: "usd",
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

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}
		res.status(200).json({ id: session.id, url: session.url, totalAmount: totalAmount / 100 });
	} catch (error) {
		console.error("Error processing checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

// POST /api/payments/checkout-success  body: { sessionId }
export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		if (!sessionId) {
			return res.status(400).json({ message: "sessionId is required" });
		}

		const session = await stripe.checkout.sessions.retrieve(sessionId);

		// a user can only confirm their own checkout session
		if (session.metadata.userId !== req.user._id.toString()) {
			return res.status(403).json({ message: "This checkout session does not belong to you" });
		}

		if (session.payment_status !== "paid") {
			return res.status(400).json({ success: false, message: "Payment not completed" });
		}

		// calling this twice (e.g. page refresh) must not create a duplicate order
		// or decrement stock a second time
		const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
		if (existingOrder) {
			return res.status(200).json({
				success: true,
				message: "Order already created for this payment.",
				orderId: existingOrder._id,
			});
		}

		if (session.metadata.couponCode) {
			await Coupon.findOneAndUpdate(
				{ code: session.metadata.couponCode, userId: session.metadata.userId },
				{ isActive: false }
			);
		}

		const products = JSON.parse(session.metadata.products);

		// decrement stock for each product bought; never let stock go below 0
		for (const product of products) {
			const dbProduct = await Product.findById(product.id);
			if (!dbProduct) continue; // product may have been deleted since the order was placed
			const newStock = Math.max(0, dbProduct.stock - product.quantity);
			await Product.findByIdAndUpdate(product.id, { stock: newStock });
		}

		const newOrder = new Order({
			user: session.metadata.userId,
			products: products.map((product) => ({
				product: product.id,
				quantity: product.quantity,
				price: product.price,
			})),
			totalAmount: session.amount_total / 100, // convert from cents to dollars,
			stripeSessionId: sessionId,
			paymentIntentId: session.payment_intent, // used for refunds
		});

		await newOrder.save();

		// clear whatever coupon the user had applied, now that it's been used (or the order is done)
		await req.user.updateOne({ appliedCouponCode: null });

		res.status(200).json({
			success: true,
			message: "Payment successful, order created, and coupon deactivated if used.",
			orderId: newOrder._id,
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
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}
