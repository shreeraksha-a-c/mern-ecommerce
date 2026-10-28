//import { loadStripe } from "@stripe/stripe-js";
import { useCartStore } from "../stores/useCartStore";
import { useCurrencyStore } from "../stores/useCurrencyStore";
import { Link } from "react-router-dom";
import { Lock, MoveRight } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../lib/axios";

const OrderSummary = () => {
	const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();
	//const { formatPrice } = useCurrencyStore();
	const { formatPrice, currentCurrency } = useCurrencyStore();

	const savings = subtotal - total;
	const formattedSubtotal = formatPrice(subtotal);
	const formattedTotal = formatPrice(total);
	const formattedSavings = formatPrice(savings);
	const amountToCoupon = 500 - total; // INR, same as REWARD_THRESHOLD_INR on the backend

	const handlePayment = async () => {
		try {
			const res = await axios.post("/payments/create-checkout-session", {
				products: cart,
				couponCode: coupon ? coupon.code : null,
				currency: currentCurrency,
			});

			if (!res.data?.url) throw new Error("No checkout URL returned");
			window.location.href = res.data.url; // go straight to Stripe's page
		} catch (error) {
			console.error("Checkout error:", error);
			toast.error(
				error.response?.data?.message || error.response?.data?.error || error.message || "Checkout failed"
			);
		}
	};

	return (
		<div className='card space-y-4 p-5'>
			<h2 className='text-lg font-semibold text-gray-900'>Order summary</h2>

			<dl className='space-y-3 text-sm'>
				<div className='flex items-center justify-between gap-4'>
					<dt className='text-gray-600'>Subtotal</dt>
					<dd className='font-medium text-gray-900'>{formattedSubtotal}</dd>
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
						<dd className='font-medium text-green-700'>-{formattedSavings}</dd>
					</div>
				)}

				<div className='flex items-center justify-between gap-4 border-t border-gray-200 pt-3'>
					<dt className='text-base font-semibold text-gray-900'>Total</dt>
					<dd className='text-xl font-bold text-gray-900'>{formattedTotal}</dd>
				</div>
			</dl>

			{amountToCoupon > 0 ? (
				<p className='rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800'>
					Add <strong>{formatPrice(amountToCoupon)}</strong> more to earn a 10% coupon for your next order.
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
