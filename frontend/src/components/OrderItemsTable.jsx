import { getCategoryName } from "../lib/categories";
import { useCurrencyStore } from "../stores/useCurrencyStore";

const statusStyles = {
	processing: "bg-amber-100 text-amber-800",
	shipped: "bg-blue-100 text-blue-800",
	delivered: "bg-green-100 text-green-800",
	cancelled: "bg-red-100 text-red-800",
	refunded: "bg-purple-100 text-purple-800",
};

// one row per purchased item across the given orders
const OrderItemsTable = ({ orders = [] }) => {
	const { formatPrice } = useCurrencyStore();

	const rows = orders.flatMap((order) =>
		(order.products || []).map((line, idx) => ({ key: `${order._id}-${idx}`, order, line }))
	);

	if (rows.length === 0) {
		return <p className='px-5 py-4 text-sm text-gray-500'>No purchased items.</p>;
	}

	const th = "px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500";

	return (
		<div className='overflow-x-auto'>
			<table className='min-w-full divide-y divide-gray-200 text-sm'>
				<thead className='bg-gray-50'>
					<tr>
						<th className={th}>Order ID</th>
						<th className={th}>Date</th>
						<th className={th}>Product</th>
						<th className={th}>Category</th>
						<th className={th}>Price</th>
						<th className={th}>Qty</th>
						<th className={th}>Line total</th>
						<th className={th}>Status</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-gray-100 bg-white'>
					{rows.map(({ key, order, line }) => (
						<tr key={key}>
							<td className='whitespace-nowrap px-4 py-2 font-mono text-xs text-gray-700' title={order._id}>
								#{order._id.slice(-8)}
							</td>
							<td className='whitespace-nowrap px-4 py-2 text-xs text-gray-600'>
								{new Date(order.createdAt).toLocaleDateString()}
							</td>
							<td className='px-4 py-2 font-medium text-gray-900'>{line.product?.name ?? "Deleted product"}</td>
							<td className='px-4 py-2 text-gray-600'>
								{line.product?.category ? getCategoryName(line.product.category) : "—"}
							</td>
							<td className='whitespace-nowrap px-4 py-2'>{formatPrice(line.price)}</td>
							<td className='px-4 py-2'>{line.quantity}</td>
							<td className='whitespace-nowrap px-4 py-2 font-semibold'>
								{formatPrice(line.price * line.quantity)}
							</td>
							<td className='px-4 py-2'>
								<span
									className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
										statusStyles[order.status] || "bg-gray-100 text-gray-700"
									}`}
								>
									{order.status}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default OrderItemsTable;