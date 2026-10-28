import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/category.model.js";

//dotenv.config();
dotenv.config({ path: "../.env" });

const categories = [
	{ slug: "jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
	{ slug: "t-shirts", name: "T-shirts", imageUrl: "/tshirts.jpg" },
	{ slug: "shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
	{ slug: "glasses", name: "Glasses", imageUrl: "/glasses.png" },
	{ slug: "jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
	{ slug: "suits", name: "Suits", imageUrl: "/suits.jpg" },
	{ slug: "bags", name: "Bags", imageUrl: "/bags.jpg" },
];

const run = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		for (const c of categories) {
			await Category.updateOne({ slug: c.slug }, { $setOnInsert: c }, { upsert: true });
		}
		console.log(`Seeded ${categories.length} categories`);
		await mongoose.disconnect();
		process.exit(0);
	} catch (error) {
		console.error("Seed failed:", error.message);
		process.exit(1);
	}
};

run();