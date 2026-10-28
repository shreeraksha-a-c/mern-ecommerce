import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCategoryStore = create((set, get) => ({
	categories: [],
	loaded: false, // true once the first fetch finishes (success or fail)

	fetchCategories: async () => {
		try {
			const res = await axios.get("/categories");
			set({ categories: res.data || [], loaded: true });
		} catch (error) {
			set({ loaded: true });
			console.error("Error fetching categories:", error);
		}
	},

	createCategory: async ({ name, image }) => {
		try {
			await axios.post("/categories", { name, image });
			await get().fetchCategories();
			toast.success("Category created");
			return true;
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to create category");
			return false;
		}
	},

	renameCategory: async (id, name) => {
		try {
			await axios.put(`/categories/${id}`, { name });
			await get().fetchCategories();
			toast.success("Category renamed");
			return true;
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to rename category");
			return false;
		}
	},

	deleteCategory: async (id) => {
		try {
			await axios.delete(`/categories/${id}`);
			await get().fetchCategories();
			toast.success("Category deleted");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to delete category");
		}
	},
}));