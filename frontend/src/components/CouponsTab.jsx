import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useCouponStore } from "../stores/useCouponStore";
import { useUserAdminStore } from "../stores/useUserAdminStore";
import LoadingSpinner from "./LoadingSpinner";

const emptyForm = { code: "", discountPercentage: "", expirationDate: "", userId: "", isActive: true };

// ISO string -> yyyy-mm-dd in local time, for <input type="date">
const toDateInput = (iso) => {
	const d = new Date(iso);
	const p = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const getStatus = (c) => (new Date(c.expirationDate) < new Date() ? "Expired" : c.isActive ? "Active" : "Inactive");

const statusStyles = {
	Active: "bg-green-100 text-green-800",
	Inactive: "bg-gray-100 text-gray-700",
	Expired: "bg-red-100 text-red-800",
};

const CouponsTab = () => {
	const { coupons, fetchCoupons, createCoupon, updateCoupon, deleteCoupon, loading } = useCouponStore();
	const { users, fetchUsers } = useUserAdminStore();

	const [form, setForm] = useState(emptyForm);
	const [editingId, setEditingId] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		fetchCoupons();
		fetchUsers();
	}, [fetchCoupons, fetchUsers]);

	const usersById = useMemo(() => Object.fromEntries(users.map((u) => [u._id, u])), [users]);

	const resetForm = () => {
		setForm(emptyForm);
		setEditingId(null);
	};

	const startEdit = (c) => {
		setEditingId(c._id);
		setForm({
			code: c.code,
			discountPercentage: String(c.discountPercentage),
			expirationDate: toDateInput(c.expirationDate),
			userId: c.userId || "",
			isActive: c.isActive,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		// expire at the end of the chosen day (local time)
		const expirationDate = new Date(`${form.expirationDate}T23:59:59`).toISOString();
		const base = { discountPercentage: Number(form.discountPercentage), expirationDate };

		const ok = editingId
			? await updateCoupon(editingId, { ...base, isActive: form.isActive })
			: await createCoupon({ ...base, code: form.code.trim(), userId: form.userId || undefined });

		setSubmitting(false);
		if (ok) resetForm();
	};

	const handleDelete = (c) => {
		if (window.confirm(`Delete coupon ${c.code}?`)) {
			deleteCoupon(c._id);
			if (editingId === c._id) resetForm();
		}
	};

	if (loading && coupons.length === 0) return <LoadingSpinner />;

	const th = "px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500";

	return (
		<div className='space-y-6'>
			{/* Form */}
			<form onSubmit={handleSubmit} className='card p-5'>
				<h2 className='mb-4 text-lg font-semibold text-gray-900'>
					{editingId ? "Edit coupon" : "Create coupon"}
				</h2>
				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					<div>
						<label className='mb-1 block text-xs font-medium text-gray-600'>Code</label>
						<input
							type='text'
							required
							disabled={!!editingId}
							value={form.code}
							onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
							className='input uppercase disabled:bg-gray-100'
							placeholder='SAVE10'
						/>
					</div>
					<div>
						<label className='mb-1 block text-xs font-medium text-gray-600'>Discount %</label>
						<input
							type='number'
							required
							min='0'
							max='100'
							value={form.discountPercentage}
							onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
							className='input'
						/>
					</div>
					<div>
						<label className='mb-1 block text-xs font-medium text-gray-600'>Expiry date</label>
						<input
							type='date'
							required
							value={form.expirationDate}
							onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
							className='input'
						/>
					</div>
					<div>
						<label className='mb-1 block text-xs font-medium text-gray-600'>Applies to</label>
						<select
							disabled={!!editingId}
							value={form.userId}
							onChange={(e) => setForm({ ...form, userId: e.target.value })}
							className='input disabled:bg-gray-100'
						>
							<option value=''>General (all customers)</option>
							{users.map((u) => (
								<option key={u._id} value={u._id}>
									{u.name} ({u.email})
								</option>
							))}
						</select>
					</div>
				</div>

				{editingId && (
					<label className='mt-4 flex items-center gap-2 text-sm text-gray-700'>
						<input
							type='checkbox'
							checked={form.isActive}
							onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
						/>
						Active
					</label>
				)}

				<div className='mt-4 flex gap-2'>
					<button type='submit' disabled={submitting} className='btn-primary px-4 py-2 text-sm'>
						{submitting ? "Saving..." : editingId ? "Save changes" : "Create coupon"}
					</button>
					{editingId && (
						<button
							type='button'
							onClick={resetForm}
							className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
						>
							Cancel
						</button>
					)}
				</div>
			</form>

			{/* Table */}
			<div className='card overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='min-w-full divide-y divide-gray-200 text-sm'>
						<thead className='bg-gray-50'>
							<tr>
								<th className={th}>Code</th>
								<th className={th}>Discount</th>
								<th className={th}>Expiry</th>
								<th className={th}>Status</th>
								<th className={th}>Assigned to</th>
								<th className={`${th} text-right`}>Actions</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-100 bg-white'>
							{coupons.map((c) => {
								const status = getStatus(c);
								const assigned = c.userId ? usersById[c.userId] : null;
								return (
									<tr key={c._id} className='hover:bg-gray-50/75'>
										<td className='px-5 py-3 font-mono font-bold text-gray-900'>{c.code}</td>
										<td className='px-5 py-3'>{c.discountPercentage}%</td>
										<td className='whitespace-nowrap px-5 py-3 text-gray-600'>
											{new Date(c.expirationDate).toLocaleDateString()}
										</td>
										<td className='px-5 py-3'>
											<span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
												{status}
											</span>
										</td>
										<td className='px-5 py-3 text-gray-600'>
											{c.userId ? (assigned ? `${assigned.name} (${assigned.email})` : "Unknown user") : "General"}
										</td>
										<td className='whitespace-nowrap px-5 py-3 text-right'>
											<button
												onClick={() => startEdit(c)}
												className='mr-2 inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50'
											>
												<Pencil size={12} /> Edit
											</button>
											<button
												onClick={() => handleDelete(c)}
												className='inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50'
											>
												<Trash2 size={12} /> Delete
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				{coupons.length === 0 && <div className='p-10 text-center text-sm text-gray-500'>No coupons yet.</div>}
			</div>
		</div>
	);
};

export default CouponsTab;