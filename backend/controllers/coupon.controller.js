import mongoose from "mongoose";
import Coupon from "../models/coupon.model.js";
import User from "../models/user.model.js";

// GET /api/coupons  (customer) - the customer's own active coupon, if any
export const getCoupon = async (req, res) => {
	try {
		const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
		res.json(coupon || null);
	} catch (error) {
		console.log("Error in getCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// shared lookup used by validate/apply: a coupon is usable by req.user if it's
// either assigned to them specifically, or a general coupon (no userId)
const findUsableCoupon = async (code, userId) => {
	return Coupon.findOne({
		code,
		isActive: true,
		$or: [{ userId }, { userId: null }, { userId: { $exists: false } }],
	});
};

// POST /api/coupons/validate  body: { code }  (customer) - check only, no persistence
export const validateCoupon = async (req, res) => {
	try {
		//const { code } = req.body;
		const code = String(req.body.code || "").trim().toUpperCase();
		if (!code) {
			return res.status(400).json({ message: "Coupon code is required" });
		}
		const coupon = await findUsableCoupon(code, req.user._id);

		if (!coupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		if (coupon.expirationDate < new Date()) {
			if (coupon.userId) {
				coupon.isActive = false;
				await coupon.save();
			}
			return res.status(404).json({ message: "Coupon expired" });
		}

		res.json({
			message: "Coupon is valid",
			code: coupon.code,
			discountPercentage: coupon.discountPercentage,
		});
	} catch (error) {
		console.log("Error in validateCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// POST /api/coupons/apply  body: { code }  (customer) - validate AND remember it on the user
export const applyCoupon = async (req, res) => {
	try {
		//const { code } = req.body;
		const code = String(req.body.code || "").trim().toUpperCase();
		if (!code) {
			return res.status(400).json({ message: "Coupon code is required" });
		}
		const coupon = await findUsableCoupon(code, req.user._id);

		if (!coupon || coupon.expirationDate < new Date()) {
			return res.status(404).json({ message: "Coupon not found or expired" });
		}

		req.user.appliedCouponCode = coupon.code;
		await req.user.save();

		res.json({
			message: "Coupon applied",
			code: coupon.code,
			discountPercentage: coupon.discountPercentage,
		});
	} catch (error) {
		console.log("Error in applyCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// POST /api/coupons/remove  (customer) - unapply whatever coupon is currently set
export const removeCoupon = async (req, res) => {
	try {
		req.user.appliedCouponCode = null;
		await req.user.save();
		res.json({ message: "Coupon removed" });
	} catch (error) {
		console.log("Error in removeCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// ---------------------------------------------------------------------------
// Admin coupon management
// ---------------------------------------------------------------------------

// POST /api/coupons  body: { code, discountPercentage, expirationDate, userId? }  (admin)
// omit userId to create a general coupon any customer can apply
export const createCoupon = async (req, res) => {
	try {
		const { code, discountPercentage, expirationDate, userId } = req.body;

		if (!code || discountPercentage === undefined || !expirationDate) {
			return res.status(400).json({ message: "code, discountPercentage and expirationDate are required" });
		}
		if (Number(discountPercentage) < 0 || Number(discountPercentage) > 100) {
			return res.status(400).json({ message: "discountPercentage must be between 0 and 100" });
		}
		if (Number.isNaN(new Date(expirationDate).getTime())) {
			return res.status(400).json({ message: "expirationDate is not a valid date" });
		}
		if (userId && !mongoose.isValidObjectId(userId)) {
			return res.status(400).json({ message: "Invalid userId" });
		}
		if (userId) {
			const user = await User.findById(userId);
			if (!user) return res.status(404).json({ message: "User not found" });
		}

		const normalizedCode = String(code).trim().toUpperCase();
		const existing = await Coupon.findOne({ code: normalizedCode });
		if (existing) {
			return res.status(400).json({ message: "A coupon with this code already exists" });
		}

		const coupon = await Coupon.create({
			code: normalizedCode,
			discountPercentage,
			expirationDate,
			userId: userId || undefined,
		});

		res.status(201).json(coupon);
	} catch (error) {
		console.log("Error in createCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// GET /api/coupons/all  (admin) - every coupon, for managing deals
export const getAllCoupons = async (req, res) => {
	try {
		const coupons = await Coupon.find().sort({ createdAt: -1 });
		res.json(coupons);
	} catch (error) {
		console.log("Error in getAllCoupons controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// DELETE /api/coupons/:id  (admin)
export const deleteCoupon = async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({ message: "Invalid coupon id" });
		}

		const coupon = await Coupon.findByIdAndDelete(id);
		if (!coupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		res.json({ message: "Coupon deleted" });
	} catch (error) {
		console.log("Error in deleteCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// PUT /api/coupons/:id  body: { discountPercentage, expirationDate, isActive }  (admin)
export const updateCoupon = async (req, res) => {
	try {
		const { id } = req.params;
		const { discountPercentage, expirationDate, isActive } = req.body;

		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({ message: "Invalid coupon id" });
		}
		if (discountPercentage === undefined || !expirationDate) {
			return res.status(400).json({ message: "discountPercentage and expirationDate are required" });
		}
		if (
			Number.isNaN(Number(discountPercentage)) ||
			Number(discountPercentage) < 0 ||
			Number(discountPercentage) > 100
		) {
			return res.status(400).json({ message: "discountPercentage must be between 0 and 100" });
		}
		if (Number.isNaN(new Date(expirationDate).getTime())) {
			return res.status(400).json({ message: "expirationDate is not a valid date" });
		}
		if (isActive !== undefined && typeof isActive !== "boolean") {
			return res.status(400).json({ message: "isActive must be true or false" });
		}

		const coupon = await Coupon.findById(id);
		if (!coupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		coupon.discountPercentage = Number(discountPercentage);
		coupon.expirationDate = expirationDate;
		if (isActive !== undefined) coupon.isActive = isActive;
		await coupon.save();

		res.json(coupon);
	} catch (error) {
		console.log("Error in updateCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
