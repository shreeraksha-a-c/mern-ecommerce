import { useEffect, useState } from "react";
import { ShoppingCart, LogIn, LogOut, LayoutDashboard, Search, ShoppingBag, UserRound } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { categories } from "../lib/categories";

const SearchBar = ({ className = "" }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const [query, setQuery] = useState("");

	// Keep the box in sync with the URL when landing on /search directly
	useEffect(() => {
		setQuery(location.pathname === "/search" ? searchParams.get("q") ?? "" : "");
	}, [location.pathname, searchParams]);

	const handleSubmit = (e) => {
		e.preventDefault();
		const trimmed = query.trim();
		if (!trimmed) return;
		navigate(`/search?q=${encodeURIComponent(trimmed)}`);
	};

	return (
		<form onSubmit={handleSubmit} className={`relative ${className}`} role='search'>
			<label htmlFor='site-search' className='sr-only'>
				Search products
			</label>
			<input
				id='site-search'
				type='search'
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder='Search for jeans, shoes, bags...'
				className='w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-4 pr-12 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20'
			/>
			<button
				type='submit'
				className='absolute inset-y-1 right-1 flex items-center rounded-md bg-brand-600 px-3 text-white hover:bg-brand-700'
				aria-label='Search'
			>
				<Search size={18} />
			</button>
		</form>
	);
};

const Navbar = () => {
	const { user, logout } = useUserStore();
	const isAdmin = user?.role === "admin";
	const { cart } = useCartStore();
	const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

	return (
		<header className='sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur'>
			<div className='bg-gray-900 text-center text-xs font-medium text-gray-100 py-2 px-4'>
				Spend $200 or more and get a 10% off coupon for your next order
			</div>

			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='flex h-16 items-center gap-4 lg:gap-8'>
					<Link to='/' className='flex shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight'>
						<span className='flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white'>
							<ShoppingBag size={20} />
						</span>
						<span>
							Shop<span className='text-brand-600'>Hub</span>
						</span>
					</Link>

					<SearchBar className='hidden flex-1 md:block' />

					<nav className='ml-auto flex items-center gap-1 sm:gap-2'>
						{isAdmin && (
							<Link
								to='/secret-dashboard'
								className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
							>
								<LayoutDashboard size={20} />
								<span className='hidden lg:inline'>Dashboard</span>
							</Link>
						)}

						{user ? (
							<>
								<div className='hidden items-center gap-2 px-3 text-sm text-gray-600 lg:flex'>
									<UserRound size={20} />
									<span className='max-w-[10rem] truncate'>Hi, {user.name?.split(" ")[0]}</span>
								</div>
								<button
									onClick={logout}
									className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
								>
									<LogOut size={20} />
									<span className='hidden sm:inline'>Log out</span>
								</button>
							</>
						) : (
							<>
								<Link
									to='/login'
									className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
								>
									<LogIn size={20} />
									<span className='hidden sm:inline'>Log in</span>
								</Link>
								<Link to='/signup' className='btn-primary hidden sm:inline-flex'>
									Sign up
								</Link>
							</>
						)}

						{user && (
							<Link
								to='/cart'
								className='relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
							>
								<ShoppingCart size={22} />
								<span className='hidden sm:inline'>Cart</span>
								{cartCount > 0 && (
									<span className='absolute left-6 top-0.5 min-w-[1.25rem] rounded-full bg-brand-600 px-1.5 text-center text-[11px] font-bold leading-5 text-white'>
										{cartCount}
									</span>
								)}
							</Link>
						)}
					</nav>
				</div>

				<div className='pb-3 md:hidden'>
					<SearchBar />
				</div>
			</div>

			<div className='border-t border-gray-100'>
				<nav className='mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8'>
					<NavLink
						to='/'
						end
						className={({ isActive }) =>
							`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
								isActive
									? "border-brand-600 text-brand-700"
									: "border-transparent text-gray-600 hover:text-gray-900"
							}`
						}
					>
						All
					</NavLink>
					{categories.map((category) => (
						<NavLink
							key={category.slug}
							to={`/category/${category.slug}`}
							className={({ isActive }) =>
								`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
									isActive
										? "border-brand-600 text-brand-700"
										: "border-transparent text-gray-600 hover:text-gray-900"
								}`
							}
						>
							{category.name}
						</NavLink>
					))}
				</nav>
			</div>
		</header>
	);
};
export default Navbar;
