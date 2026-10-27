import { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams } from "react-router-dom";
import ProductBrowser from "../components/ProductBrowser";
import { getCategoryName } from "../lib/categories";

const CategoryPage = () => {
	const { fetchProductsByCategory, products, loading } = useProductStore();

	const { category } = useParams();

	useEffect(() => {
		fetchProductsByCategory(category);
	}, [fetchProductsByCategory, category]);

	// key resets the filters when switching category
	return <ProductBrowser key={category} title={getCategoryName(category)} products={products} loading={loading} />;
};
export default CategoryPage;
