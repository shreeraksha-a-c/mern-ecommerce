import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAllOrders, getMyOrders, getOrderById, refundOrder, updateOrderStatus } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/my", protectRoute, getMyOrders); // must stay above "/:id"
router.get("/", protectRoute, adminRoute, getAllOrders);
router.get("/:id", protectRoute, getOrderById);
router.patch("/:id/status", protectRoute, adminRoute, updateOrderStatus);
router.post("/:id/refund", protectRoute, adminRoute, refundOrder);

export default router;
