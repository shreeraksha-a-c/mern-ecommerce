import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
	applyCoupon,
	createCoupon,
	deleteCoupon,
	getAllCoupons,
	getCoupon,
	removeCoupon,
	updateCoupon,
	validateCoupon,
} from "../controllers/coupon.controller.js";

const router = express.Router();

router.get("/", protectRoute, getCoupon);
router.get("/all", protectRoute, adminRoute, getAllCoupons); // must stay above "/:id"-style routes if any are added later
router.post("/validate", protectRoute, validateCoupon);
router.post("/apply", protectRoute, applyCoupon);
router.post("/remove", protectRoute, removeCoupon);
router.post("/", protectRoute, adminRoute, createCoupon);
router.put("/:id", protectRoute, adminRoute, updateCoupon);
router.delete("/:id", protectRoute, adminRoute, deleteCoupon);

export default router;
