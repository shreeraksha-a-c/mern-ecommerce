import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";
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
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const { signup, loading } = useUserStore();

	const handleSubmit = (e) => {
		e.preventDefault();
		signup(formData);
	};

	return (
		<AuthLayout
			title='Create your account'
			subtitle='It only takes a minute to get started.'
			footer={
				<>
					Already have an account?{" "}
					<Link to='/login' className='font-semibold text-brand-600 hover:text-brand-700'>
						Log in
					</Link>
				</>
			}
		>
			<form onSubmit={handleSubmit} className='space-y-5'>
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

				<button type='submit' className='btn-primary w-full py-3' disabled={loading}>
					{loading ? (
						<>
							<Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
							Creating account...
						</>
					) : (
						"Create account"
					)}
				</button>
			</form>
		</AuthLayout>
	);
};
export default SignUpPage;
