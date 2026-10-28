import { useState } from "react";
import { PlusCircle, Upload, Loader } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
//import { categories } from "../lib/categories";
import { useCategoryStore } from "../stores/useCategoryStore";

const CreateProductForm = () => {
	const categories = useCategoryStore((s) => s.categories);
	const [newProduct, setNewProduct] = useState({
		name: "",
		description: "",
		price: "",
		category: "",
		image: "",
	});

	const { createProduct, loading } = useProductStore();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await createProduct(newProduct);
			setNewProduct({ name: "", description: "", price: "", category: "", image: "" });
		} catch {
			console.log("error creating a product");
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();

			reader.onloadend = () => {
				setNewProduct({ ...newProduct, image: reader.result });
			};

			reader.readAsDataURL(file); // base64
		}
	};

	return (
		<div className='card p-6 sm:p-8'>
			<h2 className='text-lg font-semibold text-gray-900'>Create new product</h2>
			<p className='mt-1 text-sm text-gray-600'>New products appear in their category straight away.</p>

			<form onSubmit={handleSubmit} className='mt-6 grid gap-5 lg:grid-cols-[1fr_260px]'>
				<div className='space-y-5'>
					<div>
						<label htmlFor='name' className='label'>
							Product name
						</label>
						<input
							type='text'
							id='name'
							name='name'
							value={newProduct.name}
							onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
							className='input'
							required
						/>
					</div>

					<div>
						<label htmlFor='description' className='label'>
							Description
						</label>
						<textarea
							id='description'
							name='description'
							value={newProduct.description}
							onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
							rows='4'
							className='input'
							required
						/>
					</div>

					<div className='grid gap-5 sm:grid-cols-2'>
						<div>
							<label htmlFor='price' className='label'>
								Price ($)
							</label>
							<input
								type='number'
								id='price'
								name='price'
								value={newProduct.price}
								onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
								step='0.01'
								min='0'
								className='input'
								required
							/>
						</div>

						<div>
							<label htmlFor='category' className='label'>
								Category
							</label>
							<select
								id='category'
								name='category'
								value={newProduct.category}
								onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
								className='input'
								required
							>
								<option value=''>Select a category</option>
								{categories.map((category) => (
									<option key={category.slug} value={category.slug}>
										{category.name}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<div>
					<span className='label'>Product image</span>
					<input type='file' id='image' className='sr-only' accept='image/*' onChange={handleImageChange} />
					<label
						htmlFor='image'
						className='flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-center hover:border-brand-400 hover:bg-brand-50/50'
					>
						{newProduct.image ? (
							<img src={newProduct.image} alt='Selected product' className='h-full w-full object-cover' />
						) : (
							<>
								<Upload className='h-8 w-8 text-gray-400' />
								<span className='mt-2 text-sm font-medium text-gray-700'>Upload image</span>
								<span className='text-xs text-gray-500'>PNG or JPG</span>
							</>
						)}
					</label>
				</div>

				<button type='submit' className='btn-primary py-3 lg:col-span-2' disabled={loading}>
					{loading ? (
						<>
							<Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
							Saving...
						</>
					) : (
						<>
							<PlusCircle className='h-5 w-5' />
							Create product
						</>
					)}
				</button>
			</form>
		</div>
	);
};
export default CreateProductForm;
