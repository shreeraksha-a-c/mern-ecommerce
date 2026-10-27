import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { categories } from "../lib/categories";

const Footer = () => {
	return (
		<footer className='mt-16 border-t border-gray-200 bg-white'>
			<div className='mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8'>
				<div className='lg:col-span-2'>
					<Link to='/' className='flex items-center gap-2 text-lg font-extrabold tracking-tight'>
						<span className='flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white'>
							<ShoppingBag size={18} />
						</span>
						<span>
							Shop<span className='text-brand-600'>Hub</span>
						</span>
					</Link>
					<p className='mt-4 max-w-sm text-sm text-gray-600'>
						Everyday fashion in one place: jeans, shoes, jackets, bags and more, with secure checkout
						powered by Stripe.
					</p>
				</div>

				<div>
					<h3 className='text-sm font-semibold text-gray-900'>Shop</h3>
					<ul className='mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600 sm:grid-cols-1'>
						{categories.map((category) => (
							<li key={category.slug}>
								<Link to={`/category/${category.slug}`} className='hover:text-brand-600'>
									{category.name}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className='text-sm font-semibold text-gray-900'>Account</h3>
					<ul className='mt-4 space-y-2 text-sm text-gray-600'>
						<li>
							<Link to='/cart' className='hover:text-brand-600'>
								Your cart
							</Link>
						</li>
						<li>
							<Link to='/login' className='hover:text-brand-600'>
								Log in
							</Link>
						</li>
						<li>
							<Link to='/signup' className='hover:text-brand-600'>
								Create account
							</Link>
						</li>
					</ul>
				</div>
			</div>
			<div className='border-t border-gray-100 py-5 text-center text-xs text-gray-500'>
				© {new Date().getFullYear()} ShopHub. All rights reserved.
			</div>
		</footer>
	);
};
export default Footer;
