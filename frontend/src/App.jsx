import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import VendorPage from "./pages/VendorPage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";

import { useUserStore } from "./stores/useUserStore";
import { useCartStore } from "./stores/useCartStore";
import { useWishlistStore } from "./stores/useWishlistStore";

function App() {
	const { user, checkAuth, checkingAuth } = useUserStore();
	const { getCartItems } = useCartStore();
	const { getWishlist } = useWishlistStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	useEffect(() => {
		if (!user) return;

		getCartItems();
		getWishlist();
	}, [getCartItems, getWishlist, user]);

	if (checkingAuth) return <LoadingSpinner />;

	return (
		<div className='flex min-h-screen flex-col'>
			<Navbar />
			<main className='flex-1'>
				<Routes>
					{/* Public Routes */}
					<Route path='/' element={<HomePage />} />
					<Route path='/category/:category' element={<CategoryPage />} />
					<Route path='/search' element={<SearchPage />} />
					<Route path='/product/:id' element={<ProductDetailPage />} />

					{/* Guest Only Routes */}
					<Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
					<Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />

					<Route path='/wishlist' element={<WishlistPage />} />
					<Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' />} />
					<Route path='/orders' element={user ? <OrdersPage /> : <Navigate to='/login' />} />
					<Route path='/profile' element={user ? <ProfilePage /> : <Navigate to='/login' />} />
					<Route
						path='/purchase-success'
						element={user ? <PurchaseSuccessPage /> : <Navigate to='/login' />}
					/>
					<Route
						path='/purchase-cancel'
						element={user ? <PurchaseCancelPage /> : <Navigate to='/login' />}
					/>

					{/* Role Protected Dashboards */}
					<Route
						path='/vendor-dashboard'
						element={user?.role === "vendor" ? <VendorPage /> : <Navigate to='/login' />}
					/>
					<Route
						path='/secret-dashboard'
						element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />}
					/>

					{/* Catch-all Fallback */}
					<Route path='*' element={<Navigate to='/' />} />
				</Routes>
			</main>
			<Footer />
			<Toaster
				position='top-center'
				toastOptions={{ className: "text-sm font-medium", style: { borderRadius: "10px" } }}
			/>
		</div>
	);
}

export default App;
