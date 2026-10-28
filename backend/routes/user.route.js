import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAllUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllUsers);

export default router;