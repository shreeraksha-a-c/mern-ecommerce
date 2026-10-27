import mongoose from "mongoose";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// GET /api/wishlist  (customer)
export const getWishlist = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).populate("wishlist");
		res.json(user.wishlist);
	} catch (error) {
		console.log("Error in getWishlist controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// POST /api/wishlist/:productId  (customer)
export const addToWishlist = async (req, res) => {
	try {
		const { productId } = req.params;
		if (!mongoose.isValidObjectId(productId)) {
			return res.status(400).json({ message: "Invalid product id" });
		}

		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		const user = req.user;
		const alreadyIn = user.wishlist.some((id) => id.toString() === productId);
		if (!alreadyIn) {
			user.wishlist.push(productId);
			await user.save();
		}

		res.json({ message: "Added to wishlist", wishlist: user.wishlist });
	} catch (error) {
		console.log("Error in addToWishlist controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// DELETE /api/wishlist/:productId  (customer)
export const removeFromWishlist = async (req, res) => {
	try {
		const { productId } = req.params;
		if (!mongoose.isValidObjectId(productId)) {
			return res.status(400).json({ message: "Invalid product id" });
		}

		const user = req.user;
		user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
		await user.save();

		res.json({ message: "Removed from wishlist", wishlist: user.wishlist });
	} catch (error) {
		console.log("Error in removeFromWishlist controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
