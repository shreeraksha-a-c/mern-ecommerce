import { useState } from "react";
import { Trash2, Star, Pencil } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useCurrencyStore } from "../stores/useCurrencyStore";
import { getCategoryName } from "../lib/categories";
import { Link } from "react-router-dom";
import EditProductModal from "./EditProductModal";

const ProductsList = () => {
	const { deleteProduct, toggleFeaturedProduct, updateProduct, products } = useProductStore();
	const { formatPrice } = useCurrencyStore();
	const [editing, setEditing] = useState(null);

	return (
		<div className='card overflow-hidden'>
			<div className='flex items-center justify-between border-b border-gray-200 px-5 py-4'>
				<div>
					<h2 className='text-lg font-semibold text-gray-900'>All products</h2>
					<p className='text-xs text-gray-500'>View, edit price & stock, or toggle featured status.</p>
				</div>
				<span className='text-sm text-gray-500'>{products?.length ?? 0} total</span>
			</div>

			<div className='overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-200 text-sm'>
					<thead className='bg-gray-50'>
						<tr>
							{["Product", "Price", "Category", "Stock", "Featured", "Actions"].map((heading) => (
								<th
									key={heading}
									scope='col'
									className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'
								>
									{heading}
								</th>
							))}
						</tr>
					</thead>

					<tbody className='divide-y divide-gray-100 bg-white'>
						{products?.map((product) => (
							<tr key={product._id} className='hover:bg-gray-50'>
								<td className='whitespace-nowrap px-5 py-3'>
									<div className='flex items-center gap-3'>
										<img
											className='h-11 w-11 rounded-lg border border-gray-200 object-cover'
											src={product.image}
											alt={product.name}
										/>
										<Link
											to={`/product/${product._id}`}
											className='font-medium text-gray-900 hover:text-brand-600 transition'
										>
											{product.name}
										</Link>
									</div>
								</td>
								<td className='whitespace-nowrap px-5 py-3 text-gray-700 font-semibold'>
									{formatPrice(product.price)}
								</td>
								<td className='whitespace-nowrap px-5 py-3'>
									<span className='rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700'>
										{getCategoryName(product.category)}
									</span>
								</td>
								<td className='whitespace-nowrap px-5 py-3'>
									<span
										className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold ${
											product.stock === 0
												? "border-red-200 bg-red-50 text-red-700"
												: product.stock <= 5
												? "border-amber-200 bg-amber-50 text-amber-800"
												: "border-gray-200 bg-gray-50 text-gray-700"
										}`}
									>
										{product.stock ?? 0} units
									</span>
								</td>
								<td className='whitespace-nowrap px-5 py-3'>
									<button
										onClick={() => toggleFeaturedProduct(product._id)}
										className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
											product.isFeatured
												? "bg-amber-100 text-amber-800 hover:bg-amber-200"
												: "bg-gray-100 text-gray-600 hover:bg-gray-200"
										}`}
										aria-pressed={product.isFeatured}
									>
										<Star className={`h-3.5 w-3.5 ${product.isFeatured ? "fill-current" : ""}`} />
										{product.isFeatured ? "Featured" : "Not featured"}
									</button>
								</td>
								{/* <td className='whitespace-nowrap px-5 py-3'>
									<button
										onClick={() => {
											if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
												deleteProduct(product._id);
											}
										}}
										className='rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600'
										aria-label={`Delete ${product.name}`}
										title='Delete product'
									>
										<Trash2 className='h-4 w-4' />
									</button>
								</td> */}
								<td className='whitespace-nowrap px-5 py-3'>
									<div className='flex items-center gap-1'>
										{/* NEW: pencil button */}
										<button
											onClick={() => setEditing(product)}
											className='rounded-lg p-2 text-gray-500 hover:bg-brand-50 hover:text-brand-600'
											aria-label={`Edit ${product.name}`}
											title='Edit price & stock'
										>
											<Pencil className='h-4 w-4' />
										</button>

										{/* EXISTING: delete button, unchanged */}
										<button
											onClick={() => {
												if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
													deleteProduct(product._id);
												}
											}}
											className='rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600'
											aria-label={`Delete ${product.name}`}
											title='Delete product'
										>
											<Trash2 className='h-4 w-4' />
										</button>
									</div>
								</td>

							</tr>
						))}
					</tbody>
				</table>
			</div>

			{products?.length === 0 && (
				<p className='px-5 py-12 text-center text-sm text-gray-500'>No products yet. Create your first one.</p>
			)}

			{editing && (
				<EditProductModal
					product={editing}
					onClose={() => setEditing(null)}
					onSave={(data) => updateProduct(editing._id, data)}
				/>
			)}
		</div>
	);
};
export default ProductsList;
