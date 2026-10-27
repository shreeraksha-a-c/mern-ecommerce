import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, ShieldCheck, Sparkles } from "lucide-react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import { categories } from "../lib/categories";

const perks = [
	{ icon: ShieldCheck, title: "Secure checkout", text: "Payments are processed safely by Stripe" },
	{ icon: Gift, title: "Earn a 10% coupon", text: "On every order of $200 or more" },
	{ icon: Sparkles, title: "Curated picks", text: "Featured products chosen by our team" },
];

const HomePage = () => {
	const { fetchFeaturedProducts, products, isLoading } = useProductStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	return (
		<div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
			<section className='grid overflow-hidden rounded-2xl bg-brand-700 text-white md:grid-cols-2'>
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
							className='inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-sm hover:bg-brand-50'
						>
							Shop jackets <ArrowRight size={16} />
						</Link>
						<a
							href='#categories'
							className='inline-flex items-center rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/10'
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

			<section id='categories' className='mt-14 scroll-mt-40'>
				<h2 className='text-2xl font-bold tracking-tight text-gray-900'>Shop by category</h2>
				<p className='mt-1 text-sm text-gray-600'>Find exactly what you are looking for</p>
				<div className='mt-5 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-7'>
					{categories.map((category) => (
						<CategoryItem category={category} key={category.slug} />
					))}
				</div>
			</section>

			{!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
		</div>
	);
};
export default HomePage;
