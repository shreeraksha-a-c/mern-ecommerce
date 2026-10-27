import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const PurchaseCancelPage = () => {
	return (
		<div className='mx-auto max-w-lg px-4 py-16'>
			<div className='card p-8 text-center'>
				<span className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50'>
					<XCircle className='h-9 w-9 text-red-600' />
				</span>
				<h1 className='mt-5 text-2xl font-bold tracking-tight text-gray-900'>Checkout cancelled</h1>
				<p className='mt-2 text-gray-600'>Your order was cancelled and no charges have been made.</p>
				<p className='mt-6 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600'>
					Your items are still in your cart whenever you are ready.
				</p>

				<div className='mt-8 flex flex-col gap-3 sm:flex-row'>
					<Link to='/cart' className='btn-primary flex-1 py-3'>
						<ShoppingCart size={18} />
						Back to cart
					</Link>
					<Link to='/' className='btn-secondary flex-1 py-3'>
						<ArrowLeft size={18} />
						Return to shop
					</Link>
				</div>
			</div>
		</div>
	);
};

export default PurchaseCancelPage;
