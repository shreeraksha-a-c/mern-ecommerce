import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
	createCategory,
	deleteCategory,
	getCategories,
	updateCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", protectRoute, adminRoute, createCategory);
router.put("/:id", protectRoute, adminRoute, updateCategory);
router.delete("/:id", protectRoute, adminRoute, deleteCategory);

export default router;