import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { useCurrencyStore } from "../stores/useCurrencyStore";
import { Heart, ShoppingCart, Trash2, ArrowRight, LogIn } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { getCategoryName } from "../lib/categories";
import toast from "react-hot-toast";

const WishlistPage = () => {
	const { wishlist, getWishlist, removeFromWishlist, loading } = useWishlistStore();
	const { addToCart } = useCartStore();
	const { user } = useUserStore();
	const { formatPrice } = useCurrencyStore();

	useEffect(() => {
		getWishlist();
	}, [getWishlist]);

	const handleMoveToCart = (product) => {
		if (product.stock !== undefined && product.stock === 0) {
			toast.error("This product is currently out of stock");
			return;
		}
		addToCart(product);
		toast.success(`Moved ${product.name} to cart!`);
	};

	if (loading && wishlist.length === 0) {
		return <LoadingSpinner />;
	}

	return (
		<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
			{/* Guest Notice Banner */}
			{!user && (
				<div className='mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900'>
					<div className='flex items-center gap-2.5'>
						<Heart size={18} className='text-rose-600 fill-rose-500 shrink-0' />
						<span>You are saving items locally on this device. Sign in to sync your wishlist across all devices.</span>
					</div>
					<Link to='/login' className='inline-flex items-center gap-1.5 font-bold text-rose-700 hover:text-rose-900 underline'>
						<LogIn size={15} /> Sign in now
					</Link>
				</div>
			)}

			<div className='border-b border-gray-200 pb-5 flex flex-wrap items-center justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-extrabold tracking-tight text-gray-900'>My Wishlist</h1>
					<p className='mt-1 text-sm text-gray-600'>
						Items you've saved for later. Keep track of what you love and move to cart anytime.
					</p>
				</div>
				<span className='rounded-full bg-rose-50 px-3.5 py-1 text-sm font-semibold text-rose-700'>
					{wishlist.length} {wishlist.length === 1 ? "item" : "items"}
				</span>
			</div>

			{wishlist.length === 0 ? (
				<div className='card mt-8 p-12 text-center'>
					<div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600'>
						<Heart size={32} />
					</div>
					<h3 className='mt-4 text-xl font-bold text-gray-900'>Your wishlist is empty</h3>
					<p className='mt-2 text-sm text-gray-500 max-w-md mx-auto'>
						Explore our collections and tap the heart icon on any product to save it here for later.
					</p>
					<Link to='/' className='btn-primary mt-6 inline-flex'>
						Start Browsing <ArrowRight size={16} />
					</Link>
				</div>
			) : (
				<div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
					{wishlist.map((product) => {
						const isOutOfStock = product.stock !== undefined && product.stock === 0;

						return (
							<div
								key={product._id}
								className='card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg'
							>
								<Link
									to={`/product/${product._id}`}
									className='relative aspect-square overflow-hidden bg-gray-100 block'
								>
									<img
										src={product.image}
										alt={product.name}
										className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
									/>
									{isOutOfStock && (
										<span className='absolute left-3 bottom-3 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm'>
											Out of stock
										</span>
									)}
								</Link>

								<div className='flex flex-1 flex-col p-4'>
									{product.category && (
										<p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
											{getCategoryName(product.category)}
										</p>
									)}
									<Link to={`/product/${product._id}`}>
										<h3 className='mt-1 line-clamp-1 font-semibold text-gray-900 transition hover:text-brand-600'>
											{product.name}
										</h3>
									</Link>
									<p className='mt-2 text-lg font-bold text-gray-900'>
										{formatPrice(product.price)}
									</p>

									<div className='mt-auto flex items-center gap-2 pt-4 border-t border-gray-100'>
										<button
											onClick={() => handleMoveToCart(product)}
											disabled={isOutOfStock}
											className='btn-primary flex-1 py-2 text-xs disabled:bg-gray-300 disabled:cursor-not-allowed'
										>
											<ShoppingCart size={15} />
											Add to Cart
										</button>
										<button
											onClick={() => removeFromWishlist(product._id)}
											className='rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600'
											aria-label={`Remove ${product.name} from wishlist`}
											title='Remove from wishlist'
										>
											<Trash2 size={16} />
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default WishlistPage;
