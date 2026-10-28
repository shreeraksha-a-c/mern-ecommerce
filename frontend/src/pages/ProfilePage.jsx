import { useState } from "react";
import { useUserStore } from "../stores/useUserStore";
import { useOrderStore } from "../stores/useOrderStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useCartStore } from "../stores/useCartStore";
import {
	User,
	MapPin,
	KeyRound,
	Trash2,
	Save,
	Package,
	Heart,
	ShoppingCart,
	ShieldAlert,
	Loader,
	CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
	const { user, updateProfile, changePassword, deleteAccount, loading } = useUserStore();
	const { orders } = useOrderStore();
	const { wishlist } = useWishlistStore();
	const { cart } = useCartStore();

	const [activeTab, setActiveTab] = useState("profile");

	// Personal Info Form
	const [personalData, setPersonalData] = useState({
		name: user?.name || "",
		phone: user?.phone || "",
	});

	// Shipping Address Form
	const [addressData, setAddressData] = useState({
		line1: user?.address?.line1 || "",
		line2: user?.address?.line2 || "",
		city: user?.address?.city || "",
		state: user?.address?.state || "",
		postalCode: user?.address?.postalCode || "",
		country: user?.address?.country || "",
	});

	// Password Form
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handlePersonalSubmit = async (e) => {
		e.preventDefault();
		await updateProfile({
			name: personalData.name,
			phone: personalData.phone,
		});
	};

	const handleAddressSubmit = async (e) => {
		e.preventDefault();
		await updateProfile({
			address: addressData,
		});
	};

	const handlePasswordSubmit = async (e) => {
		e.preventDefault();
		const success = await changePassword(passwordData);
		if (success) {
			setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
		}
	};

	const handleDeleteAccount = async () => {
		if (
			window.confirm(
				"Are you sure you want to permanently delete your account? All order history and saved data will be removed."
			)
		) {
			await deleteAccount();
		}
	};

	return (
		<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
			{/* Header with User Info & Stats */}
			<div className='card overflow-hidden bg-gradient-to-r from-brand-700 to-brand-900 text-white p-6 sm:p-8'>
				<div className='flex flex-wrap items-center justify-between gap-6'>
					<div className='flex items-center gap-4'>
						<div className='flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold uppercase shadow-inner'>
							{user?.name?.charAt(0) || "U"}
						</div>
						<div>
							<div className='flex items-center gap-2.5'>
								<h1 className='text-2xl font-extrabold sm:text-3xl'>{user?.name}</h1>
								<span className='rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-brand-100'>
									{user?.role}
								</span>
							</div>
							<p className='text-sm text-brand-200 mt-0.5'>{user?.email}</p>
						</div>
					</div>

					{/* Quick Stats */}
					<div className='flex flex-wrap items-center gap-4 sm:gap-6'>
						<div className='rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur'>
							<span className='text-xs uppercase tracking-wider text-brand-200'>Orders</span>
							<p className='text-xl font-bold'>{orders.length}</p>
						</div>
						<div className='rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur'>
							<span className='text-xs uppercase tracking-wider text-brand-200'>Wishlist</span>
							<p className='text-xl font-bold'>{wishlist.length}</p>
						</div>
						<div className='rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur'>
							<span className='text-xs uppercase tracking-wider text-brand-200'>In Cart</span>
							<p className='text-xl font-bold'>{cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Settings Tabs */}
			<div className='mt-8 grid gap-8 lg:grid-cols-[240px_1fr]'>
				{/* Sidebar Tabs */}
				<nav className='flex gap-2 overflow-x-auto lg:flex-col' aria-label='Account tabs'>
					<button
						onClick={() => setActiveTab("profile")}
						className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
							activeTab === "profile"
								? "bg-brand-600 text-white shadow-sm"
								: "text-gray-700 hover:bg-white hover:shadow-sm"
						}`}
					>
						<User size={18} />
						Personal Details
					</button>

					<button
						onClick={() => setActiveTab("address")}
						className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
							activeTab === "address"
								? "bg-brand-600 text-white shadow-sm"
								: "text-gray-700 hover:bg-white hover:shadow-sm"
						}`}
					>
						<MapPin size={18} />
						Shipping Address
					</button>

					<button
						onClick={() => setActiveTab("security")}
						className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
							activeTab === "security"
								? "bg-brand-600 text-white shadow-sm"
								: "text-gray-700 hover:bg-white hover:shadow-sm"
						}`}
					>
						<KeyRound size={18} />
						Security & Password
					</button>

					<button
						onClick={() => setActiveTab("danger")}
						className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
							activeTab === "danger"
								? "bg-red-600 text-white shadow-sm"
								: "text-red-600 hover:bg-red-50 hover:shadow-sm"
						}`}
					>
						<Trash2 size={18} />
						Danger Zone
					</button>
				</nav>

				{/* Tab Panels */}
				<div className='card p-6 sm:p-8'>
					{activeTab === "profile" && (
						<div>
							<h2 className='text-xl font-bold text-gray-900'>Personal Information</h2>
							<p className='mt-1 text-sm text-gray-600'>Update your display name and contact phone number.</p>

							<form onSubmit={handlePersonalSubmit} className='mt-6 space-y-5 max-w-lg'>
								<div>
									<label htmlFor='fullName' className='label'>
										Full Name
									</label>
									<input
										id='fullName'
										type='text'
										required
										value={personalData.name}
										onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
										className='input'
									/>
								</div>

								<div>
									<label htmlFor='email' className='label'>
										Email Address
									</label>
									<input
										id='email'
										type='email'
										disabled
										value={user?.email || ""}
										className='input bg-gray-50 text-gray-500 cursor-not-allowed'
									/>
									<span className='mt-1 block text-xs text-gray-400'>
										Email address is tied to your account authentication and cannot be edited.
									</span>
								</div>

								<div>
									<label htmlFor='phone' className='label'>
										Phone Number
									</label>
									<input
										id='phone'
										type='tel'
										placeholder='+1 (555) 000-0000'
										value={personalData.phone}
										onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
										className='input'
									/>
								</div>

								<button type='submit' disabled={loading} className='btn-primary mt-2'>
									{loading ? <Loader className='h-4 w-4 animate-spin' /> : <Save size={16} />}
									Save Changes
								</button>
							</form>
						</div>
					)}

					{activeTab === "address" && (
						<div>
							<h2 className='text-xl font-bold text-gray-900'>Shipping Address</h2>
							<p className='mt-1 text-sm text-gray-600'>
								Manage your default delivery address for faster checkout.
							</p>

							<form onSubmit={handleAddressSubmit} className='mt-6 space-y-4 max-w-xl'>
								<div>
									<label htmlFor='line1' className='label'>
										Address Line 1
									</label>
									<input
										id='line1'
										type='text'
										placeholder='123 Main St, Apt 4B'
										value={addressData.line1}
										onChange={(e) => setAddressData({ ...addressData, line1: e.target.value })}
										className='input'
									/>
								</div>

								<div>
									<label htmlFor='line2' className='label'>
										Address Line 2 (Optional)
									</label>
									<input
										id='line2'
										type='text'
										placeholder='Suite, building, floor'
										value={addressData.line2}
										onChange={(e) => setAddressData({ ...addressData, line2: e.target.value })}
										className='input'
									/>
								</div>

								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<div>
										<label htmlFor='city' className='label'>
											City
										</label>
										<input
											id='city'
											type='text'
											placeholder='New York'
											value={addressData.city}
											onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
											className='input'
										/>
									</div>

									<div>
										<label htmlFor='state' className='label'>
											State / Province
										</label>
										<input
											id='state'
											type='text'
											placeholder='NY'
											value={addressData.state}
											onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
											className='input'
										/>
									</div>
								</div>

								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<div>
										<label htmlFor='postalCode' className='label'>
											Postal Code
										</label>
										<input
											id='postalCode'
											type='text'
											placeholder='10001'
											value={addressData.postalCode}
											onChange={(e) => setAddressData({ ...addressData, postalCode: e.target.value })}
											className='input'
										/>
									</div>

									<div>
										<label htmlFor='country' className='label'>
											Country
										</label>
										<input
											id='country'
											type='text'
											placeholder='United States'
											value={addressData.country}
											onChange={(e) => setAddressData({ ...addressData, country: e.target.value })}
											className='input'
										/>
									</div>
								</div>

								<button type='submit' disabled={loading} className='btn-primary mt-3'>
									{loading ? <Loader className='h-4 w-4 animate-spin' /> : <Save size={16} />}
									Update Address
								</button>
							</form>
						</div>
					)}

					{activeTab === "security" && (
						<div>
							<h2 className='text-xl font-bold text-gray-900'>Change Password</h2>
							<p className='mt-1 text-sm text-gray-600'>Ensure your account is using a strong password.</p>

							<form onSubmit={handlePasswordSubmit} className='mt-6 space-y-4 max-w-md'>
								<div>
									<label htmlFor='currentPassword' className='label'>
										Current Password
									</label>
									<input
										id='currentPassword'
										type='password'
										required
										placeholder='••••••••'
										value={passwordData.currentPassword}
										onChange={(e) =>
											setPasswordData({ ...passwordData, currentPassword: e.target.value })
										}
										className='input'
									/>
								</div>

								<div>
									<label htmlFor='newPassword' className='label'>
										New Password (min 6 characters)
									</label>
									<input
										id='newPassword'
										type='password'
										required
										minLength={6}
										placeholder='••••••••'
										value={passwordData.newPassword}
										onChange={(e) =>
											setPasswordData({ ...passwordData, newPassword: e.target.value })
										}
										className='input'
									/>
								</div>

								<div>
									<label htmlFor='confirmPassword' className='label'>
										Confirm New Password
									</label>
									<input
										id='confirmPassword'
										type='password'
										required
										minLength={6}
										placeholder='••••••••'
										value={passwordData.confirmPassword}
										onChange={(e) =>
											setPasswordData({ ...passwordData, confirmPassword: e.target.value })
										}
										className='input'
									/>
								</div>

								<button type='submit' disabled={loading} className='btn-primary mt-2'>
									{loading ? <Loader className='h-4 w-4 animate-spin' /> : <KeyRound size={16} />}
									Update Password
								</button>
							</form>
						</div>
					)}

					{activeTab === "danger" && (
						<div>
							<div className='flex items-center gap-2 text-red-600'>
								<ShieldAlert size={24} />
								<h2 className='text-xl font-bold'>Danger Zone</h2>
							</div>
							<p className='mt-2 text-sm text-gray-600'>
								Deleting your account is permanent. All your order history, personal addresses, and cart
								contents will be deleted immediately.
							</p>

							<div className='mt-6 rounded-lg border border-red-200 bg-red-50/50 p-5 max-w-lg'>
								<h3 className='font-semibold text-red-900'>Delete this account</h3>
								<p className='mt-1 text-xs text-red-700'>
									Once you delete your account, there is no going back. Please be certain.
								</p>
								<button
									onClick={handleDeleteAccount}
									disabled={loading}
									className='mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition disabled:opacity-50'
								>
									<Trash2 size={16} />
									Permanently Delete Account
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
