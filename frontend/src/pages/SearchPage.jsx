import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../lib/axios";
import ProductBrowser from "../components/ProductBrowser";
//import { categories } from "../lib/categories";
import { useCategoryStore } from "../stores/useCategoryStore";

// The API has no search endpoint, so load every category once and filter in the browser
const SearchPage = () => {
	const categories = useCategoryStore((s) => s.categories);
	const [searchParams] = useSearchParams();
	const query = (searchParams.get("q") ?? "").trim();
	const [allProducts, setAllProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAll = async () => {
			try {
				const responses = await Promise.all(
					categories.map((category) => axios.get(`/products/category/${category.slug}`))
				);
				setAllProducts(responses.flatMap((res) => res.data.products));
			} catch (error) {
				console.error("Error fetching products for search:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchAll();
	}, []);

	const results = useMemo(() => {
		const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
		if (terms.length === 0) return [];
		return allProducts.filter((product) => {
			const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();
			return terms.every((term) => haystack.includes(term));
		});
	}, [allProducts, query]);

	return (
		<ProductBrowser
			key={query}
			title={query ? `Results for "${query}"` : "Search"}
			subtitle={loading ? "Searching..." : undefined}
			products={results}
			loading={loading}
		/>
	);
};

export default SearchPage;
