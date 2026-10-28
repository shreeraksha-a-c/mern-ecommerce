import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useUserStore } from "../stores/useUserStore";
import { useCurrencyStore } from "../stores/useCurrencyStore";
import {
	ShoppingCart,
	Heart,
	Truck,
	ShieldCheck,
	RotateCcw,
	ChevronRight,
	Plus,
	Minus,
	Sparkles,
	Store,
} from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/ProductCard";
import { getCategoryName } from "../lib/categories";

const ProductDetailPage = () => {
	const { id } = useParams();
	const { currentProduct, fetchProductById, fetchProductsByCategory, products, loading } = useProductStore();
	const { addToCart } = useCartStore();
	const { toggleWishlist, isInWishlist } = useWishlistStore();
	const { user } = useUserStore();
	const { formatPrice } = useCurrencyStore();

	const [quantity, setQuantity] = useState(1);

	useEffect(() => {
		if (id) {
			fetchProductById(id);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [id, fetchProductById]);

	useEffect(() => {
		if (currentProduct?.category) {
			fetchProductsByCategory(currentProduct.category);
		}
	}, [currentProduct?.category, fetchProductsByCategory]);

	if (loading && !currentProduct) {
		return <LoadingSpinner />;
	}

	if (!currentProduct) {
		return (
			<div className='mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8'>
				<h2 className='text-2xl font-bold text-gray-900'>Product not found</h2>
				<p className='mt-2 text-gray-600'>The product you are looking for does not exist or has been removed.</p>
				<Link to='/' className='btn-primary mt-6 inline-flex'>
					Back to Home
				</Link>
			</div>
		);
	}

	const isWishlisted = isInWishlist(currentProduct._id);
	const isOutOfStock = currentProduct.stock !== undefined && currentProduct.stock === 0;
	const maxAvailable = currentProduct.stock !== undefined && currentProduct.stock > 0 ? Math.min(currentProduct.stock, 10) : 10;

	const handleAddToCart = () => {
		if (!user) {
			toast.error("Please login to add products to cart", { id: "login" });
			return;
		}
		if (isOutOfStock) {
			toast.error("This product is out of stock");
			return;
		}

		for (let i = 0; i < quantity; i++) {
			addToCart(currentProduct);
		}
		toast.success(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart!`);
	};

	const handleWishlistToggle = () => {
		if (!user) {
			toast.error("Please login to save to wishlist", { id: "wishlist-login" });
			return;
		}
		toggleWishlist(currentProduct);
	};

	const relatedProducts = products?.filter((p) => p._id !== currentProduct._id).slice(0, 4) || [];

	return (
		<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
			{/* Breadcrumb */}
			<nav className='flex items-center gap-1.5 text-sm text-gray-500' aria-label='Breadcrumb'>
				<Link to='/' className='hover:text-brand-600'>
					Home
				</Link>
				<ChevronRight size={14} />
				<Link to={`/category/${currentProduct.category}`} className='hover:text-brand-600'>
					{getCategoryName(currentProduct.category)}
				</Link>
				<ChevronRight size={14} />
				<span className='line-clamp-1 text-gray-900 font-medium'>{currentProduct.name}</span>
			</nav>

			{/* Main Product Layout */}
			<div className='mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2'>
				{/* Image Gallery */}
				<div className='relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'>
					<div className='relative aspect-square w-full overflow-hidden bg-gray-50'>
						<img
							src={currentProduct.image}
							alt={currentProduct.name}
							className='h-full w-full object-cover transition-transform duration-500 hover:scale-105'
						/>
						{currentProduct.isFeatured && (
							<span className='absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow'>
								<Sparkles size={14} />
								Featured Product
							</span>
						)}
					</div>
				</div>

				{/* Product Information */}
				<div className='flex flex-col'>
					<div className='flex items-center justify-between'>
						<span className='rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700'>
							{getCategoryName(currentProduct.category)}
						</span>
						{currentProduct.vendor && (
							<span className='flex items-center gap-1 text-xs font-medium text-gray-500'>
								<Store size={14} />
								Sold by {currentProduct.vendor.name || "Verified Vendor"}
							</span>
						)}
					</div>

					<h1 className='mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl'>
						{currentProduct.name}
					</h1>

					<div className='mt-4 flex items-center gap-4'>
						<p className='text-3xl font-black text-gray-900'>
							{formatPrice(currentProduct.price)}
						</p>
						{isOutOfStock ? (
							<span className='rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700'>
								Out of Stock
							</span>
						) : currentProduct.stock !== undefined && currentProduct.stock <= 5 ? (
							<span className='rounded-md bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700'>
								Only {currentProduct.stock} left in stock!
							</span>
						) : (
							<span className='rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800'>
								In Stock
							</span>
						)}
					</div>

					<div className='mt-6 border-t border-gray-200 pt-6'>
						<h3 className='text-sm font-semibold text-gray-900'>Description</h3>
						<p className='mt-2 text-base text-gray-600 leading-relaxed whitespace-pre-line'>
							{currentProduct.description}
						</p>
					</div>

					{/* Purchase Controls */}
					<div className='mt-8 border-t border-gray-200 pt-6 space-y-4'>
						{!isOutOfStock && (
							<div className='flex items-center gap-4'>
								<span className='text-sm font-semibold text-gray-700'>Quantity:</span>
								<div className='flex items-center rounded-lg border border-gray-300 bg-white'>
									<button
										onClick={() => setQuantity((q) => Math.max(1, q - 1))}
										className='p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30'
										disabled={quantity <= 1}
										aria-label='Decrease quantity'
									>
										<Minus size={16} />
									</button>
									<span className='w-12 text-center text-sm font-semibold text-gray-900'>
										{quantity}
									</span>
									<button
										onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
										className='p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30'
										disabled={quantity >= maxAvailable}
										aria-label='Increase quantity'
									>
										<Plus size={16} />
									</button>
								</div>
							</div>
						)}

						<div className='flex flex-wrap gap-4'>
							<button
								onClick={handleAddToCart}
								disabled={isOutOfStock}
								className='btn-primary flex-1 py-3 text-base shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed'
							>
								<ShoppingCart size={20} />
								{isOutOfStock ? "Out of Stock" : "Add to Cart"}
							</button>

							<button
								onClick={handleWishlistToggle}
								className={`inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition ${
									isWishlisted
										? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
										: "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
								}`}
							>
								<Heart size={20} className={isWishlisted ? "fill-current text-rose-600" : ""} />
								{isWishlisted ? "Wishlisted" : "Save to Wishlist"}
							</button>
						</div>
					</div>

					{/* Perks */}
					<div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-gray-200 pt-6'>
						<div className='flex items-center gap-3'>
							<Truck className='h-5 w-5 text-brand-600 shrink-0' />
							<span className='text-xs text-gray-600 font-medium'>Free standard delivery over $100</span>
						</div>
						<div className='flex items-center gap-3'>
							<ShieldCheck className='h-5 w-5 text-brand-600 shrink-0' />
							<span className='text-xs text-gray-600 font-medium'>Secure checkout with Stripe</span>
						</div>
						<div className='flex items-center gap-3'>
							<RotateCcw className='h-5 w-5 text-brand-600 shrink-0' />
							<span className='text-xs text-gray-600 font-medium'>30-day money-back return policy</span>
						</div>
					</div>
				</div>
			</div>

			{/* Related Products */}
			{relatedProducts.length > 0 && (
				<section className='mt-16 border-t border-gray-200 pt-10'>
					<h2 className='text-2xl font-bold tracking-tight text-gray-900'>You may also like</h2>
					<p className='mt-1 text-sm text-gray-500'>More products from {getCategoryName(currentProduct.category)}</p>
					<div className='mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
						{relatedProducts.map((prod) => (
							<ProductCard key={prod._id} product={prod} />
						))}
					</div>
				</section>
			)}
		</div>
	);
};

export default ProductDetailPage;
