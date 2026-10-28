import { useEffect, useState } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useOrderStore } from "../stores/useOrderStore";
import { useCurrencyStore } from "../stores/useCurrencyStore";
import {
	Store,
	PackagePlus,
	ShoppingBag,
	AlertTriangle,
	Trash2,
	Plus,
	Upload,
	Loader,
	CheckCircle,
	Truck,
	Calendar,
	DollarSign,
	Layers,
	Pencil,
} from "lucide-react";
//import { categories, getCategoryName } from "../lib/categories";
import { getCategoryName } from "../lib/categories";
import { useCategoryStore } from "../stores/useCategoryStore";
import toast from "react-hot-toast";
import EditProductModal from "../components/EditProductModal";

const VendorPage = () => {
	const categories = useCategoryStore((s) => s.categories);
	const { formatPrice } = useCurrencyStore();
	const {
		vendorProducts,
		fetchVendorProducts,
		createVendorProduct,
		updateVendorProduct,
		deleteVendorProduct,
		updateStock,
		lowStockProducts,
		fetchLowStockProducts,
		loading: productLoading,
	} = useProductStore();

	const { vendorOrders, fetchVendorOrders, updateVendorOrderStatus, loading: orderLoading } =
		useOrderStore();

	const [activeTab, setActiveTab] = useState("products");
	const [showAddModal, setShowAddModal] = useState(false);
	const [editing, setEditing] = useState(null);

	// Form State for New Vendor Product
	const [newProduct, setNewProduct] = useState({
		name: "",
		description: "",
		price: "",
		category: "",
		stock: "10",
		image: "",
	});

	useEffect(() => {
		fetchVendorProducts();
		fetchLowStockProducts(5);
		fetchVendorOrders();
	}, [fetchVendorProducts, fetchLowStockProducts, fetchVendorOrders]);

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setNewProduct((prev) => ({ ...prev, image: reader.result }));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleCreateProduct = async (e) => {
		e.preventDefault();
		if (!newProduct.image) {
			toast.error("Please upload an image for the product");
			return;
		}
		const success = await createVendorProduct({
			...newProduct,
			price: Number(newProduct.price),
			stock: Number(newProduct.stock),
		});

		if (success) {
			setNewProduct({ name: "", description: "", price: "", category: "", stock: "10", image: "" });
			setShowAddModal(false);
			fetchLowStockProducts(5);
		}
	};

	return (
		<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
			{/* Vendor Header */}
			<div className='card bg-gradient-to-r from-gray-800 to-gray-900 p-6 sm:p-8 text-white'>
				<div className='flex flex-wrap items-center justify-between gap-6'>
					<div className='flex items-center gap-4'>
						<div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur text-white shadow-inner'>
							<Store size={28} />
						</div>
						<div>
							<span className='rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider'>
								Vendor Portal
							</span>
							<h1 className='text-2xl font-extrabold sm:text-3xl mt-1'>Seller Management</h1>
							<p className='text-sm text-gray-200'>Manage your inventory, fulfill orders, and monitor stock.</p>
						</div>
					</div>

					<button
						onClick={() => setShowAddModal(true)}
						className='inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow hover:bg-gray-50 transition'
					>
						<Plus size={18} />
						Add New Product
					</button>
				</div>

				{/* Summary Metrics */}
				<div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3'>
					<div className='rounded-xl bg-white/10 p-4 backdrop-blur flex items-center justify-between'>
						<div>
							<p className='text-xs uppercase font-medium text-gray-300'>Listed Products</p>
							<p className='text-2xl font-bold mt-1'>{vendorProducts.length}</p>
						</div>
						<ShoppingBag className='text-gray-300 h-8 w-8 opacity-75' />
					</div>
					<div className='rounded-xl bg-white/10 p-4 backdrop-blur flex items-center justify-between'>
						<div>
							<p className='text-xs uppercase font-medium text-gray-300'>Low Stock Alerts</p>
							<p className='text-2xl font-bold mt-1'>{lowStockProducts.length}</p>
						</div>
						<AlertTriangle className='text-amber-300 h-8 w-8 opacity-80' />
					</div>
					<div className='rounded-xl bg-white/10 p-4 backdrop-blur flex items-center justify-between'>
						<div>
							<p className='text-xs uppercase font-medium text-gray-300'>Orders to Fulfill</p>
							<p className='text-2xl font-bold mt-1'>{vendorOrders.length}</p>
						</div>
						<Truck className='text-gray-300 h-8 w-8 opacity-75' />
					</div>
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className='mt-8 border-b border-gray-200 flex gap-4 overflow-x-auto'>
				<button
					onClick={() => setActiveTab("products")}
					className={`border-b-2 pb-3 text-sm font-medium transition ${
						activeTab === "products"
							? "border-emerald-600 text-emerald-700 font-bold"
							: "border-transparent text-gray-500 hover:text-gray-900"
					}`}
				>
					My Products ({vendorProducts.length})
				</button>
				<button
					onClick={() => setActiveTab("orders")}
					className={`border-b-2 pb-3 text-sm font-medium transition ${
						activeTab === "orders"
							? "border-emerald-600 text-emerald-700 font-bold"
							: "border-transparent text-gray-500 hover:text-gray-900"
					}`}
				>
					Customer Orders ({vendorOrders.length})
				</button>
				<button
					onClick={() => setActiveTab("lowStock")}
					className={`border-b-2 pb-3 text-sm font-medium transition ${
						activeTab === "lowStock"
							? "border-emerald-600 text-emerald-700 font-bold"
							: "border-transparent text-gray-500 hover:text-gray-900"
					}`}
				>
					Low Stock Alerts ({lowStockProducts.length})
				</button>
			</div>

			{/* Content Panels */}
			<div className='mt-6'>
				{/* Products Tab */}
				{activeTab === "products" && (
					<div className='card overflow-hidden'>
						<div className='overflow-x-auto'>
							<table className='min-w-full divide-y divide-gray-200 text-sm'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500'>
											Product
										</th>
										<th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500'>
											Category
										</th>
										<th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500'>
											Price
										</th>
										<th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500'>
											Current Stock
										</th>
										<th className='px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-100 bg-white'>
									{vendorProducts.map((p) => (
										<tr key={p._id} className='hover:bg-gray-50'>
											<td className='px-6 py-4'>
												<div className='flex items-center gap-3'>
													<img
														src={p.image}
														alt={p.name}
														className='h-12 w-12 rounded-lg object-cover border border-gray-200'
													/>
													<div>
														<p className='font-semibold text-gray-900'>{p.name}</p>
														<p className='text-xs text-gray-500 line-clamp-1 max-w-xs'>
															{p.description}
														</p>
													</div>
												</div>
											</td>
											<td className='px-6 py-4'>
												<span className='rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700'>
													{getCategoryName(p.category)}
												</span>
											</td>
											<td className='px-6 py-4 font-bold text-gray-900'>{formatPrice(p.price)}</td>
											<td className='px-6 py-4'>
												<span
													className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
														p.stock === 0
															? "bg-red-100 text-red-700"
															: p.stock <= 5
															? "bg-amber-100 text-amber-800"
															: "bg-emerald-100 text-emerald-800"
													}`}
												>
													{p.stock} units
												</span>
											</td>
											<td className='px-6 py-4 text-right space-x-2'>
												<button
													onClick={() => setEditing(p)}
													className='rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-emerald-700'
													title='Edit price & stock'
												>
													<Pencil size={16} />
												</button>
												<button
													onClick={() => {
														if (confirm(`Delete "${p.name}"?`)) {
															deleteVendorProduct(p._id);
														}
													}}
													className='rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600'
												>
													<Trash2 size={16} />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{vendorProducts.length === 0 && (
							<div className='p-12 text-center text-gray-500'>
								<ShoppingBag className='mx-auto h-12 w-12 text-gray-300 mb-3' />
								<p className='font-medium text-gray-900'>No products in your catalog yet</p>
								<p className='text-sm mt-1'>Click "Add New Product" to list your first item.</p>
							</div>
						)}
					</div>
				)}

				{/* Orders Tab */}
				{activeTab === "orders" && (
					<div className='space-y-4'>
						{vendorOrders.map((order) => (
							<div key={order._id} className='card p-6 shadow-sm'>
								<div className='flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4'>
									<div>
										<span className='text-xs uppercase font-medium text-gray-500'>Order #</span>
										<p className='font-mono font-bold text-gray-900'>{order._id}</p>
										<div className='flex items-center gap-1.5 text-xs text-gray-500 mt-1'>
											<Calendar size={13} />
											<span>{new Date(order.createdAt).toLocaleDateString()}</span>
										</div>
									</div>

									<div className='flex items-center gap-3'>
										<span className='rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700'>
											Status: {order.status}
										</span>
										{order.status !== "delivered" && order.status !== "cancelled" && (
											<div className='flex items-center gap-2'>
												{order.status !== "shipped" && (
													<button
														onClick={() => updateVendorOrderStatus(order._id, "shipped")}
														className='btn-secondary py-1 px-3 text-xs'
													>
														Mark as Shipped
													</button>
												)}
												<button
													onClick={() => updateVendorOrderStatus(order._id, "delivered")}
													className='btn-primary py-1 px-3 text-xs'
												>
													Mark as Delivered
												</button>
											</div>
										)}
									</div>
								</div>

								{/* Order Items */}
								<div className='mt-4 divide-y divide-gray-100'>
									{order.products?.map((item, idx) => (
										<div key={idx} className='flex items-center justify-between py-2 text-sm'>
											<div className='flex items-center gap-3'>
												<img
													src={item.product?.image || "/placeholder.jpg"}
													alt={item.product?.name}
													className='h-10 w-10 rounded object-cover border'
												/>
												<div>
													<p className='font-medium text-gray-900'>{item.product?.name}</p>
													<p className='text-xs text-gray-500'>Qty: {item.quantity}</p>
												</div>
											</div>
											<p className='font-semibold text-gray-900'>
												{formatPrice(item.price * item.quantity)}
											</p>
										</div>
									))}
								</div>
							</div>
						))}

						{vendorOrders.length === 0 && (
							<div className='card p-12 text-center text-gray-500'>
								<Truck className='mx-auto h-12 w-12 text-gray-300 mb-3' />
								<p className='font-medium text-gray-900'>No customer orders yet</p>
								<p className='text-sm mt-1'>When customers purchase your products, orders will appear here.</p>
							</div>
						)}
					</div>
				)}

				{/* Low Stock Tab */}
				{activeTab === "lowStock" && (
					<div className='card p-6'>
						<h3 className='text-lg font-bold text-gray-900 mb-4'>Inventory Replenishment Alerts</h3>
						{lowStockProducts.length === 0 ? (
							<div className='text-center py-8 text-gray-500'>
								<CheckCircle className='mx-auto h-12 w-12 text-emerald-500 mb-2' />
								<p className='font-medium text-gray-900'>All inventory levels are healthy!</p>
								<p className='text-sm mt-1'>No products have stock below 5 units.</p>
							</div>
						) : (
							<div className='divide-y divide-gray-100'>
								{lowStockProducts.map((p) => (
									<div key={p._id} className='flex items-center justify-between py-4'>
										<div className='flex items-center gap-4'>
											<img
												src={p.image}
												alt={p.name}
												className='h-14 w-14 rounded-lg object-cover border'
											/>
											<div>
												<p className='font-bold text-gray-900'>{p.name}</p>
												<p className='text-xs text-red-600 font-semibold'>
													{p.stock === 0 ? "Out of Stock!" : `Only ${p.stock} units remaining!`}
												</p>
											</div>
										</div>
										<button
											onClick={() => setEditing(p)}
											className='rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-emerald-700'
											title='Edit price & stock'
										>
											<Pencil size={18} />
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
			
			{editing && (
				<EditProductModal
					product={editing}
					onClose={() => setEditing(null)}
					onSave={async (data) => {
						const ok = await updateVendorProduct(editing._id, data);
						if (ok) fetchLowStockProducts(5);
						return ok;
					}}
				/>
			)}

			{/* Modal for Creating New Vendor Product */}
			{showAddModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
					<div className='card w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto'>
						<div className='flex items-center justify-between border-b pb-4'>
							<h3 className='text-xl font-bold text-gray-900'>Add New Product to Store</h3>
							<button
								onClick={() => setShowAddModal(false)}
								className='text-gray-400 hover:text-gray-600 text-xl font-bold'
							>
								✕
							</button>
						</div>

						<form onSubmit={handleCreateProduct} className='mt-6 space-y-4'>
							<div>
								<label className='label'>Product Name</label>
								<input
									type='text'
									required
									placeholder='e.g. Vintage Leather Jacket'
									value={newProduct.name}
									onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
									className='input'
								/>
							</div>

							<div>
								<label className='label'>Description</label>
								<textarea
									required
									rows={3}
									placeholder='High quality handcrafted materials...'
									value={newProduct.description}
									onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
									className='input'
								/>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className='label'>Price (₹)</label>
									<input
										type='number'
										step='0.01'
										min='0'
										required
										placeholder='79.99'
										value={newProduct.price}
										onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
										className='input'
									/>
								</div>
								<div>
									<label className='label'>Initial Stock</label>
									<input
										type='number'
										min='0'
										required
										placeholder='25'
										value={newProduct.stock}
										onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
										className='input'
									/>
								</div>
							</div>

							<div>
								<label className='label'>Category</label>
								<select
									required
									value={newProduct.category}
									onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
									className='input'
								>
									<option value=''>Select category</option>
									{categories.map((c) => (
										<option key={c.slug} value={c.slug}>
											{c.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='label'>Product Image</label>
								<input
									type='file'
									accept='image/*'
									onChange={handleImageChange}
									className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100'
								/>
								{newProduct.image && (
									<img
										src={newProduct.image}
										alt='Preview'
										className='mt-3 h-28 w-28 rounded-lg object-cover border'
									/>
								)}
							</div>

							<div className='flex justify-end gap-3 pt-4 border-t'>
								<button
									type='button'
									onClick={() => setShowAddModal(false)}
									className='btn-secondary'
								>
									Cancel
								</button>
								<button type='submit' disabled={productLoading} className='btn-primary'>
									{productLoading ? <Loader className='h-4 w-4 animate-spin' /> : null}
									Publish Product
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default VendorPage;
