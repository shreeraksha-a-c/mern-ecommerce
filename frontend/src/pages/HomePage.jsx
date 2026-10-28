import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import ProductCard from "../components/ProductCard";
//import { categories } from "../lib/categories";
import { useCategoryStore } from "../stores/useCategoryStore";

const perks = [
	{ icon: ShieldCheck, title: "Secure checkout", text: "Payments are processed safely by Stripe" },
	{ icon: Gift, title: "Earn a 10% coupon", text: "On every order of $200 or more" },
	{ icon: Sparkles, title: "Curated picks", text: "Featured products chosen by our team" },
];

const HomePage = () => {
	const categories = useCategoryStore((s) => s.categories);
	const {
		fetchFeaturedProducts,
		products,
		fetchTrending,
		trending,
		fetchBestsellers,
		bestsellers,
		loading,
	} = useProductStore();

	const [displayTab, setDisplayTab] = useState("featured");

	useEffect(() => {
		fetchFeaturedProducts();
		fetchTrending();
		fetchBestsellers();
	}, [fetchFeaturedProducts, fetchTrending, fetchBestsellers]);

	const tabs = [
		{ id: "featured", label: "Featured" },
		{ id: "trending", label: "Trending" },
		{ id: "bestsellers", label: "Bestsellers" },
	];

	const shownProducts =
		displayTab === "trending"
			? trending.length > 0
				? trending
				: products
			: displayTab === "bestsellers"
				? bestsellers.length > 0
					? bestsellers
					: products
				: products;

	return (
		<div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
			{/* Hero Banner: full photo with text over a dark overlay */}
			<section className='relative isolate overflow-hidden bg-gray-950 text-white'>
				<img src='/jackets.jpg' alt='' className='absolute inset-0 -z-10 h-full w-full object-cover opacity-70' />
				<div className='absolute inset-0 -z-10 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-gray-950/10' />
				<div className='flex min-h-[420px] flex-col justify-end p-8 sm:p-12 lg:min-h-[500px]'>
					<span className='text-[11px] font-medium uppercase tracking-[0.35em] text-gray-200'>New season</span>
					<h1 className='mt-4 max-w-2xl text-4xl font-medium leading-tight sm:text-6xl'>
						Style for every day, all in one place
					</h1>
					<p className='mt-4 max-w-md text-sm text-gray-200 sm:text-base'>
						Shop jeans, jackets, shoes, bags and more, and discover the latest trends in eco-friendly
						fashion.
					</p>
					<div className='mt-8 flex flex-wrap items-center gap-8'>
						<Link
							to='/category/jackets'
							className='inline-flex items-center gap-2 border-b border-white pb-1 text-xs font-medium uppercase tracking-[0.25em] transition hover:border-gray-300 hover:text-gray-300'
						>
							Shop jackets <ArrowRight size={14} />
						</Link>
						<a
							href='#categories'
							className='text-xs font-medium uppercase tracking-[0.25em] text-gray-300 transition hover:text-white'
						>
							Browse categories
						</a>
					</div>
				</div>
			</section>

			{/* Store Perks: one thin strip under the hero */}
			<section className='grid border-b border-gray-200 sm:grid-cols-3 sm:divide-x sm:divide-gray-200'>
				{perks.map(({ icon: Icon, title, text }) => (
					<div key={title} className='flex items-center gap-4 px-2 py-6 sm:px-6'>
						<Icon size={22} strokeWidth={1.5} className='shrink-0 text-gray-700' />
						<div>
							<p className='text-[11px] font-medium uppercase tracking-[0.2em] text-gray-900'>{title}</p>
							<p className='mt-1 text-sm text-gray-600'>{text}</p>
						</div>
					</div>
				))}
			</section>

			{/* Category Grid */}
			<section id='categories' className='mt-16 scroll-mt-24'>
				<p className='eyebrow'>Categories</p>
				<h2 className='mt-2 text-2xl font-medium text-gray-900 sm:text-3xl'>Shop by category</h2>
				<div className='mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-7'>
					{categories.map((category) => (
						<CategoryItem category={category} key={category.slug} />
					))}
				</div>
			</section>

			{/* Product Showcases with Dynamic Tabs */}
			<section className='mt-16'>
				<div className='flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-4'>
					<div>
						<p className='eyebrow'>Collections</p>
						<h2 className='mt-2 text-2xl font-medium text-gray-900 sm:text-3xl'>Curated collections</h2>
					</div>
					<div className='flex items-center gap-6'>
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setDisplayTab(tab.id)}
								className={`border-b-2 pb-1 text-xs font-medium uppercase tracking-[0.2em] transition ${
									displayTab === tab.id
										? "border-gray-900 text-gray-900"
										: "border-transparent text-gray-500 hover:text-gray-900"
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>

				<div className='mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4'>
					{shownProducts.map((product) => (
						<ProductCard key={product._id} product={product} />
					))}
				</div>
			</section>
		</div>
	);
};

export default HomePage;
