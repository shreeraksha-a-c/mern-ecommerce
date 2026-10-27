export const categories = [
	{ slug: "jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
	{ slug: "t-shirts", name: "T-shirts", imageUrl: "/tshirts.jpg" },
	{ slug: "shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
	{ slug: "glasses", name: "Glasses", imageUrl: "/glasses.png" },
	{ slug: "jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
	{ slug: "suits", name: "Suits", imageUrl: "/suits.jpg" },
	{ slug: "bags", name: "Bags", imageUrl: "/bags.jpg" },
];

export const getCategoryName = (slug) =>
	categories.find((category) => category.slug === slug)?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);
