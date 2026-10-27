import express from "express";
import { deleteAccount, login, logout, signup, vendorSignup, refreshToken, getProfile, changePassword, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.put("/profile", protectRoute, updateProfile);
router.put("/change-password", protectRoute, changePassword);
router.delete("/account", protectRoute, deleteAccount);
router.post("/vendor-signup", vendorSignup);

export default router;
