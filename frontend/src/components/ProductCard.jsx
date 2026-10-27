import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { getCategoryName } from "../lib/categories";

const ProductCard = ({ product }) => {
	const { user } = useUserStore();
	const { addToCart } = useCartStore();
	const handleAddToCart = () => {
		if (!user) {
			toast.error("Please login to add products to cart", { id: "login" });
			return;
		} else {
			// add to cart
			addToCart(product);
		}
	};

	return (
		<div className='group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg'>
			<div className='relative aspect-square overflow-hidden bg-gray-100'>
				<img
					className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
					src={product.image}
					alt={product.name}
					loading='lazy'
				/>
				{product.isFeatured && (
					<span className='absolute left-3 top-3 rounded-md bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950'>
						Featured
					</span>
				)}
			</div>

			<div className='flex flex-1 flex-col p-4'>
				{product.category && (
					<p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
						{getCategoryName(product.category)}
					</p>
				)}
				<h3 className='mt-1 line-clamp-1 font-semibold text-gray-900'>{product.name}</h3>
				{product.description && (
					<p className='mt-1 line-clamp-2 text-sm text-gray-600'>{product.description}</p>
				)}
				<div className='mt-auto flex items-center justify-between gap-3 pt-4'>
					<p className='text-lg font-bold text-gray-900'>${Number(product.price).toFixed(2)}</p>
					<button className='btn-primary px-3 py-2' onClick={handleAddToCart}>
						<ShoppingCart size={16} />
						Add
					</button>
				</div>
			</div>
		</div>
	);
};
export default ProductCard;
