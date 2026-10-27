import { useEffect, useState } from "react";
import { Tag, X } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

const GiftCouponCard = () => {
	const [userInputCode, setUserInputCode] = useState("");
	const { coupon, isCouponApplied, applyCoupon, getMyCoupon, removeCoupon } = useCartStore();

	useEffect(() => {
		getMyCoupon();
	}, [getMyCoupon]);

	useEffect(() => {
		if (coupon) setUserInputCode(coupon.code);
	}, [coupon]);

	const handleApplyCoupon = () => {
		if (!userInputCode) return;
		applyCoupon(userInputCode);
	};

	const handleRemoveCoupon = async () => {
		await removeCoupon();
		setUserInputCode("");
	};

	return (
		<div className='card space-y-4 p-5'>
			<div>
				<label htmlFor='voucher' className='label'>
					Voucher or gift card
				</label>
				<div className='flex gap-2'>
					<input
						type='text'
						id='voucher'
						className='input uppercase placeholder:normal-case'
						placeholder='Enter code'
						value={userInputCode}
						onChange={(e) => setUserInputCode(e.target.value)}
						required
					/>
					<button type='button' className='btn-secondary shrink-0' onClick={handleApplyCoupon}>
						Apply
					</button>
				</div>
			</div>

			{isCouponApplied && coupon && (
				<div className='flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2'>
					<p className='flex items-center gap-2 text-sm text-green-800'>
						<Tag size={16} />
						<span>
							<span className='font-mono font-semibold'>{coupon.code}</span> applied ({coupon.discountPercentage}%
							off)
						</span>
					</p>
					<button
						type='button'
						onClick={handleRemoveCoupon}
						className='rounded p-1 text-green-800 hover:bg-green-100'
						aria-label='Remove coupon'
					>
						<X size={16} />
					</button>
				</div>
			)}

			{coupon && !isCouponApplied && (
				<p className='flex items-center gap-2 text-sm text-gray-600'>
					<Tag size={16} className='text-brand-600' />
					<span>
						You have a coupon: <span className='font-mono font-semibold text-gray-900'>{coupon.code}</span> (
						{coupon.discountPercentage}% off)
					</span>
				</p>
			)}
		</div>
	);
};
export default GiftCouponCard;
