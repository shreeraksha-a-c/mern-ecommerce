import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

const products = [
	{ name: "Classic Denim Jeans", description: "Straight fit blue jeans", price: 1299, image: "https://images.unsplash.com/photo-1542272604-787c3835535d", category: "jeans", stock: 30, isFeatured: true },
	{ name: "Cotton T-Shirt", description: "Soft everyday tee", price: 499, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab", category: "tshirts", stock: 50, isFeatured: true },
	{ name: "Running Shoes", description: "Lightweight running shoes", price: 1499, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a", category: "shoes", stock: 25, isFeatured: true },
	{ name: "Leather Jacket", description: "Genuine leather biker jacket", price: 4999, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5", category: "jackets", stock: 10, isFeatured: false },
	{ name: "Formal Shirt", description: "Slim fit office shirt", price: 899, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c", category: "shirts", stock: 40, isFeatured: false },
	{ name: "Sports Cap", description: "Adjustable cotton cap", price: 299, image: "https://images.unsplash.com/photo-1521369909029-2afed882baee", category: "accessories", stock: 60, isFeatured: false },
	{ name: "Summer Dress", description: "Light floral summer dress", price: 1799, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8", category: "dresses", stock: 20, isFeatured: true },
	{ name: "Sneakers", description: "Casual white sneakers", price: 1999, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772", category: "shoes", stock: 35, isFeatured: false },
];

const seed = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB");

		await Product.insertMany(products);
		console.log(`Inserted ${products.length} products`);

		await mongoose.disconnect();
		process.exit(0);
	} catch (error) {
		console.error("Seed failed:", error.message);
		process.exit(1);
	}
};

seed();