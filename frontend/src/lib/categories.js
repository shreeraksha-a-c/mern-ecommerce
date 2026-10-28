// export const categories = [
// 	{ slug: "jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
// 	{ slug: "t-shirts", name: "T-shirts", imageUrl: "/tshirts.jpg" },
// 	{ slug: "shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
// 	{ slug: "glasses", name: "Glasses", imageUrl: "/glasses.png" },
// 	{ slug: "jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
// 	{ slug: "suits", name: "Suits", imageUrl: "/suits.jpg" },
// 	{ slug: "bags", name: "Bags", imageUrl: "/bags.jpg" },
// ];

// export const getCategoryName = (slug) =>
// 	categories.find((category) => category.slug === slug)?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);

import { useCategoryStore } from "../stores/useCategoryStore";

// looks the name up in the store; falls back to the capitalised slug
export const getCategoryName = (slug) => {
	if (!slug) return "";
	const found = useCategoryStore.getState().categories.find((c) => c.slug === slug);
	return found?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);
};