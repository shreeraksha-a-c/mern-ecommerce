import express from "express";
import { deleteAccount, login, logout, signup, vendorSignup, refreshToken, getProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.delete("/account", protectRoute, deleteAccount);
router.post("/vendor-signup", vendorSignup);

export default router;
