import toast from "react-hot-toast";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useCurrencyStore } from "../stores/useCurrencyStore";
import { getCategoryName } from "../lib/categories";

const ProductCard = ({ product }) => {
	const { user } = useUserStore();
	const { addToCart } = useCartStore();
	const { toggleWishlist, isInWishlist } = useWishlistStore();
	const { formatPrice } = useCurrencyStore();

	const isWishlisted = isInWishlist(product._id);
	const isOutOfStock = product.stock !== undefined && product.stock === 0;

	const handleAddToCart = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (!user) {
			toast.error("Please login to add products to cart", { id: "login" });
			return;
		}
		if (isOutOfStock) {
			toast.error("Sorry, this item is out of stock!");
			return;
		}
		addToCart(product);
	};

	const handleWishlistToggle = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (!user) {
			toast.error("Please login to save to wishlist", { id: "wishlist-login" });
			return;
		}
		toggleWishlist(product);
	};

	return (
		<div className='group flex h-full flex-col'>
			<Link to={`/product/${product._id}`} className='relative block aspect-[3/4] overflow-hidden bg-gray-100'>
				<img
					className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
					src={product.image}
					alt={product.name}
					loading='lazy'
				/>

				{product.isFeatured && (
					<span className='absolute left-3 top-3 bg-white/90 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-900'>
						Featured
					</span>
				)}

				{isOutOfStock ? (
					<span className='absolute left-3 bottom-3 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm'>
						Out of stock
					</span>
				) : product.stock !== undefined && product.stock <= 5 && product.stock > 0 ? (
					<span className='absolute left-3 bottom-3 rounded-md bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm'>
						Only {product.stock} left
					</span>
				) : null}

				<button
					onClick={handleWishlistToggle}
					aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
					className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow transition hover:scale-110 hover:bg-white ${
						isWishlisted ? "text-rose-600" : "text-gray-400 hover:text-rose-500"
					}`}
				>
					<Heart size={18} className={isWishlisted ? "fill-current" : ""} />
				</button>
			</Link>

			<div className='flex flex-1 flex-col pt-3'>
				{product.category && (
					<p className='text-[10px] font-medium uppercase tracking-[0.25em] text-gray-500'>
						{getCategoryName(product.category)}
					</p>
				)}
				<Link to={`/product/${product._id}`}>
					<h3 className='mt-1 line-clamp-1 text-sm font-medium text-gray-900 transition hover:text-brand-600'>
						{product.name}
					</h3>
				</Link>
				<div className='mt-auto flex items-center justify-between gap-3 pt-3'>
					<p className='text-sm font-medium text-gray-900'>{formatPrice(product.price)}</p>
					<button
						className='btn-primary px-3 py-2 disabled:bg-gray-300 disabled:cursor-not-allowed'
						onClick={handleAddToCart}
						disabled={isOutOfStock}
					>
						<ShoppingCart size={16} />
						{isOutOfStock ? "Out of stock" : "Add"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
