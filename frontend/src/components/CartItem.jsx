import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { useCurrencyStore } from "../stores/useCurrencyStore";
import { getCategoryName } from "../lib/categories";

const CartItem = ({ item }) => {
	const { removeFromCart, updateQuantity } = useCartStore();
	const { formatPrice } = useCurrencyStore();

	return (
		<div className='flex gap-4 p-5'>
			<Link to={`/product/${item._id}`} className='shrink-0'>
				<img
					className='h-24 w-24 rounded-lg border border-gray-200 object-cover sm:h-28 sm:w-28 transition hover:opacity-90'
					src={item.image}
					alt={item.name}
				/>
			</Link>

			<div className='flex min-w-0 flex-1 flex-col'>
				<div className='flex justify-between gap-4'>
					<div className='min-w-0'>
						{item.category && (
							<p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
								{getCategoryName(item.category)}
							</p>
						)}
						<Link to={`/product/${item._id}`}>
							<h3 className='mt-0.5 truncate font-semibold text-gray-900 hover:text-brand-600 transition'>{item.name}</h3>
						</Link>
						<p className='mt-1 line-clamp-2 text-sm text-gray-600'>{item.description}</p>
					</div>
					<div className='shrink-0 text-right'>
						<p className='font-bold text-gray-900'>{formatPrice(item.price * item.quantity)}</p>
						{item.quantity > 1 && (
							<p className='text-xs text-gray-500'>{formatPrice(item.price)} each</p>
						)}
					</div>
				</div>

				<div className='mt-auto flex items-center justify-between pt-3'>
					<div className='flex items-center rounded-lg border border-gray-300'>
						<button
							className='flex h-8 w-8 items-center justify-center rounded-l-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
							onClick={() => updateQuantity(item._id, item.quantity - 1)}
							aria-label={`Decrease quantity of ${item.name}`}
						>
							<Minus size={14} />
						</button>
						<span className='w-8 text-center text-sm font-semibold' aria-live='polite'>
							{item.quantity}
						</span>
						<button
							className='flex h-8 w-8 items-center justify-center rounded-r-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
							onClick={() => updateQuantity(item._id, item.quantity + 1)}
							aria-label={`Increase quantity of ${item.name}`}
						>
							<Plus size={14} />
						</button>
					</div>

					<button
						className='inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600'
						onClick={() => removeFromCart(item._id)}
					>
						<Trash2 size={16} />
						Remove
					</button>
				</div>
			</div>
		</div>
	);
};
export default CartItem;
