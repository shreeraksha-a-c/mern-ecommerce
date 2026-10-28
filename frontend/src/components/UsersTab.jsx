import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { useUserAdminStore } from "../stores/useUserAdminStore";
import { useOrderStore } from "../stores/useOrderStore";
import { useCurrencyStore } from "../stores/useCurrencyStore";
import OrderItemsTable from "./OrderItemsTable";
import LoadingSpinner from "./LoadingSpinner";

const UsersTab = () => {
	const { users, fetchUsers, loading } = useUserAdminStore();
	const { fetchOrdersByUser } = useOrderStore();
	const { formatPrice } = useCurrencyStore();

	const [search, setSearch] = useState("");
	const [expandedId, setExpandedId] = useState(null);
	const [ordersByUser, setOrdersByUser] = useState({});
	const [loadingUserId, setLoadingUserId] = useState(null);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const filteredUsers = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return users;
		return users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
	}, [users, search]);

	const toggleRow = async (userId) => {
		if (expandedId === userId) {
			setExpandedId(null);
			return;
		}
		setExpandedId(userId);
		if (ordersByUser[userId]) return; // already loaded
		setLoadingUserId(userId);
		const orders = await fetchOrdersByUser(userId);
		setOrdersByUser((prev) => ({ ...prev, [userId]: orders }));
		setLoadingUserId(null);
	};

	if (loading && users.length === 0) return <LoadingSpinner />;

	const th = "px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500";

	return (
		<div className='card overflow-hidden'>
			<div className='flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-5 py-4'>
				<div>
					<h2 className='text-lg font-semibold text-gray-900'>Users</h2>
					<p className='text-xs text-gray-500'>Click a user to see everything they have purchased.</p>
				</div>
				<div className='relative w-full sm:w-64'>
					<input
						type='text'
						placeholder='Search name or email...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='input py-1.5 pl-8 text-xs'
					/>
					<Search size={14} className='absolute left-2.5 top-2.5 text-gray-400' />
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-200 text-sm'>
					<thead className='bg-gray-50'>
						<tr>
							<th className={th}>Name</th>
							<th className={th}>Email</th>
							<th className={th}>Role</th>
							<th className={th}>Joined</th>
							<th className={th}>Orders</th>
							<th className={th}>Total spent</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-100 bg-white'>
						{filteredUsers.map((u) => {
							const isOpen = expandedId === u._id;
							return (
								<Fragment key={u._id}>
									<tr onClick={() => toggleRow(u._id)} className='cursor-pointer hover:bg-gray-50/75'>
										<td className='px-5 py-3 font-medium text-gray-900'>
											<span className='inline-flex items-center gap-2'>
												{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
												{u.name}
											</span>
										</td>
										<td className='px-5 py-3 text-gray-600'>{u.email}</td>
										<td className='px-5 py-3 capitalize'>{u.role}</td>
										<td className='whitespace-nowrap px-5 py-3 text-gray-600'>
											{new Date(u.createdAt).toLocaleDateString()}
										</td>
										<td className='px-5 py-3'>{u.orderCount}</td>
										<td className='whitespace-nowrap px-5 py-3 font-semibold'>{formatPrice(u.totalSpent)}</td>
									</tr>
									{isOpen && (
										<tr>
											<td colSpan={6} className='bg-gray-50/60 p-3'>
												{loadingUserId === u._id ? (
													<p className='px-2 py-3 text-sm text-gray-500'>Loading orders...</p>
												) : (
													<OrderItemsTable orders={ordersByUser[u._id] || []} />
												)}
											</td>
										</tr>
									)}
								</Fragment>
							);
						})}
					</tbody>
				</table>
			</div>

			{filteredUsers.length === 0 && (
				<div className='p-10 text-center text-sm text-gray-500'>No users match your search.</div>
			)}
		</div>
	);
};

export default UsersTab;