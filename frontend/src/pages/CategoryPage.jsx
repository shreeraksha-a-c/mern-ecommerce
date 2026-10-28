import { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams, useSearchParams } from "react-router-dom";
import ProductBrowser from "../components/ProductBrowser";
import { getCategoryName } from "../lib/categories";

const genderLabels = {
	women: "Women's",
	men: "Men's",
	kids: "Kids'",
};

const CategoryPage = () => {
	const { fetchProductsByCategory, products, loading } = useProductStore();
	const { category } = useParams();
	const [searchParams] = useSearchParams();
	const gender = searchParams.get("gender");

	useEffect(() => {
		fetchProductsByCategory(category);
	}, [fetchProductsByCategory, category]);

	const baseName = getCategoryName(category);
	const title = gender && genderLabels[gender] ? `${genderLabels[gender]} ${baseName}` : baseName;

	// key resets the filters when switching category or gender
	return (
		<ProductBrowser
			key={`${category}-${gender || "all"}`}
			title={title}
			subtitle={gender ? `Showing ${genderLabels[gender]} collection` : undefined}
			products={products}
			loading={loading}
		/>
	);
};
export default CategoryPage;
