import { Trash2, Star } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { getCategoryName } from "../lib/categories";

const ProductsList = () => {
	const { deleteProduct, toggleFeaturedProduct, products } = useProductStore();

	return (
		<div className='card overflow-hidden'>
			<div className='flex items-center justify-between border-b border-gray-200 px-5 py-4'>
				<h2 className='text-lg font-semibold text-gray-900'>All products</h2>
				<span className='text-sm text-gray-500'>{products?.length ?? 0} total</span>
			</div>

			<div className='overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-200 text-sm'>
					<thead className='bg-gray-50'>
						<tr>
							{["Product", "Price", "Category", "Featured", "Actions"].map((heading) => (
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
										<span className='font-medium text-gray-900'>{product.name}</span>
									</div>
								</td>
								<td className='whitespace-nowrap px-5 py-3 text-gray-700'>${product.price.toFixed(2)}</td>
								<td className='whitespace-nowrap px-5 py-3'>
									<span className='rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700'>
										{getCategoryName(product.category)}
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
								<td className='whitespace-nowrap px-5 py-3'>
									<button
										onClick={() => deleteProduct(product._id)}
										className='rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600'
										aria-label={`Delete ${product.name}`}
									>
										<Trash2 className='h-4 w-4' />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{products?.length === 0 && (
				<p className='px-5 py-12 text-center text-sm text-gray-500'>No products yet. Create your first one.</p>
			)}
		</div>
	);
};
export default ProductsList;
