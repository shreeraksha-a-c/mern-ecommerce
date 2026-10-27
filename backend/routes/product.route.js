import express from "express";
import {
	createProduct,
	createVendorProduct,
	deleteProduct,
	deleteVendorProduct,
	getAllProducts,
	getBestsellers,
	getFeaturedProducts,
	getMyVendorProducts,
	getProductsByCategory,
	getRecommendedProducts,
	getTrending,
	searchProducts,
	toggleFeaturedProduct,
	updateProduct,
	updateStock,
	updateVendorProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute, vendorRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/search", searchProducts);
router.get("/bestsellers", getBestsellers);
router.get("/trending", getTrending);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
// vendor routes - must stay above "/:id" routes
router.post("/vendor", protectRoute, vendorRoute, createVendorProduct);
router.get("/vendor/mine", protectRoute, vendorRoute, getMyVendorProducts);
router.put("/vendor/:id", protectRoute, vendorRoute, updateVendorProduct);
router.delete("/vendor/:id", protectRoute, vendorRoute, deleteVendorProduct);

router.post("/", protectRoute, adminRoute, createProduct);
router.put("/:id", protectRoute, adminRoute, updateProduct);
router.patch("/:id/stock", protectRoute, adminRoute, updateStock); // must stay above "/:id"
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;