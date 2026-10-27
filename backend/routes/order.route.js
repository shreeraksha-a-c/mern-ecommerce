import express from "express";
import { adminRoute, protectRoute, vendorRoute } from "../middleware/auth.middleware.js";
import { getAllOrders, getMyOrders, getOrderById, refundOrder, updateOrderStatus, cancelMyOrder, getVendorOrders, vendorUpdateOrderStatus } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/my", protectRoute, getMyOrders); // must stay above "/:id"
router.get("/vendor", protectRoute, vendorRoute, getVendorOrders);
router.get("/", protectRoute, adminRoute, getAllOrders);

router.get("/:id", protectRoute, getOrderById);
router.patch("/:id/status", protectRoute, adminRoute, updateOrderStatus);
router.post("/:id/refund", protectRoute, adminRoute, refundOrder);
router.post("/:id/cancel", protectRoute, cancelMyOrder); 
router.patch("/:id/vendor-status", protectRoute, vendorRoute, vendorUpdateOrderStatus);

export default router;
