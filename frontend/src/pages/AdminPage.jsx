import { BarChart, PlusCircle, ShoppingBasket, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import OrdersTab from "../components/OrdersTab";
import { useProductStore } from "../stores/useProductStore";

const tabs = [
	{ id: "create", label: "Create Product", icon: PlusCircle },
	{ id: "products", label: "Products", icon: ShoppingBasket },
	{ id: "orders", label: "Customer Orders", icon: PackageCheck },
	{ id: "analytics", label: "Analytics", icon: BarChart },
];

const AdminPage = () => {
	const [activeTab, setActiveTab] = useState("create");
	const { fetchAllProducts } = useProductStore();

	useEffect(() => {
		fetchAllProducts();
	}, [fetchAllProducts]);

	return (
		<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
			<div>
				<h1 className='text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl'>Admin dashboard</h1>
				<p className='mt-1 text-sm text-gray-600'>Manage your catalogue, customer orders, and track store performance.</p>
			</div>

			<div className='mt-8 grid gap-8 lg:grid-cols-[220px_1fr]'>
				<nav className='flex gap-2 overflow-x-auto lg:flex-col' aria-label='Dashboard sections'>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
								activeTab === tab.id
									? "bg-brand-600 text-white shadow-sm"
									: "text-gray-700 hover:bg-white hover:shadow-sm"
							}`}
							aria-current={activeTab === tab.id ? "page" : undefined}
						>
							<tab.icon className='h-5 w-5' />
							{tab.label}
						</button>
					))}
				</nav>

				<div className='min-w-0'>
					{activeTab === "create" && <CreateProductForm />}
					{activeTab === "products" && <ProductsList />}
					{activeTab === "orders" && <OrdersTab />}
					{activeTab === "analytics" && <AnalyticsTab />}
				</div>
			</div>
		</div>
	);
};
export default AdminPage;
