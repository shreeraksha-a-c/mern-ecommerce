import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useCategoryStore } from "../stores/useCategoryStore";

const CategoriesTab = () => {
	const { categories, createCategory, renameCategory, deleteCategory } = useCategoryStore();

	const [name, setName] = useState("");
	const [image, setImage] = useState("");
	const [fileKey, setFileKey] = useState(0); // bump to clear the file input
	const [submitting, setSubmitting] = useState(false);

	const [editingId, setEditingId] = useState(null);
	const [editName, setEditName] = useState("");

	const handleImage = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onloadend = () => setImage(reader.result);
		reader.readAsDataURL(file);
	};

	const handleCreate = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		const ok = await createCategory({ name, image });
		setSubmitting(false);
		if (ok) {
			setName("");
			setImage("");
			setFileKey((k) => k + 1);
		}
	};

	const handleRename = async (id) => {
		const ok = await renameCategory(id, editName);
		if (ok) setEditingId(null);
	};

	const handleDelete = (cat) => {
		if (window.confirm(`Delete the "${cat.name}" category? This cannot be undone.`)) {
			deleteCategory(cat._id);
		}
	};

	return (
		<div className='space-y-6'>
			<form onSubmit={handleCreate} className='card p-5'>
				<h2 className='mb-4 text-lg font-semibold text-gray-900'>Add category</h2>
				<div className='grid gap-4 sm:grid-cols-2'>
					<div>
						<label className='mb-1 block text-xs font-medium text-gray-600'>Name</label>
						<input
							type='text'
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							className='input'
							placeholder='Hoodies'
						/>
					</div>
					<div>
						<label className='mb-1 block text-xs font-medium text-gray-600'>Image</label>
						<input key={fileKey} type='file' accept='image/*' required onChange={handleImage} className='text-sm' />
					</div>
				</div>
				<button type='submit' disabled={submitting || !image} className='btn-primary mt-4 px-4 py-2 text-sm'>
					{submitting ? "Adding..." : "Add category"}
				</button>
			</form>

			<div className='card overflow-hidden'>
				<ul className='divide-y divide-gray-100'>
					{categories.map((cat) => (
						<li key={cat._id} className='flex flex-wrap items-center gap-4 px-5 py-3'>
							<img src={cat.imageUrl} alt={cat.name} className='h-12 w-12 rounded-lg object-cover bg-gray-100' />

							<div className='min-w-0 flex-1'>
								{editingId === cat._id ? (
									<input
										autoFocus
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleRename(cat._id);
											if (e.key === "Escape") setEditingId(null);
										}}
										className='input py-1 text-sm'
									/>
								) : (
									<p className='truncate font-medium text-gray-900'>{cat.name}</p>
								)}
								<p className='text-xs text-gray-500'>
									/{cat.slug} · {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
								</p>
							</div>

							<div className='flex gap-2'>
								{editingId === cat._id ? (
									<>
										<button
											onClick={() => handleRename(cat._id)}
											className='inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50'
										>
											<Check size={12} /> Save
										</button>
										<button
											onClick={() => setEditingId(null)}
											className='inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50'
										>
											<X size={12} /> Cancel
										</button>
									</>
								) : (
									<button
										onClick={() => {
											setEditingId(cat._id);
											setEditName(cat.name);
										}}
										className='inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50'
									>
										<Pencil size={12} /> Rename
									</button>
								)}
								<button
									onClick={() => handleDelete(cat)}
									className='inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50'
								>
									<Trash2 size={12} /> Delete
								</button>
							</div>
						</li>
					))}
				</ul>
				{categories.length === 0 && <div className='p-10 text-center text-sm text-gray-500'>No categories yet.</div>}
			</div>
		</div>
	);
};

export default CategoriesTab;