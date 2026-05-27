// stores/auth.store.js
import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,

  fetchUser: async () => {
    const { user } = get();

    // optional: avoid refetch kalau sudah ada
    if (user) return user;

    try {
      set({ loading: true });

      const res = await axiosInstance.get("/auth/current", {
        withCredentials: true,
      });

      set({ user: res.data.user });
      return res.data.user;
    } catch (err) {
      set({ user: null });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  clearUser: () => set({ user: null }),
}));