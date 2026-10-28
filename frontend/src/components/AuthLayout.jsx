import { CheckCircle2 } from "lucide-react";

const benefits = [
	"Save items to your cart across devices",
	"Secure checkout powered by Stripe",
	"Earn a 10% coupon on orders over ₹500",
];

// Two-column auth screen: benefits panel on large screens, form card always
const AuthLayout = ({ title, subtitle, children, footer }) => {
	return (
		<div className='mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-16'>
			<div className='card grid overflow-hidden lg:grid-cols-2'>
				<div className='relative hidden bg-gray-950 p-10 text-white lg:block'>
					<img src='/suits.jpg' alt='' className='absolute inset-0 h-full w-full object-cover opacity-40' />
					<div className='relative'>
						<h2 className='text-3xl font-medium'>Welcome to Wardrobe</h2>
						<p className='mt-3 text-gray-200'>Everything you need for your wardrobe, in one place.</p>
						<ul className='mt-10 space-y-4'>
							{benefits.map((benefit) => (
								<li key={benefit} className='flex items-center gap-3'>
									<CheckCircle2 className='h-5 w-5 shrink-0 text-gray-300' />
									<span className='text-sm'>{benefit}</span>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className='p-6 sm:p-10'>
					<h1 className='text-2xl font-bold tracking-tight text-gray-900'>{title}</h1>
					<p className='mt-1 text-sm text-gray-600'>{subtitle}</p>
					<div className='mt-8'>{children}</div>
					<p className='mt-8 text-center text-sm text-gray-600'>{footer}</p>
				</div>
			</div>
		</div>
	);
};

export default AuthLayout;
