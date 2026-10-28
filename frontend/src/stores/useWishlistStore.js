import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const getLocalWishlist = () => {
	try {
		const saved = localStorage.getItem("shop_wishlist");
		return saved ? JSON.parse(saved) : [];
	} catch (e) {
		return [];
	}
};

const saveLocalWishlist = (items) => {
	try {
		localStorage.setItem("shop_wishlist", JSON.stringify(items));
	} catch (e) {}
};

export const useWishlistStore = create((set, get) => ({
	wishlist: getLocalWishlist(),
	loading: false,

	getWishlist: async () => {
		set({ loading: true });
		try {
			const res = await axios.get("/wishlist");
			const serverList = res.data || [];
			set({ wishlist: serverList, loading: false });
			saveLocalWishlist(serverList);
		} catch (error) {
			// If not logged in, keep local wishlist
			set({ wishlist: getLocalWishlist(), loading: false });
		}
	},

	addToWishlist: async (product) => {
		// Update local state first for immediate UI response
		const current = get().wishlist;
		const alreadyIn = current.some((item) => (item._id || item) === product._id);
		if (!alreadyIn) {
			const updated = [...current, product];
			set({ wishlist: updated });
			saveLocalWishlist(updated);
		}

		try {
			await axios.post(`/wishlist/${product._id}`);
			toast.success("Added to wishlist!");
		} catch (error) {
			// Even if server request fails (e.g. guest mode), we stored it locally!
			toast.success("Saved to your wishlist!");
		}
	},

	removeFromWishlist: async (productId) => {
		const updated = get().wishlist.filter((item) => (item._id || item) !== productId);
		set({ wishlist: updated });
		saveLocalWishlist(updated);

		try {
			await axios.delete(`/wishlist/${productId}`);
			toast.success("Removed from wishlist");
		} catch (error) {
			toast.success("Removed from wishlist");
		}
	},

	toggleWishlist: async (product) => {
		const isLiked = get().isInWishlist(product._id);
		if (isLiked) {
			await get().removeFromWishlist(product._id);
		} else {
			await get().addToWishlist(product);
		}
	},

	isInWishlist: (productId) => {
		return get().wishlist.some((item) => (item._id || item) === productId);
	},

	clearWishlist: () => {
		localStorage.removeItem("shop_wishlist");
		set({ wishlist: [] });
	},
}));
