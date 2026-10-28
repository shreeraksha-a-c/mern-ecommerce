import { useEffect, useState, useMemo } from "react";
import { useOrderStore } from "../stores/useOrderStore";
import { useCurrencyStore } from "../stores/useCurrencyStore";
import {
	PackageCheck,
	RotateCcw,
	Calendar,
	Search,
	CheckCircle,
	Clock,
	Truck,
	XCircle,
} from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const statuses = ["all", "processing", "shipped", "delivered", "cancelled", "refunded"];

const OrdersTab = () => {
	const { allOrders, fetchAllOrders, updateOrderStatus, refundOrder, loading } = useOrderStore();
	const { formatPrice } = useCurrencyStore();
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		fetchAllOrders();
	}, [fetchAllOrders]);

	const filteredOrders = useMemo(() => {
		return allOrders.filter((order) => {
			if (statusFilter !== "all" && order.status !== statusFilter) return false;
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				const matchId = order._id.toLowerCase().includes(query);
				const matchCustomer =
					order.user?.name?.toLowerCase().includes(query) ||
					order.user?.email?.toLowerCase().includes(query);
				return matchId || matchCustomer;
			}
			return true;
		});
	}, [allOrders, statusFilter, searchQuery]);

	const handleStatusChange = (orderId, newStatus) => {
		updateOrderStatus(orderId, newStatus);
	};

	const handleRefund = (orderId) => {
		if (
			window.confirm(
				"Are you sure you want to process a Stripe refund for this order? Items will be automatically returned to stock."
			)
		) {
			refundOrder(orderId);
		}
	};

	if (loading && allOrders.length === 0) {
		return <LoadingSpinner />;
	}

	return (
		<div className='card overflow-hidden'>
			<div className='flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-5 py-4'>
				<div>
					<h2 className='text-lg font-semibold text-gray-900'>Customer Orders</h2>
					<p className='text-xs text-gray-500'>
						Manage customer shipments, track statuses, and issue Stripe refunds.
					</p>
				</div>
				<span className='rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700'>
					{allOrders.length} total orders
				</span>
			</div>

			{/* Filters & Search */}
			<div className='flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/50 p-4'>
				<div className='flex gap-1 overflow-x-auto'>
					{statuses.map((s) => (
						<button
							key={s}
							onClick={() => setStatusFilter(s)}
							className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
								statusFilter === s
									? "bg-brand-600 text-white font-bold"
									: "text-gray-600 hover:bg-gray-200"
							}`}
						>
							{s}
						</button>
					))}
				</div>

				<div className='relative w-full sm:w-64'>
					<input
						type='text'
						placeholder='Search order # or customer...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='input py-1.5 text-xs pl-8'
					/>
					<Search size={14} className='absolute left-2.5 top-2.5 text-gray-400' />
				</div>
			</div>

			{/* Orders Table */}
			<div className='overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-200 text-sm'>
					<thead className='bg-gray-50'>
						<tr>
							<th className='px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500'>
								Order ID & Date
							</th>
							<th className='px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500'>
								Customer
							</th>
							<th className='px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500'>
								Items
							</th>
							<th className='px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500'>
								Total
							</th>
							<th className='px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500'>
								Status
							</th>
							<th className='px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500'>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-100 bg-white'>
						{filteredOrders.map((order) => (
							<tr key={order._id} className='hover:bg-gray-50/75'>
								<td className='px-5 py-4 whitespace-nowrap'>
									<p className='font-mono font-bold text-gray-900 text-xs'>{order._id}</p>
									<p className='text-xs text-gray-500 flex items-center gap-1 mt-0.5'>
										<Calendar size={12} />
										{new Date(order.createdAt).toLocaleDateString()}
									</p>
								</td>
								<td className='px-5 py-4 whitespace-nowrap'>
									<p className='font-medium text-gray-900'>{order.user?.name || "Customer"}</p>
									<p className='text-xs text-gray-500'>{order.user?.email || "No email"}</p>
								</td>
								<td className='px-5 py-4'>
									<div className='flex items-center -space-x-2'>
										{order.products?.slice(0, 3).map((line, idx) => (
											<img
												key={idx}
												src={line.product?.image || "/placeholder.jpg"}
												alt={line.product?.name}
												title={`${line.product?.name} (x${line.quantity})`}
												className='h-8 w-8 rounded-full border-2 border-white object-cover'
											/>
										))}
										{order.products?.length > 3 && (
											<span className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700'>
												+{order.products.length - 3}
											</span>
										)}
									</div>
								</td>
								<td className='px-5 py-4 whitespace-nowrap font-bold text-gray-900'>
									{formatPrice(order.totalAmount)}
								</td>
								<td className='px-5 py-4 whitespace-nowrap'>
									{order.status === "refunded" || order.status === "cancelled" ? (
										<span
											className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
												order.status === "refunded" ? "bg-purple-100 text-purple-800" : "bg-red-100 text-red-800"
											}`}
										>
											{order.status === "refunded" ? "Refunded" : "Cancelled"}
										</span>
									) : (
										<select
											value={order.status}
											onChange={(e) => handleStatusChange(order._id, e.target.value)}
											className='rounded-md border border-gray-300 py-1 px-2 text-xs font-medium focus:ring-brand-500'
										>
											<option value='processing'>Processing</option>
											<option value='shipped'>Shipped</option>
											<option value='delivered'>Delivered</option>
											<option value='cancelled'>Cancelled</option>
										</select>
									)}
								</td>
								<td className='px-5 py-4 whitespace-nowrap text-right'>
									{order.status !== "refunded" && order.status !== "cancelled" && (
										<button
											onClick={() => handleRefund(order._id)}
											className='inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition'
											title='Refund via Stripe and restock'
										>
											<RotateCcw size={12} />
											Refund
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{filteredOrders.length === 0 && (
				<div className='p-10 text-center text-sm text-gray-500'>
					No orders match your filter criteria.
				</div>
			)}
		</div>
	);
};

export default OrdersTab;
