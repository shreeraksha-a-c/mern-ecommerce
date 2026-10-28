import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, ShieldCheck, Sparkles, Flame, TrendingUp, Award } from "lucide-react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import ProductCard from "../components/ProductCard";
import { categories } from "../lib/categories";

const perks = [
	{ icon: ShieldCheck, title: "Secure checkout", text: "Payments are processed safely by Stripe" },
	{ icon: Gift, title: "Earn a 10% coupon", text: "On every order of $200 or more" },
	{ icon: Sparkles, title: "Curated picks", text: "Featured products chosen by our team" },
];

const HomePage = () => {
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

	return (
		<div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
			{/* Hero Banner */}
			<section className='grid overflow-hidden rounded-2xl bg-brand-700 text-white md:grid-cols-2 shadow-lg'>
				<div className='flex flex-col justify-center p-8 sm:p-12'>
					<span className='w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider'>
						New season
					</span>
					<h1 className='mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl'>
						Style for every day, all in one place
					</h1>
					<p className='mt-4 max-w-md text-brand-100'>
						Shop jeans, jackets, shoes, bags and more, and discover the latest trends in eco-friendly
						fashion.
					</p>
					<div className='mt-8 flex flex-wrap gap-3'>
						<Link
							to='/category/jackets'
							className='inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-sm hover:bg-brand-50 transition'
						>
							Shop jackets <ArrowRight size={16} />
						</Link>
						<a
							href='#categories'
							className='inline-flex items-center rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/10 transition'
						>
							Browse categories
						</a>
					</div>
				</div>
				<div className='relative hidden min-h-[320px] md:block'>
					<img src='/jackets.jpg' alt='' className='absolute inset-0 h-full w-full object-cover' />
					<div className='absolute inset-0 bg-gradient-to-r from-brand-700 via-brand-700/20 to-transparent' />
				</div>
			</section>

			{/* Store Perks */}
			<section className='mt-6 grid gap-3 sm:grid-cols-3'>
				{perks.map(({ icon: Icon, title, text }) => (
					<div key={title} className='card flex items-center gap-4 p-4'>
						<span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600'>
							<Icon size={22} />
						</span>
						<div>
							<p className='text-sm font-semibold text-gray-900'>{title}</p>
							<p className='text-sm text-gray-600'>{text}</p>
						</div>
					</div>
				))}
			</section>

			{/* Category Grid */}
			<section id='categories' className='mt-14 scroll-mt-24'>
				<div className='flex items-end justify-between'>
					<div>
						<h2 className='text-2xl font-bold tracking-tight text-gray-900'>Shop by category</h2>
						<p className='mt-1 text-sm text-gray-600'>Find exactly what you are looking for</p>
					</div>
				</div>
				<div className='mt-5 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-7'>
					{categories.map((category) => (
						<CategoryItem category={category} key={category.slug} />
					))}
				</div>
			</section>

			{/* Product Showcases with Dynamic Tabs */}
			<section className='mt-14'>
				<div className='flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4'>
					<div>
						<h2 className='text-2xl font-bold tracking-tight text-gray-900'>Curated Collections</h2>
						<p className='mt-1 text-sm text-gray-600'>Discover our hand-picked products and customer favorites</p>
					</div>

					<div className='flex items-center gap-2'>
						<button
							onClick={() => setDisplayTab("featured")}
							className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
								displayTab === "featured"
									? "bg-brand-600 text-white shadow-sm"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							<Sparkles size={16} />
							Featured
						</button>
						<button
							onClick={() => setDisplayTab("trending")}
							className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
								displayTab === "trending"
									? "bg-brand-600 text-white shadow-sm"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							<Flame size={16} />
							Trending
						</button>
						<button
							onClick={() => setDisplayTab("bestsellers")}
							className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
								displayTab === "bestsellers"
									? "bg-brand-600 text-white shadow-sm"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							<Award size={16} />
							Bestsellers
						</button>
					</div>
				</div>

				<div className='mt-6'>
					{displayTab === "featured" && (
						<div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
							{products.map((product) => (
								<ProductCard key={product._id} product={product} />
							))}
						</div>
					)}

					{displayTab === "trending" && (
						<div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
							{(trending.length > 0 ? trending : products).map((product) => (
								<ProductCard key={product._id} product={product} />
							))}
						</div>
					)}

					{displayTab === "bestsellers" && (
						<div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
							{(bestsellers.length > 0 ? bestsellers : products).map((product) => (
								<ProductCard key={product._id} product={product} />
							))}
						</div>
					)}
				</div>
			</section>
		</div>
	);
};

export default HomePage;
