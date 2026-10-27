import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { Lock, MoveRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";

const stripePromise = loadStripe(
	"pk_test_51KZYccCoOZF2UhtOwdXQl3vcizup20zqKqT9hVUIsVzsdBrhqbUI2fE0ZdEVLdZfeHjeyFXtqaNsyCJCmZWnjNZa00PzMAjlcL"
);

const OrderSummary = () => {
	const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();

	const savings = subtotal - total;
	const formattedSubtotal = subtotal.toFixed(2);
	const formattedTotal = total.toFixed(2);
	const formattedSavings = savings.toFixed(2);
	const amountToCoupon = 200 - total;

	const handlePayment = async () => {
		const stripe = await stripePromise;
		const res = await axios.post("/payments/create-checkout-session", {
			products: cart,
			couponCode: coupon ? coupon.code : null,
		});

		const session = res.data;
		const result = await stripe.redirectToCheckout({
			sessionId: session.id,
		});

		if (result.error) {
			console.error("Error:", result.error);
		}
	};

	return (
		<div className='card space-y-4 p-5'>
			<h2 className='text-lg font-semibold text-gray-900'>Order summary</h2>

			<dl className='space-y-3 text-sm'>
				<div className='flex items-center justify-between gap-4'>
					<dt className='text-gray-600'>Subtotal</dt>
					<dd className='font-medium text-gray-900'>${formattedSubtotal}</dd>
				</div>

				{coupon && isCouponApplied && (
					<div className='flex items-center justify-between gap-4'>
						<dt className='text-gray-600'>
							Coupon <span className='rounded bg-green-50 px-1.5 py-0.5 font-mono text-xs text-green-700'>{coupon.code}</span>
						</dt>
						<dd className='font-medium text-green-700'>-{coupon.discountPercentage}%</dd>
					</div>
				)}

				{savings > 0 && (
					<div className='flex items-center justify-between gap-4'>
						<dt className='text-gray-600'>You save</dt>
						<dd className='font-medium text-green-700'>-${formattedSavings}</dd>
					</div>
				)}

				<div className='flex items-center justify-between gap-4 border-t border-gray-200 pt-3'>
					<dt className='text-base font-semibold text-gray-900'>Total</dt>
					<dd className='text-xl font-bold text-gray-900'>${formattedTotal}</dd>
				</div>
			</dl>

			{amountToCoupon > 0 ? (
				<p className='rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800'>
					Add <strong>${amountToCoupon.toFixed(2)}</strong> more to earn a 10% coupon for your next order.
				</p>
			) : (
				<p className='rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800'>
					This order earns you a 10% coupon for next time.
				</p>
			)}

			<button className='btn-primary w-full py-3 text-base' onClick={handlePayment}>
				<Lock size={16} />
				Proceed to checkout
			</button>

			<Link
				to='/'
				className='flex items-center justify-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700'
			>
				Continue shopping
				<MoveRight size={16} />
			</Link>
		</div>
	);
};
export default OrderSummary;
