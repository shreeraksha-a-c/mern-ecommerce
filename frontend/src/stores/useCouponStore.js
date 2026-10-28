import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCouponStore = create((set) => ({
	coupons: [],
	loading: false,

	fetchCoupons: async () => {
		set({ loading: true });
		try {
			const res = await axios.get("/coupons/all");
			set({ coupons: res.data || [], loading: false });
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to load coupons");
		}
	},

	// create/update return true on success so the form knows when to reset
	createCoupon: async (data) => {
		try {
			const res = await axios.post("/coupons", data);
			set((state) => ({ coupons: [res.data, ...state.coupons] }));
			toast.success("Coupon created");
			return true;
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to create coupon");
			return false;
		}
	},

	updateCoupon: async (id, data) => {
		try {
			const res = await axios.put(`/coupons/${id}`, data);
			set((state) => ({ coupons: state.coupons.map((c) => (c._id === id ? res.data : c)) }));
			toast.success("Coupon updated");
			return true;
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update coupon");
			return false;
		}
	},

	deleteCoupon: async (id) => {
		try {
			await axios.delete(`/coupons/${id}`);
			set((state) => ({ coupons: state.coupons.filter((c) => c._id !== id) }));
			toast.success("Coupon deleted");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to delete coupon");
		}
	},
}));