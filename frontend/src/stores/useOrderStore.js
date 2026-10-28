import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

// the backend sometimes returns the order itself and sometimes { message, order }
const unwrapOrder = (data) => data?.order || data;

// keep the populated fields (customer, product images) and only update the status
const withStatus = (order, id, status) => (order._id === id ? { ...order, status } : order);

export const useOrderStore = create((set) => ({
	orders: [],
	orderDetail: null,
	allOrders: [],
	vendorOrders: [],
	loading: false,

	fetchMyOrders: async () => {
		set({ loading: true });
		try {
			const res = await axios.get("/orders/my");
			set({ orders: res.data || [], loading: false });
		} catch (error) {
			set({ loading: false });
			console.error("Error fetching my orders:", error);
		}
	},

	fetchOrderById: async (orderId) => {
		set({ loading: true });
		try {
			const res = await axios.get(`/orders/${orderId}`);
			set({ orderDetail: res.data, loading: false });
			return res.data;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to load order details");
			return null;
		}
	},

	cancelOrder: async (orderId) => {
		set({ loading: true });
		try {
			const res = await axios.post(`/orders/${orderId}/cancel`);
			const status = unwrapOrder(res.data).status;
			set((state) => ({
				orders: state.orders.map((o) => withStatus(o, orderId, status)),
				orderDetail:
					state.orderDetail?._id === orderId ? { ...state.orderDetail, status } : state.orderDetail,
				loading: false,
			}));
			toast.success("Order cancelled successfully");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to cancel order");
		}
	},

	fetchAllOrders: async () => {
		set({ loading: true });
		try {
			// backend returns { orders, page, totalPages, total }; ask for the maximum page size
			const res = await axios.get("/orders?limit=50");
			const list = Array.isArray(res.data) ? res.data : res.data?.orders || [];
			set({ allOrders: list, loading: false });
		} catch (error) {
			set({ loading: false });
			console.error("Error fetching all orders:", error);
		}
	},

	// returns one user's orders (admin); not stored globally, the caller keeps them
	fetchOrdersByUser: async (userId) => {
		try {
			const res = await axios.get(`/orders?user=${userId}&limit=50`);
			return res.data?.orders || [];
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to load user's orders");
			return [];
		}
	},

	updateOrderStatus: async (orderId, status) => {
		try {
			const res = await axios.patch(`/orders/${orderId}/status`, { status });
			const newStatus = unwrapOrder(res.data).status;
			set((state) => ({
				allOrders: state.allOrders.map((o) => withStatus(o, orderId, newStatus)),
			}));
			toast.success(`Order status updated to ${status}`);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update order status");
		}
	},

	refundOrder: async (orderId) => {
		try {
			const res = await axios.post(`/orders/${orderId}/refund`);
			const newStatus = unwrapOrder(res.data).status;
			set((state) => ({
				allOrders: state.allOrders.map((o) => withStatus(o, orderId, newStatus)),
			}));
			toast.success("Order refunded and restocked successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to refund order");
		}
	},

	fetchVendorOrders: async () => {
		set({ loading: true });
		try {
			const res = await axios.get("/orders/vendor");
			set({ vendorOrders: res.data || [], loading: false });
		} catch (error) {
			set({ loading: false });
			console.error("Error fetching vendor orders:", error);
		}
	},

	updateVendorOrderStatus: async (orderId, status) => {
		try {
			const res = await axios.patch(`/orders/${orderId}/vendor-status`, { status });
			const newStatus = unwrapOrder(res.data).status;
			set((state) => ({
				vendorOrders: state.vendorOrders.map((o) => withStatus(o, orderId, newStatus)),
			}));
			toast.success(`Order marked as ${status}`);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update status");
		}
	},
}));