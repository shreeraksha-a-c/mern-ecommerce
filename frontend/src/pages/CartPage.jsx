import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { ShoppingCart } from "lucide-react";
import CartItem from "../components/CartItem";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import OrderSummary from "../components/OrderSummary";
import GiftCouponCard from "../components/GiftCouponCard";

const CartPage = () => {
	const { cart } = useCartStore();
	const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

	return (
		<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
			<h1 className='text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl'>Shopping cart</h1>

			{cart.length === 0 ? (
				<EmptyCartUI />
			) : (
				<>
					<div className='mt-6 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start'>
						<section className='card divide-y divide-gray-200'>
							<div className='flex items-center justify-between px-5 py-4'>
								<p className='text-sm font-medium text-gray-700'>
									{itemCount} {itemCount === 1 ? "item" : "items"}
								</p>
								<p className='hidden text-sm font-medium text-gray-500 sm:block'>Price</p>
							</div>
							{cart.map((item) => (
								<CartItem key={item._id} item={item} />
							))}
						</section>

						<aside className='space-y-4 lg:sticky lg:top-44'>
							<OrderSummary />
							<GiftCouponCard />
						</aside>
					</div>
					<PeopleAlsoBought />
				</>
			)}
		</div>
	);
};
export default CartPage;

const EmptyCartUI = () => (
	<div className='card mt-6 flex flex-col items-center px-6 py-20 text-center'>
		<span className='flex h-20 w-20 items-center justify-center rounded-full bg-brand-50'>
			<ShoppingCart className='h-10 w-10 text-brand-600' />
		</span>
		<h2 className='mt-6 text-xl font-semibold text-gray-900'>Your cart is empty</h2>
		<p className='mt-2 text-gray-600'>Looks like you {"haven't"} added anything to your cart yet.</p>
		<Link className='btn-primary mt-8 px-6' to='/'>
			Start shopping
		</Link>
	</div>
);
