import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, PackageSearch, SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard";
import LoadingSpinner from "./LoadingSpinner";

const sortOptions = [
	{ value: "default", label: "Recommended" },
	{ value: "price-asc", label: "Price: low to high" },
	{ value: "price-desc", label: "Price: high to low" },
	{ value: "name", label: "Name: A to Z" },
];

const sorters = {
	"price-asc": (a, b) => a.price - b.price,
	"price-desc": (a, b) => b.price - a.price,
	name: (a, b) => a.name.localeCompare(b.name),
};

// Shared listing layout for category and search results: breadcrumb, filters sidebar, sorted grid
const ProductBrowser = ({ title, subtitle, products, loading }) => {
	const [sort, setSort] = useState("default");
	const [minPrice, setMinPrice] = useState("");
	const [maxPrice, setMaxPrice] = useState("");
	const [featuredOnly, setFeaturedOnly] = useState(false);
	const [showFilters, setShowFilters] = useState(false);

	const visibleProducts = useMemo(() => {
		const filtered = (products ?? []).filter((product) => {
			if (minPrice !== "" && product.price < Number(minPrice)) return false;
			if (maxPrice !== "" && product.price > Number(maxPrice)) return false;
			if (featuredOnly && !product.isFeatured) return false;
			return true;
		});
		return sorters[sort] ? [...filtered].sort(sorters[sort]) : filtered;
	}, [products, sort, minPrice, maxPrice, featuredOnly]);

	const hasFilters = minPrice !== "" || maxPrice !== "" || featuredOnly;
	const clearFilters = () => {
		setMinPrice("");
		setMaxPrice("");
		setFeaturedOnly(false);
	};

	return (
		<div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
			<nav className='flex items-center gap-1 text-sm text-gray-500' aria-label='Breadcrumb'>
				<Link to='/' className='hover:text-brand-600'>
					Home
				</Link>
				<ChevronRight size={14} />
				<span className='text-gray-900'>{title}</span>
			</nav>

			<div className='mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-4'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl'>{title}</h1>
					<p className='mt-1 text-sm text-gray-600'>
						{subtitle ?? `${visibleProducts.length} ${visibleProducts.length === 1 ? "product" : "products"}`}
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<button
						className='btn-secondary px-3 py-2 lg:hidden'
						onClick={() => setShowFilters((open) => !open)}
						aria-expanded={showFilters}
					>
						<SlidersHorizontal size={16} />
						Filters
					</button>
					<label htmlFor='sort' className='sr-only'>
						Sort by
					</label>
					<select
						id='sort'
						value={sort}
						onChange={(e) => setSort(e.target.value)}
						className='input w-auto py-2'
					>
						{sortOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className='mt-6 grid gap-8 lg:grid-cols-[220px_1fr]'>
				<aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
					<div className='card space-y-6 p-5 lg:sticky lg:top-44'>
						<div className='flex items-center justify-between'>
							<h2 className='font-semibold text-gray-900'>Filters</h2>
							{hasFilters && (
								<button onClick={clearFilters} className='text-sm font-medium text-brand-600 hover:underline'>
									Clear
								</button>
							)}
						</div>

						<fieldset>
							<legend className='label'>Price ($)</legend>
							<div className='flex items-center gap-2'>
								<input
									type='number'
									min='0'
									inputMode='decimal'
									placeholder='Min'
									value={minPrice}
									onChange={(e) => setMinPrice(e.target.value)}
									className='input py-2'
									aria-label='Minimum price'
								/>
								<span className='text-gray-400'>–</span>
								<input
									type='number'
									min='0'
									inputMode='decimal'
									placeholder='Max'
									value={maxPrice}
									onChange={(e) => setMaxPrice(e.target.value)}
									className='input py-2'
									aria-label='Maximum price'
								/>
							</div>
						</fieldset>

						<label className='flex cursor-pointer items-center gap-3 text-sm text-gray-700'>
							<input
								type='checkbox'
								checked={featuredOnly}
								onChange={(e) => setFeaturedOnly(e.target.checked)}
								className='h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500'
							/>
							Featured only
						</label>
					</div>
				</aside>

				<section>
					{loading ? (
						<LoadingSpinner fullScreen={false} />
					) : visibleProducts.length === 0 ? (
						<div className='card flex flex-col items-center px-6 py-16 text-center'>
							<PackageSearch className='h-12 w-12 text-gray-300' />
							<h2 className='mt-4 text-lg font-semibold text-gray-900'>No products found</h2>
							<p className='mt-1 text-sm text-gray-600'>
								{hasFilters ? "Try changing or clearing your filters." : "Check back soon for new arrivals."}
							</p>
							{hasFilters && (
								<button onClick={clearFilters} className='btn-secondary mt-6'>
									Clear filters
								</button>
							)}
						</div>
					) : (
						<div className='grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4'>
							{visibleProducts.map((product) => (
								<ProductCard key={product._id} product={product} />
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
};

export default ProductBrowser;
