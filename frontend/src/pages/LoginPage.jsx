import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import AuthLayout from "../components/AuthLayout";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { login, loading } = useUserStore();

	const handleSubmit = (e) => {
		e.preventDefault();
		login(email, password);
	};

	return (
		<AuthLayout
			title='Log in to your account'
			subtitle='Welcome back! Enter your details to continue.'
			footer={
				<>
					New to ShopHub?{" "}
					<Link to='/signup' className='font-semibold text-brand-600 hover:text-brand-700'>
						Create an account
					</Link>
				</>
			}
		>
			<form onSubmit={handleSubmit} className='space-y-5'>
				<div>
					<label htmlFor='email' className='label'>
						Email address
					</label>
					<input
						id='email'
						type='email'
						autoComplete='email'
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className='input'
						placeholder='you@example.com'
					/>
				</div>

				<div>
					<label htmlFor='password' className='label'>
						Password
					</label>
					<input
						id='password'
						type='password'
						autoComplete='current-password'
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className='input'
						placeholder='••••••••'
					/>
				</div>

				<button type='submit' className='btn-primary w-full py-3' disabled={loading}>
					{loading ? (
						<>
							<Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
							Logging in...
						</>
					) : (
						"Log in"
					)}
				</button>
			</form>
		</AuthLayout>
	);
};
export default LoginPage;
