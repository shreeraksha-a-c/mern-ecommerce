import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader, ShoppingBag, Store } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import AuthLayout from "../components/AuthLayout";

const fields = [
	{ id: "name", label: "Full name", type: "text", autoComplete: "name", placeholder: "John Doe" },
	{ id: "email", label: "Email address", type: "email", autoComplete: "email", placeholder: "you@example.com" },
	{ id: "password", label: "Password", type: "password", autoComplete: "new-password", placeholder: "••••••••" },
	{
		id: "confirmPassword",
		label: "Confirm password",
		type: "password",
		autoComplete: "new-password",
		placeholder: "••••••••",
	},
];

const SignUpPage = () => {
	const [accountType, setAccountType] = useState("customer"); // "customer" or "vendor"
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const { signup, vendorSignup, loading } = useUserStore();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (accountType === "vendor") {
			vendorSignup(formData);
		} else {
			signup(formData);
		}
	};

	return (
		<AuthLayout
			title='Create your account'
			subtitle='Join thousands of happy shoppers and sellers.'
			footer={
				<>
					Already have an account?{" "}
					<Link to='/login' className='font-semibold text-brand-600 hover:text-brand-700'>
						Log in
					</Link>
				</>
			}
		>
			{/* Account Type Selector */}
			<div className='mb-6 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1.5'>
				<button
					type='button'
					onClick={() => setAccountType("customer")}
					className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
						accountType === "customer"
							? "bg-white text-brand-700 shadow-sm"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					<ShoppingBag size={15} />
					Shopper Account
				</button>
				<button
					type='button'
					onClick={() => setAccountType("vendor")}
					className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
						accountType === "vendor"
							? "bg-white text-emerald-700 shadow-sm"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					<Store size={15} />
					Vendor (Seller)
				</button>
			</div>

			<form onSubmit={handleSubmit} className='space-y-4'>
				{fields.map((field) => (
					<div key={field.id}>
						<label htmlFor={field.id} className='label'>
							{field.label}
						</label>
						<input
							id={field.id}
							type={field.type}
							autoComplete={field.autoComplete}
							required
							value={formData[field.id]}
							onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
							className='input'
							placeholder={field.placeholder}
						/>
					</div>
				))}

				<button
					type='submit'
					className={`w-full py-3 ${
						accountType === "vendor"
							? "btn-primary bg-emerald-600 hover:bg-emerald-700 ring-emerald-500"
							: "btn-primary"
					}`}
					disabled={loading}
				>
					{loading ? (
						<>
							<Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
							Creating {accountType === "vendor" ? "seller" : "customer"} account...
						</>
					) : (
						`Create ${accountType === "vendor" ? "Vendor" : "Shopper"} Account`
					)}
				</button>
			</form>
		</AuthLayout>
	);
};

export default SignUpPage;
