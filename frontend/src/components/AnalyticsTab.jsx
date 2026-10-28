import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import LoadingSpinner from "./LoadingSpinner";
import { useCurrencyStore } from "../stores/useCurrencyStore";

const CHART_COLOR = "#4f46e5"; // brand-600, validated against the white surface
// "2026-10-29" -> "29 Oct"
const formatDate = (iso) =>
	new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });

const AnalyticsTab = () => {
	const [analyticsData, setAnalyticsData] = useState({
		users: 0,
		products: 0,
		totalSales: 0,
		totalRevenue: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [dailySalesData, setDailySalesData] = useState([]);
	const { formatPrice } = useCurrencyStore();

	useEffect(() => {
		const fetchAnalyticsData = async () => {
			try {
				const response = await axios.get("/analytics");
				setAnalyticsData(response.data.analyticsData);
				setDailySalesData(response.data.dailySalesData);
			} catch (error) {
				console.error("Error fetching analytics data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAnalyticsData();
	}, []);

	if (isLoading) {
		return <LoadingSpinner fullScreen={false} />;
	}

	return (
		<div className='space-y-6'>
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
				<AnalyticsCard title='Total users' value={analyticsData.users.toLocaleString()} icon={Users} />
				<AnalyticsCard title='Total products' value={analyticsData.products.toLocaleString()} icon={Package} />
				<AnalyticsCard title='Total sales' value={analyticsData.totalSales.toLocaleString()} icon={ShoppingCart} />
				<AnalyticsCard
					title='Total revenue'
					//value={`$${analyticsData.totalRevenue.toLocaleString()}`}
					value={formatPrice(analyticsData.totalRevenue)}
					icon={DollarSign}
				/>
			</div>

			{/* Sales and revenue have different scales, so each gets its own chart rather than a dual axis */}
			<div className='grid gap-6 xl:grid-cols-2'>
				<TrendChart title='Daily sales' subtitle='Orders per day, last 7 days' data={dailySalesData} dataKey='sales' />
				<TrendChart
					title='Daily revenue'
					subtitle='Revenue per day, last 7 days'
					data={dailySalesData}
					dataKey='revenue'
					//formatValue={(value) => `$${Number(value).toLocaleString()}`}
					formatValue={(value) => formatPrice(Number(value))}
				/>
			</div>

			<details className='card p-5 text-sm'>
				<summary className='cursor-pointer font-medium text-gray-700'>View daily data as a table</summary>
				<table className='mt-4 min-w-full text-left'>
					<thead className='text-xs uppercase tracking-wider text-gray-500'>
						<tr>
							<th className='py-2 pr-4 font-semibold'>Date</th>
							<th className='py-2 pr-4 text-right font-semibold'>Sales</th>
							<th className='py-2 text-right font-semibold'>Revenue</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-100 tabular-nums text-gray-700'>
						{dailySalesData.map((day) => (
							// <tr key={day.name}>
							// 	<td className='py-2 pr-4'>{day.name}</td>
							// 	<td className='py-2 pr-4 text-right'>{day.sales.toLocaleString()}</td>
							// 	<td className='py-2 text-right'>${day.revenue.toLocaleString()}</td>
							// </tr>
							<tr key={day.date}>
								<td className='py-2 pr-4'>{formatDate(day.date)}</td>
								<td className='py-2 pr-4 text-right'>{day.sales.toLocaleString()}</td>
								<td className='py-2 text-right'>{formatPrice(day.revenue)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</details>
		</div>
	);
};
export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon }) => (
	<div className='card flex items-center justify-between p-5'>
		<div>
			<p className='text-sm font-medium text-gray-600'>{title}</p>
			<p className='mt-1 text-2xl font-bold tabular-nums text-gray-900'>{value}</p>
		</div>
		<span className='flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600'>
			<Icon className='h-5 w-5' />
		</span>
	</div>
);

const TrendChart = ({ title, subtitle, data, dataKey, formatValue = (value) => Number(value).toLocaleString() }) => (
	<div className='card p-5'>
		<h3 className='font-semibold text-gray-900'>{title}</h3>
		<p className='text-sm text-gray-500'>{subtitle}</p>
		<div className='mt-4 h-64'>
			<ResponsiveContainer width='100%' height='100%'>
				<LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
					<CartesianGrid stroke='#f3f4f6' vertical={false} />
					<XAxis
						dataKey='date'
						tickFormatter={formatDate} //change
						tick={{ fill: "#6b7280", fontSize: 12 }}
						tickLine={false}
						axisLine={{ stroke: "#e5e7eb" }}
					/>
					<YAxis
						tick={{ fill: "#6b7280", fontSize: 12 }}
						tickLine={false}
						axisLine={false}
						width={80}
						tickFormatter={formatValue}
						allowDecimals={false}
					/>
					<Tooltip
						labelFormatter={formatDate} //change
						formatter={(value) => [formatValue(value), title.replace("Daily ", "")]}
						cursor={{ stroke: "#d1d5db", strokeDasharray: "4 4" }}
						contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
					/>
					<Line
						type='monotone'
						dataKey={dataKey}
						stroke={CHART_COLOR}
						strokeWidth={2}
						dot={{ r: 4, fill: CHART_COLOR, stroke: "#fff", strokeWidth: 2 }}
						activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	</div>
);
