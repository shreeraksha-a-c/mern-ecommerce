import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";

// statuses an admin can set manually ("refunded" is only set by the refund flow)
const ADMIN_STATUSES = ["processing", "shipped", "delivered", "cancelled"];
const ALL_STATUSES = [...ADMIN_STATUSES, "refunded"];

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
		if (order.status === "refunded") {
			return res.status(400).json({ message: "Refunded orders cannot be changed" });
		}

		order.status = status;
		await order.save();

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
		if (order.status === "refunded") {
			return res.status(400).json({ message: "This order has already been refunded" });
		}
		if (!order.paymentIntentId) {
			return res.status(400).json({ message: "No payment record found for this order" });
		}

		await stripe.refunds.create({ payment_intent: order.paymentIntentId });

		order.status = "refunded";
		await order.save();

		res.json({ message: "Order refunded", order });
	} catch (error) {
		console.log("Error in refundOrder controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};