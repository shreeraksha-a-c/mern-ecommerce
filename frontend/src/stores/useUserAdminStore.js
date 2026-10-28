import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserAdminStore = create((set) => ({
	users: [],
	loading: false,

	fetchUsers: async () => {
		set({ loading: true });
		try {
			const res = await axios.get("/users");
			set({ users: res.data || [], loading: false });
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to load users");
		}
	},
}));