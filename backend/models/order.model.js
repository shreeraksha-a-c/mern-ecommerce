import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				price: {
					type: Number,
					required: true,
					min: 0,
				},
				vendor: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
			},
		],
		shippingAddress: {
			name: String,
			line1: String,
			line2: String,
			city: String,
			state: String,
			postalCode: String,
			country: String,
		},
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		currency: {
			type: String,
		},
		paidAmount: {
			type: Number,
			min: 0,
		},
		stripeSessionId: {
			type: String,
			unique: true,
		},
		// needed later for refunds
		paymentIntentId: {
			type: String,
		},
		status: {
			type: String,
			enum: ["processing", "shipped", "delivered", "cancelled", "refunded"],
			default: "processing",
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
