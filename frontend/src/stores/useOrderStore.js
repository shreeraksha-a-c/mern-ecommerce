import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

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
			set((state) => ({
				orders: state.orders.map((o) => (o._id === orderId ? res.data : o)),
				orderDetail: state.orderDetail?._id === orderId ? res.data : state.orderDetail,
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
			const res = await axios.get("/orders");
			set({ allOrders: res.data || [], loading: false });
		} catch (error) {
			set({ loading: false });
			console.error("Error fetching all orders:", error);
		}
	},

	updateOrderStatus: async (orderId, status) => {
		try {
			const res = await axios.patch(`/orders/${orderId}/status`, { status });
			set((state) => ({
				allOrders: state.allOrders.map((o) => (o._id === orderId ? res.data : o)),
			}));
			toast.success(`Order status updated to ${status}`);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update order status");
		}
	},

	refundOrder: async (orderId) => {
		try {
			const res = await axios.post(`/orders/${orderId}/refund`);
			set((state) => ({
				allOrders: state.allOrders.map((o) => (o._id === orderId ? res.data : o)),
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
			set((state) => ({
				vendorOrders: state.vendorOrders.map((o) => (o._id === orderId ? res.data : o)),
			}));
			toast.success(`Order marked as ${status}`);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update status");
		}
	},
}));
