import { useState } from "react";
import { X } from "lucide-react";

const EditProductModal = ({ product, onClose, onSave }) => {
	const [price, setPrice] = useState(String(product.price));
	const [stock, setStock] = useState(String(product.stock ?? 0));
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		const priceNum = Number(price);
		const stockNum = Number(stock);
		if (price.trim() === "" || Number.isNaN(priceNum) || priceNum < 0) {
			return setError("Price must be a number, 0 or more");
		}
		if (stock.trim() === "" || !Number.isInteger(stockNum) || stockNum < 0) {
			return setError("Stock must be a whole number, 0 or more");
		}
		setError("");
		setSaving(true);
		const ok = await onSave({ price: priceNum, stock: stockNum });
		setSaving(false);
		if (ok) onClose();
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
			<div className='card w-full max-w-sm p-6'>
				<div className='flex items-center justify-between border-b pb-3'>
					<h3 className='text-lg font-bold text-gray-900'>Edit product</h3>
					<button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
						<X size={18} />
					</button>
				</div>
				<p className='mt-3 truncate text-sm text-gray-600'>{product.name}</p>

				<form onSubmit={handleSubmit} className='mt-4 space-y-4'>
					<div>
						<label className='label'>Price (₹)</label>
						<input
							type='number'
							min='0'
							step='0.01'
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							className='input'
						/>
					</div>
					<div>
						<label className='label'>Stock</label>
						<input
							type='number'
							min='0'
							step='1'
							value={stock}
							onChange={(e) => setStock(e.target.value)}
							className='input'
						/>
					</div>
					{error && <p className='text-sm text-red-600'>{error}</p>}
					<div className='flex justify-end gap-3 border-t pt-4'>
						<button type='button' onClick={onClose} className='btn-secondary'>
							Cancel
						</button>
						<button type='submit' disabled={saving} className='btn-primary'>
							{saving ? "Saving..." : "Save"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
export default EditProductModal;