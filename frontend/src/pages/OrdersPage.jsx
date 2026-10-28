import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useOrderStore } from "../stores/useOrderStore";
import { useCurrencyStore } from "../stores/useCurrencyStore";
import {
	Package,
	Calendar,
	MapPin,
	CheckCircle2,
	Clock,
	Truck,
	XCircle,
	ArrowRight,
	AlertCircle,
	RotateCcw,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const statusConfig = {
	processing: {
		label: "Processing",
		icon: Clock,
		className: "bg-blue-50 text-blue-700 border-blue-200",
	},
	shipped: {
		label: "Shipped",
		icon: Truck,
		className: "bg-amber-50 text-amber-700 border-amber-200",
	},
	delivered: {
		label: "Delivered",
		icon: CheckCircle2,
		className: "bg-emerald-50 text-emerald-700 border-emerald-200",
	},
	cancelled: {
		label: "Cancelled",
		icon: XCircle,
		className: "bg-gray-100 text-gray-700 border-gray-300",
	},
	refunded: {
		label: "Refunded",
		icon: RotateCcw,
		className: "bg-purple-50 text-purple-700 border-purple-200",
	},
};

const OrdersPage = () => {
	const { orders, fetchMyOrders, cancelOrder, loading } = useOrderStore();
	const { formatPrice } = useCurrencyStore();
	const [cancellingId, setCancellingId] = useState(null);

	useEffect(() => {
		fetchMyOrders();
	}, [fetchMyOrders]);

	const handleCancel = async (orderId) => {
		if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
			setCancellingId(orderId);
			await cancelOrder(orderId);
			setCancellingId(null);
		}
	};

	if (loading && orders.length === 0) {
		return <LoadingSpinner />;
	}

	return (
		<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
			<div className='border-b border-gray-200 pb-5 flex flex-wrap items-center justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-extrabold tracking-tight text-gray-900'>My Orders</h1>
					<p className='mt-1 text-sm text-gray-600'>Track your shipment status and review order history.</p>
				</div>
				<span className='rounded-full bg-brand-50 px-3.5 py-1 text-sm font-semibold text-brand-700'>
					{orders.length} {orders.length === 1 ? "Order" : "Orders"}
				</span>
			</div>

			{orders.length === 0 ? (
				<div className='card mt-8 p-12 text-center'>
					<div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600'>
						<Package size={32} />
					</div>
					<h3 className='mt-4 text-xl font-bold text-gray-900'>No orders found</h3>
					<p className='mt-2 text-sm text-gray-500 max-w-md mx-auto'>
						You haven't placed any orders yet. Discover our latest collections and start shopping today!
					</p>
					<Link to='/' className='btn-primary mt-6 inline-flex'>
						Start Shopping <ArrowRight size={16} />
					</Link>
				</div>
			) : (
				<div className='mt-8 space-y-6'>
					{orders.map((order) => {
						const statusInfo = statusConfig[order.status] || {
							label: order.status,
							icon: Clock,
							className: "bg-gray-100 text-gray-700 border-gray-200",
						};
						const StatusIcon = statusInfo.icon;
						const canCancel = order.status === "processing";

						return (
							<div key={order._id} className='card overflow-hidden transition shadow-sm hover:shadow-md'>
								{/* Header */}
								<div className='flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-gray-50/75 px-6 py-4'>
									<div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm'>
										<div>
											<span className='text-xs uppercase font-medium text-gray-500'>Order #</span>
											<p className='font-mono font-bold text-gray-900'>{order._id}</p>
										</div>
										<div className='flex items-center gap-1.5 text-gray-600'>
											<Calendar size={15} />
											<span>{new Date(order.createdAt).toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}</span>
										</div>
										<div>
											<span className='text-xs uppercase font-medium text-gray-500'>Total</span>
											<p className='font-bold text-gray-900'>
												{formatPrice(order.totalAmount)}
											</p>
										</div>
									</div>

									<div className='flex items-center gap-3'>
										<span
											className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
										>
											<StatusIcon size={14} />
											{statusInfo.label}
										</span>

										{canCancel && (
											<button
												onClick={() => handleCancel(order._id)}
												disabled={cancellingId === order._id}
												className='rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition'
											>
												{cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
											</button>
										)}
									</div>
								</div>

								{/* Order Items */}
								<div className='p-6 divide-y divide-gray-100'>
									{order.products?.map((item, idx) => {
										const product = item.product || {};

										return (
											<div key={idx} className='flex items-center gap-4 py-4 first:pt-0 last:pb-0'>
												<img
													src={product.image || "/placeholder.jpg"}
													alt={product.name || "Item"}
													className='h-16 w-16 rounded-lg border border-gray-200 object-cover shrink-0'
												/>
												<div className='flex-1 min-w-0'>
													<Link
														to={product._id ? `/product/${product._id}` : "#"}
														className='font-semibold text-gray-900 hover:text-brand-600 line-clamp-1'
													>
														{product.name || "Product"}
													</Link>
													<p className='mt-1 text-xs text-gray-500'>
														Quantity: <span className='font-medium text-gray-800'>{item.quantity}</span>
													</p>
												</div>
												<div className='text-right'>
													<p className='font-bold text-gray-900'>
														{formatPrice(Number(item.price) * item.quantity)}
													</p>
													<p className='text-xs text-gray-500'>
														{formatPrice(item.price)} each
													</p>
												</div>
											</div>
										);
									})}
								</div>

								{/* Shipping Info & Address */}
								{order.shippingAddress && (
									<div className='border-t border-gray-100 bg-gray-50/50 px-6 py-3 text-xs text-gray-600 flex items-center gap-2'>
										<MapPin size={14} className='text-gray-400 shrink-0' />
										<span>
											Delivering to: <strong className='text-gray-900'>{order.shippingAddress.name}</strong>,{" "}
											{order.shippingAddress.line1}
											{order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ""}
											{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
											{order.shippingAddress.postalCode || ""}
										</span>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default OrdersPage;
