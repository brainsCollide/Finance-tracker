import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import { useBalanceStore } from "./balance.store";
import { useBudgetStore } from "./budget.store";

// Kategori baru masuk sebelum kategori sistem ("other"), yang selalu terakhir.
const insertBeforeSystem = (list, item) => [
  ...list.filter((c) => !c.isSystem),
  item,
  ...list.filter((c) => c.isSystem),
];

export const useCategoryStore = create((set) => ({
  categories: [],
  isLoaded: false,
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });

    try {
      const res = await axiosInstance.get("/categories");

      set({
        categories: Array.isArray(res.data) ? res.data : [],
        isLoaded: true,
      });
    } catch (err) {
      console.error(
        "fetchCategories error:",
        err.response?.data?.message || err.message
      );
    } finally {
      set({ isLoading: false });
    }
  },

  // Semua action di bawah melempar error supaya UI bisa menampilkan pesannya.
  createCategory: async (payload) => {
    const res = await axiosInstance.post("/categories", payload);

    set((state) => ({
      categories: insertBeforeSystem(state.categories, res.data),
    }));

    return res.data;
  },

  updateCategory: async (id, payload) => {
    const res = await axiosInstance.put(`/categories/${id}`, payload);

    set((state) => ({
      categories: state.categories.map((c) =>
        c._id === id ? res.data : c
      ),
    }));

    return res.data;
  },

  getCategoryUsage: async (id) => {
    const res = await axiosInstance.get(`/categories/${id}/usage`);
    return res.data; // { transactions, budgets }
  },

  // Transaksi dipindah ke "other" dan budget ikut terhapus di backend,
  // jadi dua store ini harus di-refresh.
  deleteCategory: async (id) => {
    const res = await axiosInstance.delete(`/categories/${id}`);

    set((state) => ({
      categories: state.categories.filter((c) => c._id !== id),
    }));

    await Promise.all([
      useBalanceStore.getState().fetchTransactions(),
      useBudgetStore.getState().fetchBudgets(),
    ]);

    return res.data; // { movedTransactions, deletedBudgets }
  },

  reset: () => set({ categories: [], isLoaded: false }),
}));