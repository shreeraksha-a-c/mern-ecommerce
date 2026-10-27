import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

// returns a non-negative whole number, or null when the value isn't one
const parseStock = (value) => {
	const n = Number(value);
	return Number.isInteger(n) && n >= 0 ? n : null;
};

export const getAllProducts = async (req, res) => {
	try {
		const products = await Product.find({}); // find all products
		res.json({ products });
	} catch (error) {
		console.log("Error in getAllProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getFeaturedProducts = async (req, res) => {
	try {
		let featuredProducts = await redis.get("featured_products");
		if (featuredProducts) {
			return res.json(JSON.parse(featuredProducts));
		}

		// if not in redis, fetch from mongodb
		// .lean() is gonna return a plain javascript object instead of a mongodb document
		// which is good for performance
		featuredProducts = await Product.find({ isFeatured: true }).lean();

		if (!featuredProducts) {
			return res.status(404).json({ message: "No featured products found" });
		}

		// store in redis for future quick access

		await redis.set("featured_products", JSON.stringify(featuredProducts));

		res.json(featuredProducts);
	} catch (error) {
		console.log("Error in getFeaturedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const createProduct = async (req, res) => {
	try {
		const { name, description, price, image, category, stock } = req.body;

		let stockValue = 0;
		if (stock !== undefined) {
			stockValue = parseStock(stock);
			if (stockValue === null) {
				return res.status(400).json({ message: "stock must be a non-negative whole number" });
			}
		}

		let cloudinaryResponse = null;

		if (image) {
			cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
		}

		const product = await Product.create({
			name,
			description,
			price,
			image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
			category,
			stock: stockValue,
		});

		res.status(201).json(product);
	} catch (error) {
		console.log("Error in createProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const deleteProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		if (product.image) {
			const publicId = product.image.split("/").pop().split(".")[0];
			try {
				await cloudinary.uploader.destroy(`products/${publicId}`);
				console.log("deleted image from cloduinary");
			} catch (error) {
				console.log("error deleting image from cloduinary", error);
			}
		}

		await Product.findByIdAndDelete(req.params.id);

		res.json({ message: "Product deleted successfully" });
	} catch (error) {
		console.log("Error in deleteProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// GET /api/products/recommendations  (public; personalised when logged in)
export const getRecommendedProducts = async (req, res) => {
	try {
		const SIZE = 4;
		const projection = { _id: 1, name: 1, description: 1, image: 1, price: 1, category: 1, stock: 1 };
		const categories = new Set();
		const excludeIds = [];

		if (req.user) {
			const user = await User.findById(req.user._id).populate("wishlist", "category");
			user.wishlist.forEach((p) => p?.category && categories.add(p.category));
			user.cartItems.forEach((item) => excludeIds.push(item._id));

			const orders = await Order.find({ user: req.user._id })
				.sort({ createdAt: -1 })
				.limit(20)
				.populate("products.product", "category");
			orders.forEach((order) =>
				order.products.forEach((line) => {
					if (!line.product) return; // product was deleted
					categories.add(line.product.category);
					excludeIds.push(line.product._id);
				})
			);
		}

		let products = [];
		if (categories.size > 0) {
			products = await Product.aggregate([
				{ $match: { category: { $in: [...categories] }, _id: { $nin: excludeIds } } },
				{ $sample: { size: SIZE } },
				{ $project: projection },
			]);
		}

		// not enough personalised picks -> top up with random products
		if (products.length < SIZE) {
			const alreadyPicked = [...excludeIds, ...products.map((p) => p._id)];
			const filler = await Product.aggregate([
				{ $match: { _id: { $nin: alreadyPicked } } },
				{ $sample: { size: SIZE - products.length } },
				{ $project: projection },
			]);
			products = [...products, ...filler];
		}

		res.json(products);
	} catch (error) {
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category });
		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const toggleFeaturedProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (product) {
			product.isFeatured = !product.isFeatured;
			const updatedProduct = await product.save();
			await updateFeaturedProductsCache();
			res.json(updatedProduct);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in toggleFeaturedProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

async function updateFeaturedProductsCache() {
	try {
		// The lean() method  is used to return plain JavaScript objects instead of full Mongoose documents. This can significantly improve performance

		const featuredProducts = await Product.find({ isFeatured: true }).lean();
		await redis.set("featured_products", JSON.stringify(featuredProducts));
	} catch (error) {
		console.log("error in update cache function");
	}
}

// ---------------------------------------------------------------------------
// NEW: update, search/filter, bestsellers, trending
// ---------------------------------------------------------------------------

// PUT /api/products/:id  (admin) - edit name, description, price, category, image
export const updateProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		const { name, description, price, category, image, stock } = req.body;

		if (stock !== undefined) {
			const stockValue = parseStock(stock);
			if (stockValue === null) {
				return res.status(400).json({ message: "stock must be a non-negative whole number" });
			}
			product.stock = stockValue;
		}

		if (name !== undefined) product.name = name;
		if (description !== undefined) product.description = description;
		if (category !== undefined) product.category = category;
		if (price !== undefined) {
			if (Number.isNaN(Number(price)) || Number(price) < 0) {
				return res.status(400).json({ message: "Price must be a non-negative number" });
			}
			product.price = Number(price);
		}

		// only upload when a new image (base64 / data URL) is sent; an existing http(s) URL means "unchanged"
		if (image && !image.startsWith("http")) {
			if (product.image) {
				const publicId = product.image.split("/").pop().split(".")[0];
				try {
					await cloudinary.uploader.destroy(`products/${publicId}`);
				} catch (error) {
					console.log("error deleting old image from cloudinary", error.message);
				}
			}
			const cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
			product.image = cloudinaryResponse.secure_url;
		}

		const updatedProduct = await product.save();

		// keep the Redis cache of featured products in sync
		if (updatedProduct.isFeatured) {
			await updateFeaturedProductsCache();
		}

		res.json(updatedProduct);
	} catch (error) {
		console.log("Error in updateProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// GET /api/products/search?q=&category=&minPrice=&maxPrice=&sort=&page=&limit=   (public)
// sort: newest (default) | oldest | price_asc | price_desc | name_asc
export const searchProducts = async (req, res) => {
	try {
		const { q, category, minPrice, maxPrice, sort } = req.query;
		const page = Math.max(parseInt(req.query.page) || 1, 1);
		const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

		const filter = {};

		// typeof checks stop query-string tricks like ?q[$ne]=x (NoSQL injection)
		if (typeof q === "string" && q.trim()) {
			const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex characters
			filter.$or = [{ name: { $regex: safe, $options: "i" } }, { description: { $regex: safe, $options: "i" } }];
		}
		if (typeof category === "string" && category) {
			filter.category = category;
		}

		const min = Number(minPrice);
		const max = Number(maxPrice);
		if (minPrice !== undefined && minPrice !== "" && !Number.isNaN(min)) {
			filter.price = { ...filter.price, $gte: min };
		}
		if (maxPrice !== undefined && maxPrice !== "" && !Number.isNaN(max)) {
			filter.price = { ...filter.price, $lte: max };
		}

		const sortOptions = {
			newest: { createdAt: -1 },
			oldest: { createdAt: 1 },
			price_asc: { price: 1 },
			price_desc: { price: -1 },
			name_asc: { name: 1 },
		};
		const sortBy = sortOptions[sort] || sortOptions.newest;

		const [products, total] = await Promise.all([
			Product.find(filter)
				.sort(sortBy)
				.skip((page - 1) * limit)
				.limit(limit),
			Product.countDocuments(filter),
		]);

		res.json({ products, page, totalPages: Math.ceil(total / limit), total });
	} catch (error) {
		console.log("Error in searchProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// shared aggregation: top products by units sold, optionally only orders from the last `days` days
const getTopSelling = async ({ days, limit }) => {
	const match = { status: { $nin: ["cancelled", "refunded"] } };
	if (days) {
		match.createdAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
	}

	return Order.aggregate([
		{ $match: match },
		{ $unwind: "$products" },
		{
			$group: {
				_id: "$products.product",
				unitsSold: { $sum: "$products.quantity" },
				revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
			},
		},
		{ $sort: { unitsSold: -1 } },
		{ $limit: limit },
		{ $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
		{ $unwind: "$product" }, // drops products that were deleted since
		{
			$project: {
				_id: 0,
				unitsSold: 1,
				revenue: 1,
				product: { _id: 1, name: 1, description: 1, image: 1, price: 1, category: 1 },
			},
		},
	]);
};

// GET /api/products/bestsellers?limit=5   (public) - all-time top sellers
export const getBestsellers = async (req, res) => {
	try {
		const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 20);
		const bestsellers = await getTopSelling({ limit });
		res.json(bestsellers);
	} catch (error) {
		console.log("Error in getBestsellers controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// GET /api/products/trending?days=7&limit=5   (public) - top sellers in the last N days
export const getTrending = async (req, res) => {
	try {
		const days = Math.min(Math.max(parseInt(req.query.days) || 7, 1), 365);
		const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 20);
		const trending = await getTopSelling({ days, limit });
		res.json(trending);
	} catch (error) {
		console.log("Error in getTrending controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// PATCH /api/products/:id/stock  body: { stock }  (admin) - set stock directly (e.g. after a restock)
export const updateStock = async (req, res) => {
	try {
		const { stock } = req.body;
		if (stock === undefined || Number.isNaN(Number(stock)) || Number(stock) < 0) {
			return res.status(400).json({ message: "stock must be a non-negative number" });
		}

		const product = await Product.findByIdAndUpdate(req.params.id, { stock: Number(stock) }, { new: true });
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		res.json(product);
	} catch (error) {
		console.log("Error in updateStock controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const createVendorProduct = async (req, res) => {
	try {
		const { name, description, price, image, category, stock } = req.body;
		if (!name || !description || price === undefined || !image || !category) {
			return res.status(400).json({ message: "name, description, price, image and category are required" });
		}

		let stockValue = 0;
		if (stock !== undefined) {
			stockValue = parseStock(stock);
			if (stockValue === null) {
				return res.status(400).json({ message: "stock must be a non-negative whole number" });
			}
		}

		const cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });

		const product = await Product.create({
			name,
			description,
			price,
			category,
			image: cloudinaryResponse.secure_url,
			vendor: req.user._id,
			stock: stockValue,
		});

		res.status(201).json(product);
	} catch (error) {
		console.log("Error in createVendorProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// GET /api/products/vendor/mine  (vendor or admin) - only this vendor's products
export const getMyVendorProducts = async (req, res) => {
	try {
		const products = await Product.find({ vendor: req.user._id });
		res.json(products);
	} catch (error) {
		console.log("Error in getMyVendorProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// PUT /api/products/vendor/:id  (vendor or admin) - vendor can only edit their own product
export const updateVendorProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}
		if (req.user.role === "vendor" && String(product.vendor) !== String(req.user._id)) {
			return res.status(403).json({ message: "You can only edit your own products" });
		}

		const { name, description, price, category, stock } = req.body;
		if (name !== undefined) product.name = name;
		if (description !== undefined) product.description = description;
		if (category !== undefined) product.category = category;
		if (price !== undefined) product.price = Number(price);

		if (stock !== undefined) {
			const stockValue = parseStock(stock);
			if (stockValue === null) {
				return res.status(400).json({ message: "stock must be a non-negative whole number" });
			}
			product.stock = stockValue;
		}

		await product.save();
		res.json(product);
	} catch (error) {
		console.log("Error in updateVendorProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// DELETE /api/products/vendor/:id  (vendor or admin) - vendor can only delete their own product
export const deleteVendorProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}
		if (req.user.role === "vendor" && String(product.vendor) !== String(req.user._id)) {
			return res.status(403).json({ message: "You can only delete your own products" });
		}

		await Product.findByIdAndDelete(req.params.id);
		res.json({ message: "Product deleted" });
	} catch (error) {
		console.log("Error in deleteVendorProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};