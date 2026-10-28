import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";

const slugify = (name) =>
	name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

// GET /api/categories  (public) - with product count per category
export const getCategories = async (req, res) => {
	try {
		const categories = await Category.aggregate([
			{ $lookup: { from: "products", localField: "slug", foreignField: "category", as: "products" } },
			{
				$project: {
					name: 1,
					slug: 1,
					imageUrl: 1,
					createdAt: 1,
					productCount: { $size: "$products" },
				},
			},
			{ $sort: { createdAt: 1, _id: 1 } },
		]);
		res.json(categories);
	} catch (error) {
		console.log("Error in getCategories controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// POST /api/categories  body: { name, image }  (admin)
export const createCategory = async (req, res) => {
	try {
		const { name, image } = req.body;
		if (!name || !name.trim()) {
			return res.status(400).json({ message: "name is required" });
		}
		if (!image) {
			return res.status(400).json({ message: "image is required" });
		}

		const slug = slugify(name);
		if (!slug) {
			return res.status(400).json({ message: "name must contain letters or numbers" });
		}
		if (await Category.findOne({ slug })) {
			return res.status(400).json({ message: "A category with this name already exists" });
		}

		const uploaded = await cloudinary.uploader.upload(image, { folder: "categories" });

		const category = await Category.create({
			name: name.trim(),
			slug,
			imageUrl: uploaded.secure_url,
		});

		res.status(201).json(category);
	} catch (error) {
		console.log("Error in createCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// PUT /api/categories/:id  body: { name }  (admin) - renames only; slug stays fixed
export const updateCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const { name } = req.body;

		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({ message: "Invalid category id" });
		}
		if (!name || !name.trim()) {
			return res.status(400).json({ message: "name is required" });
		}

		const category = await Category.findById(id);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		category.name = name.trim();
		await category.save();

		res.json(category);
	} catch (error) {
		console.log("Error in updateCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// DELETE /api/categories/:id  (admin) - blocked while products still use it
export const deleteCategory = async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({ message: "Invalid category id" });
		}

		const category = await Category.findById(id);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		const inUse = await Product.countDocuments({ category: category.slug });
		if (inUse > 0) {
			return res
				.status(400)
				.json({ message: `Move or delete the ${inUse} product${inUse === 1 ? "" : "s"} first` });
		}

		// only Cloudinary-hosted images (new categories) need cleaning up; seeded "/jeans.jpg" ones don't
		if (category.imageUrl?.includes("res.cloudinary.com")) {
			const publicId = category.imageUrl.split("/").pop().split(".")[0];
			try {
				await cloudinary.uploader.destroy(`categories/${publicId}`);
			} catch (error) {
				console.log("error deleting category image from cloudinary", error);
			}
		}

		await Category.findByIdAndDelete(id);
		res.json({ message: "Category deleted" });
	} catch (error) {
		console.log("Error in deleteCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};