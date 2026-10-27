import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
		},
		discountPercentage: {
			type: Number,
			required: true,
			min: 0,
			max: 100,
		},
		expirationDate: {
			type: Date,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		// null/undefined userId = a general coupon any customer can apply.
		// NOTE: this schema used to require + unique-index userId, which meant only
		// one coupon could ever exist per user. That unique index still exists in
		// Atlas until you drop it manually (see the note I'm sending with this batch).
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	}
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
