import { ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";
import LoadingSpinner from "../components/LoadingSpinner";

const PurchaseSuccessPage = () => {
	const [isProcessing, setIsProcessing] = useState(true);
	const { clearCart } = useCartStore();
	const [error, setError] = useState(null);
	const [orderId, setOrderId] = useState(null);

	useEffect(() => {
		const handleCheckoutSuccess = async (sessionId) => {
			try {
				const res = await axios.post("/payments/checkout-success", {
					sessionId,
				});
				setOrderId(res.data?.orderId ?? null);
				clearCart();
			} catch (error) {
				console.log(error);
			} finally {
				setIsProcessing(false);
			}
		};

		const sessionId = new URLSearchParams(window.location.search).get("session_id");
		if (sessionId) {
			handleCheckoutSuccess(sessionId);
		} else {
			setIsProcessing(false);
			setError("No session ID found in the URL");
		}
	}, [clearCart]);

	if (isProcessing) return <LoadingSpinner fullScreen={false} />;

	if (error) {
		return (
			<div className='mx-auto max-w-md px-4 py-16'>
				<div className='card p-8 text-center'>
					<AlertTriangle className='mx-auto h-12 w-12 text-amber-500' />
					<h1 className='mt-4 text-xl font-bold text-gray-900'>Something went wrong</h1>
					<p className='mt-2 text-sm text-gray-600'>{error}</p>
					<Link to='/' className='btn-primary mt-6'>
						Back to shop
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='mx-auto max-w-lg px-4 py-16'>
			<Confetti
				width={window.innerWidth}
				height={window.innerHeight}
				gravity={0.1}
				style={{ zIndex: 99 }}
				numberOfPieces={700}
				recycle={false}
			/>

			<div className='card p-8 text-center'>
				<span className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50'>
					<CheckCircle2 className='h-9 w-9 text-green-600' />
				</span>
				<h1 className='mt-5 text-2xl font-bold tracking-tight text-gray-900'>Thank you for your order!</h1>
				<p className='mt-2 text-gray-600'>Your payment was successful and {"we're"} processing your order now.</p>

				<dl className='mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-gray-50 text-left text-sm'>
					{orderId && (
						<div className='flex items-center justify-between gap-4 px-4 py-3'>
							<dt className='text-gray-600'>Order number</dt>
							<dd className='truncate font-mono font-semibold text-gray-900'>#{orderId}</dd>
						</div>
					)}
					<div className='flex items-center justify-between gap-4 px-4 py-3'>
						<dt className='text-gray-600'>Estimated delivery</dt>
						<dd className='font-semibold text-gray-900'>3-5 business days</dd>
					</div>
				</dl>

				<Link to='/' className='btn-primary mt-8 w-full py-3'>
					Continue shopping
					<ArrowRight size={18} />
				</Link>
			</div>
		</div>
	);
};
export default PurchaseSuccessPage;
