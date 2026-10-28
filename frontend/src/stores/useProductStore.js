import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
	products: [],
	currentProduct: null,
	bestsellers: [],
	trending: [],
	vendorProducts: [],
	lowStockProducts: [],
	loading: false,

	setProducts: (products) => set({ products }),

	createProduct: async (productData) => {
		set({ loading: true });
		try {
			const res = await axios.post("/products", productData);
			set((prevState) => ({
				products: [...prevState.products, res.data],
				loading: false,
			}));
			toast.success("Product created successfully!");
		} catch (error) {
			toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to create product");
			set({ loading: false });
		}
	},

	fetchAllProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products");
			set({ products: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response?.data?.error || "Failed to fetch products");
		}
	},

	fetchProductById: async (productId) => {
		set({ loading: true, currentProduct: null });
		try {
			const response = await axios.get(`/products/${productId}`);
			set({ currentProduct: response.data, loading: false });
			return response.data;
		} catch (error) {
			set({ loading: false });
			console.error("Error fetching product by id:", error);
			return null;
		}
	},

	fetchProductsByCategory: async (category) => {
		set({ loading: true });
		try {
			const response = await axios.get(`/products/category/${category}`);
			set({ products: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response?.data?.error || "Failed to fetch products");
		}
	},

	deleteProduct: async (productId) => {
		set({ loading: true });
		try {
			await axios.delete(`/products/${productId}`);
			set((prevProducts) => ({
				products: prevProducts.products.filter((product) => product._id !== productId),
				loading: false,
			}));
			toast.success("Product deleted successfully");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.error || "Failed to delete product");
		}
	},

	toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.patch(`/products/${productId}`);
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
				),
				loading: false,
			}));
			toast.success("Product featured status updated");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.error || "Failed to update product");
		}
	},

	updateStock: async (productId, stock) => {
		try {
			const response = await axios.patch(`/products/${productId}/stock`, { stock: Number(stock) });
			set((state) => ({
				products: state.products.map((p) => (p._id === productId ? response.data : p)),
			}));
			toast.success("Stock updated successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update stock");
		}
	},

		// Admin: edit price/stock of ANY product
	updateProduct: async (productId, data) => {
		try {
			const res = await axios.put(`/products/${productId}`, data);
			set((state) => ({
				products: state.products.map((p) =>
					p._id === productId ? { ...p, ...data, ...(res.data?._id ? res.data : {}) } : p
				),
			}));
			toast.success("Product updated");
			return true;
		} catch (error) {
			toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to update product");
			return false;
		}
	},

	fetchFeaturedProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products/featured");
			set({ products: response.data, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			console.log("Error fetching featured products:", error);
		}
	},

	fetchBestsellers: async () => {
		try {
			const res = await axios.get("/products/bestsellers");
			set({ bestsellers: res.data || [] });
		} catch (error) {
			console.error("Error fetching bestsellers:", error);
		}
	},

	fetchTrending: async () => {
		try {
			const res = await axios.get("/products/trending");
			set({ trending: res.data || [] });
		} catch (error) {
			console.error("Error fetching trending products:", error);
		}
	},

	// Vendor Operations
	fetchVendorProducts: async () => {
		set({ loading: true });
		try {
			const res = await axios.get("/products/vendor/mine");
			set({ vendorProducts: res.data || [], loading: false });
		} catch (error) {
			set({ loading: false });
			console.error("Error fetching vendor products:", error);
		}
	},

	createVendorProduct: async (data) => {
		set({ loading: true });
		try {
			const res = await axios.post("/products/vendor", data);
			set((state) => ({
				vendorProducts: [...state.vendorProducts, res.data],
				loading: false,
			}));
			toast.success("Product listed successfully!");
			return true;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to list product");
			return false;
		}
	},

	updateVendorProduct: async (id, data) => {
		set({ loading: true });
		try {
			const res = await axios.put(`/products/vendor/${id}`, data);
			set((state) => ({
				//vendorProducts: state.vendorProducts.map((p) => (p._id === id ? res.data : p)),
				vendorProducts: state.vendorProducts.map((p) => (p._id === id ? { ...p, ...res.data } : p)),
				loading: false,
			}));
			toast.success("Product updated successfully!");
			return true;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to update product");
			return false;
		}
	},

	deleteVendorProduct: async (id) => {
		try {
			await axios.delete(`/products/vendor/${id}`);
			set((state) => ({
				vendorProducts: state.vendorProducts.filter((p) => p._id !== id),
			}));
			toast.success("Product deleted successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to delete product");
		}
	},

	fetchLowStockProducts: async (threshold = 5) => {
		try {
			const res = await axios.get(`/products/low-stock?threshold=${threshold}`);
			set({ lowStockProducts: res.data || [] });
		} catch (error) {
			console.error("Error fetching low stock products:", error);
		}
	},
}));
