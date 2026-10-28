import { useEffect, useState, useRef } from "react";
import {
	ShoppingCart,
	LogIn,
	LogOut,
	LayoutDashboard,
	Search,
	UserRound,
	Heart,
	Package,
	Store,
	ChevronDown,
	Globe,
	Sparkles,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useCurrencyStore, CURRENCIES } from "../stores/useCurrencyStore";
import { categories } from "../lib/categories";

const SearchBar = ({ className = "" }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const [query, setQuery] = useState("");

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
				className='absolute inset-y-1 right-1 flex items-center rounded-md bg-gray-900 px-3 text-white hover:bg-gray-800 transition'
				aria-label='Search'
			>
				<Search size={18} />
			</button>
		</form>
	);
};

const departmentSections = [
	{
		id: "women",
		label: "Women",
		description: "Trending fashion, accessories and footwear for women",
		categories: categories,
	},
	{
		id: "men",
		label: "Men",
		description: "Modern wardrobe essentials, suits and footwear for men",
		categories: categories,
	},
	{
		id: "kids",
		label: "Kids",
		description: "Playful, comfortable outfits and gear for kids",
		categories: categories.filter((c) => c.slug !== "suits"),
	},
];

const Navbar = () => {
	const { user, logout } = useUserStore();
	const isAdmin = user?.role === "admin";
	const isVendor = user?.role === "vendor";

	const { cart } = useCartStore();
	const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

	const { wishlist, getWishlist } = useWishlistStore();
	const wishlistCount = wishlist.length;

	const { currentCurrency, setCurrency } = useCurrencyStore();

	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState(null);
	const userMenuRef = useRef(null);
	const navDropdownRef = useRef(null);

	useEffect(() => {
	if (user) getWishlist();
	}, [getWishlist, user]);

	// Close menus on outside click
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
				setUserMenuOpen(false);
			}
			if (navDropdownRef.current && !navDropdownRef.current.contains(e.target)) {
				setActiveDropdown(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<header className='sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur'>
			{/* Top Announcement & Currency Selector Bar */}
			<div className='bg-gray-900 text-xs font-medium text-gray-200 py-1.5 px-4'>
				<div className='mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2'>
					<p className='truncate'>
						✨ Spend ₹2,000 or more and get a 10% off coupon for your next order!
					</p>

					{/* Currency Selector */}
					<div className='flex items-center gap-1.5 ml-auto'>
						<Globe size={13} className='text-gray-400' />
						<label htmlFor='currency-select' className='text-gray-400 text-[11px] font-normal'>
							Currency:
						</label>
						<select
							id='currency-select'
							value={currentCurrency}
							onChange={(e) => setCurrency(e.target.value)}
							className='rounded bg-gray-800 border-gray-700 py-0.5 px-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-400 cursor-pointer'
						>
							{Object.values(CURRENCIES).map((c) => (
								<option key={c.code} value={c.code}>
									{c.name}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Main Navigation Bar */}
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='flex h-16 items-center gap-4 lg:gap-8'>
					{/* Logo */}
					<Link to='/' className='shrink-0 text-lg font-semibold uppercase tracking-[0.3em] text-gray-900'>
						Wardrobe
					</Link>

					{/* Desktop Search Bar */}
					<SearchBar className='hidden flex-1 md:block' />

					{/* Action Buttons */}
					<nav className='ml-auto flex items-center gap-1 sm:gap-2'>
						{/* Wishlist Link - ALWAYS VISIBLE */}
						<Link
							to='/wishlist'
							className='relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition'
							title='Wishlist'
						>
							<Heart size={21} className={wishlistCount > 0 ? "text-rose-600 fill-rose-500" : "text-gray-600"} />
							<span className='hidden sm:inline font-medium'>Wishlist</span>
							{wishlistCount > 0 && (
								<span className='absolute left-6 top-1 min-w-[1.2rem] rounded-full bg-rose-600 px-1 text-center text-[10px] font-bold leading-4 text-white shadow-sm'>
									{wishlistCount}
								</span>
							)}
						</Link>

						{/* Cart Link - ALWAYS VISIBLE */}
						<Link
							to='/cart'
							className='relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition'
							title='Shopping Cart'
						>
							<ShoppingCart size={21} className='text-gray-600' />
							<span className='hidden sm:inline font-medium'>Cart</span>
							{cartCount > 0 && (
								<span className='absolute left-6 top-1 min-w-[1.2rem] rounded-full bg-brand-600 px-1 text-center text-[10px] font-bold leading-4 text-white shadow-sm'>
									{cartCount}
								</span>
							)}
						</Link>

						{/* User Account / Auth */}
						{user ? (
							<div className='relative' ref={userMenuRef}>
								<button
									onClick={() => setUserMenuOpen((prev) => !prev)}
									className='flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-1.5 px-3 text-sm font-medium text-gray-800 hover:bg-gray-100 transition'
								>
									<span className='flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white'>
										{user.name?.charAt(0).toUpperCase()}
									</span>
									<span className='hidden max-w-[8rem] truncate font-semibold sm:inline'>
										{user.name?.split(" ")[0]}
									</span>
									<ChevronDown size={14} className='text-gray-500' />
								</button>

								{/* Dropdown Menu */}
								{userMenuOpen && (
									<div className='absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl ring-1 ring-black/5 z-50'>
										<div className='border-b border-gray-100 px-4 py-2.5'>
											<p className='text-xs text-gray-500'>Signed in as</p>
											<p className='truncate text-sm font-bold text-gray-900'>{user.name}</p>
											<span className='mt-0.5 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-700'>
												{user.role}
											</span>
										</div>

										<div className='py-1'>
											<Link
												to='/profile'
												onClick={() => setUserMenuOpen(false)}
												className='flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition'
											>
												<UserRound size={16} className='text-gray-500' />
												Profile & Address
											</Link>
											<Link
												to='/orders'
												onClick={() => setUserMenuOpen(false)}
												className='flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition'
											>
												<Package size={16} className='text-gray-500' />
												My Orders
											</Link>
											<Link
												to='/wishlist'
												onClick={() => setUserMenuOpen(false)}
												className='flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition'
											>
												<Heart size={16} className='text-gray-500' />
												Saved Wishlist
											</Link>

											{isVendor && (
												<Link
													to='/vendor-dashboard'
													onClick={() => setUserMenuOpen(false)}
													className='flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition'
												>
													<Store size={16} className='text-emerald-600' />
													Vendor Portal
												</Link>
											)}

											{isAdmin && (
												<Link
													to='/secret-dashboard'
													onClick={() => setUserMenuOpen(false)}
													className='flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition'
												>
													<LayoutDashboard size={16} className='text-brand-600' />
													Admin Dashboard
												</Link>
											)}
										</div>

										<div className='border-t border-gray-100 pt-1'>
											<button
												onClick={() => {
													setUserMenuOpen(false);
													logout();
												}}
												className='flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition'
											>
												<LogOut size={16} />
												Log out
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<div className='flex items-center gap-2'>
								<Link
									to='/login'
									className='flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition'
								>
									<LogIn size={18} />
									<span className='hidden sm:inline'>Log in</span>
								</Link>
								<Link to='/signup' className='btn-primary py-2 px-3.5 text-xs font-semibold'>
									Sign up
								</Link>
							</div>
						)}
					</nav>
				</div>

				{/* Mobile Search Bar */}
				<div className='pb-3 md:hidden'>
					<SearchBar />
				</div>
			</div>

			{/* Sub-Header: Women, Men, Kids with Nested Category Dropdowns */}
			<div className='border-t border-gray-100 relative' ref={navDropdownRef}>
				<nav className='mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8 overflow-visible'>
					<NavLink
						to='/'
						end
						className={({ isActive }) =>
							`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
								isActive
									? "border-brand-600 text-brand-700"
									: "border-transparent text-gray-700 hover:text-brand-600"
							}`
						}
					>
						All Products
					</NavLink>

					{departmentSections.map((dept) => {
						const isOpen = activeDropdown === dept.id;

						return (
							<div
								key={dept.id}
								className='relative'
								onMouseEnter={() => setActiveDropdown(dept.id)}
								onMouseLeave={() => setActiveDropdown(null)}
							>
								<button
									onClick={() => setActiveDropdown(isOpen ? null : dept.id)}
									className={`flex items-center gap-1 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors ${
										isOpen
											? "border-brand-600 text-brand-700"
											: "border-transparent text-gray-700 hover:text-brand-600"
									}`}
								>
									<span>{dept.label}</span>
									<ChevronDown
										size={14}
										className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
									/>
								</button>

								{/* Dropdown Menu for each department */}
								{isOpen && (
									<div className='absolute left-0 top-full z-50 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1'>
										<div className='border-b border-gray-100 pb-2 mb-2 px-2'>
											<p className='text-xs font-bold uppercase tracking-wider text-brand-700'>
												{dept.label}'s Department
											</p>
											<p className='text-[11px] text-gray-500 mt-0.5'>{dept.description}</p>
										</div>

										<div className='grid grid-cols-2 gap-1'>
											{dept.categories.map((cat) => (
												<Link
													key={cat.slug}
													to={`/category/${cat.slug}?gender=${dept.id}`}
													onClick={() => setActiveDropdown(null)}
													className='flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition'
												>
													<span className='h-1.5 w-1.5 rounded-full bg-brand-400' />
													<span>{cat.name}</span>
												</Link>
											))}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</nav>
			</div>
		</header>
	);
};

export default Navbar;
