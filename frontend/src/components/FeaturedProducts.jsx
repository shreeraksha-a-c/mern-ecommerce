import ProductCard from "./ProductCard";

const FeaturedProducts = ({ featuredProducts }) => {
	return (
		<section className='mt-14'>
			<div className='mb-5 flex items-end justify-between'>
				<div>
					<h2 className='text-2xl font-bold tracking-tight text-gray-900'>Featured products</h2>
					<p className='mt-1 text-sm text-gray-600'>Hand-picked favourites from across the store</p>
				</div>
				<span className='text-sm text-gray-500'>{featuredProducts.length} items</span>
			</div>

			<div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
				{featuredProducts.map((product) => (
					<ProductCard key={product._id} product={product} />
				))}
			</div>
		</section>
	);
};
export default FeaturedProducts;
