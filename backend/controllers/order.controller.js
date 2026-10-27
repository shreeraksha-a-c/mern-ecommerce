import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";
import Product from "../models/product.model.js";

// statuses an admin can set manually ("refunded" is only set by the refund flow)
const ADMIN_STATUSES = ["processing", "shipped", "delivered", "cancelled"];
const ALL_STATUSES = [...ADMIN_STATUSES, "refunded"];

const VENDOR_STATUSES = ["shipped", "delivered"];

// refunds the Stripe payment (if there was one), puts the stock back, sets the final status
const refundAndRestock = async (order, finalStatus) => {
    if (order.paymentIntentId) {
        await stripe.refunds.create({ payment_intent: order.paymentIntentId });
    }
    await Promise.all(
        order.products.map((line) =>
            Product.findByIdAndUpdate(line.product, { $inc: { stock: line.quantity } })
        )
    );
    order.status = finalStatus;
    await order.save();
};

// GET /api/orders/my  -> logged-in customer's order history
export const getMyOrders = async (req, res) => {
	try {
		const orders = await Order.find({ user: req.user._id })
			.populate("products.product", "name image category")
			.sort({ createdAt: -1 });

		res.json(orders);
	} catch (error) {
		console.log("Error in getMyOrders controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// GET /api/orders/:id  -> a single order (owner or admin only)
export const getOrderById = async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({ message: "Invalid order id" });
		}

		const order = await Order.findById(id)
			.populate("products.product", "name image category")
			.populate("user", "name email");

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		const ownerId = order.user?._id?.toString();
		if (req.user.role !== "admin" && ownerId !== req.user._id.toString()) {
			return res.status(403).json({ message: "Access denied" });
		}

		res.json(order);
	} catch (error) {
		console.log("Error in getOrderById controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// GET /api/orders?status=&page=&limit=  -> all orders (admin only)
export const getAllOrders = async (req, res) => {
	try {
		const { status } = req.query;
		const page = Math.max(parseInt(req.query.page) || 1, 1);
		const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

		const filter = {};
		if (typeof status === "string" && status) {
			if (!ALL_STATUSES.includes(status)) {
				return res.status(400).json({ message: `Invalid status. Use one of: ${ALL_STATUSES.join(", ")}` });
			}
			filter.status = status;
		}

		const [orders, total] = await Promise.all([
			Order.find(filter)
				.populate("user", "name email")
				.populate("products.product", "name image")
				.sort({ createdAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit),
			Order.countDocuments(filter),
		]);

		res.json({ orders, page, totalPages: Math.ceil(total / limit), total });
	} catch (error) {
		console.log("Error in getAllOrders controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// PATCH /api/orders/:id/status  body: { status }  -> update order status (admin only)
export const updateOrderStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({ message: "Invalid order id" });
		}
		if (!ADMIN_STATUSES.includes(status)) {
			return res.status(400).json({ message: `Invalid status. Use one of: ${ADMIN_STATUSES.join(", ")}` });
		}

		const order = await Order.findById(id);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}
		if (order.status === "refunded" || order.status === "cancelled") {
			return res.status(400).json({ message: `${order.status} orders cannot be changed` });
		}
		if (status === "cancelled") {
			await refundAndRestock(order, "cancelled"); // cancelling a paid order = refund + restock
		} else {
			order.status = status;
			await order.save();
		}
		res.json(order);
	} catch (error) {
		console.log("Error in updateOrderStatus controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// POST /api/orders/:id/refund  (admin only)
export const refundOrder = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({ message: "Invalid order id" });
		}

		const order = await Order.findById(id);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}
		if (order.status === "refunded" || order.status === "cancelled") {
			return res.status(400).json({ message: `This order is already ${order.status}` });
		}
		if (!order.paymentIntentId) {
			return res.status(400).json({ message: "No payment record found for this order" });
		}
		await refundAndRestock(order, "refunded");
		res.json({ message: "Order refunded", order });
	} catch (error) {
		console.log("Error in refundOrder controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// POST /api/orders/:id/cancel (customer)
export const cancelMyOrder = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid order id" });
        }
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (order.status !== "processing") {
            return res.status(400).json({ message: `Only processing orders can be cancelled` });
        }
        await refundAndRestock(order, "cancelled");
        res.json({ message: "Order cancelled and refunded", order });
    } catch (error) {
        console.log("Error in cancelMyOrder controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /api/orders/vendor  (vendor or admin) - orders containing this vendor's products, showing only their lines
export const getVendorOrders = async (req, res) => {
	try {
		const orders = await Order.find({ "products.vendor": req.user._id })
			.populate("products.product", "name image category")
			.populate("user", "name email")
			.sort({ createdAt: -1 });

		const result = orders.map((order) => {
			const lines = order.products.filter((line) => String(line.vendor) === String(req.user._id));
			return {
				_id: order._id,
				status: order.status,
				createdAt: order.createdAt,
				customer: order.user,
				shippingAddress: order.shippingAddress,
				products: lines,
				vendorSubtotal: lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
			};
		});

		res.json(result);
	} catch (error) {
		console.log("Error in getVendorOrders controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// PATCH /api/orders/:id/vendor-status  body: { status: "shipped" | "delivered" }
export const vendorUpdateOrderStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({ message: "Invalid order id" });
		}
		if (!VENDOR_STATUSES.includes(status)) {
			return res.status(400).json({ message: `Invalid status. Use one of: ${VENDOR_STATUSES.join(", ")}` });
		}

		const order = await Order.findById(id);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		const hasVendorLine = order.products.some((line) => String(line.vendor) === String(req.user._id));
		if (!hasVendorLine && req.user.role !== "admin") {
			return res.status(403).json({ message: "This order has none of your products" });
		}
		if (order.status === "refunded" || order.status === "cancelled") {
			return res.status(400).json({ message: `${order.status} orders cannot be changed` });
		}

		order.status = status;
		await order.save();

		res.json(order);
	} catch (error) {
		console.log("Error in vendorUpdateOrderStatus controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};