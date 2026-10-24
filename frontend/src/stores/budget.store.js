
import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

export const useBudgetStore = create((set) => ({
  budgets: [],
  isLoadingBudgets: false,
  error: null,

  // Fetch budget beserta spent yang sudah dihitung backend.
  fetchBudgets: async () => {
    set({
      isLoadingBudgets: true,
      error: null,
    });

    try {
      const response = await axiosInstance.get("/budgets");

      const budgets = Array.isArray(response.data)
        ? response.data
        : [];

      set({
        budgets,
        error: null,
      });
    } catch (err) {
      console.error(
        "fetchBudgets error:",
        err.response?.data?.message || err.message
      );

      set({
        error:
          err.response?.data?.message ||
          "Failed to load budgets. Please try again.",
      });
    } finally {
      set({ isLoadingBudgets: false });
    }
  },

  // Tambah budget ke state lokal.
  addBudget: (budget) => {
    set((state) => ({
      budgets: [budget, ...state.budgets],
    }));
  },

  // Update budget di state lokal.
  updateBudget: (updated) => {
    set((state) => ({
      budgets: state.budgets.map((budget) =>
        budget._id === updated._id
          ? { ...budget, ...updated }
          : budget
      ),
    }));
  },

  // Tambah atau update budget setelah disimpan.
  upsertBudget: (budget) => {
    set((state) => {
      const exists = state.budgets.some(
        (item) => item._id === budget._id
      );

      return {
        budgets: exists
          ? state.budgets.map((item) =>
              item._id === budget._id
                ? { ...item, ...budget }
                : item
            )
          : [budget, ...state.budgets],
      };
    });
  },

  // Delete di backend terlebih dahulu, lalu update UI.
  deleteBudget: async (id) => {
    try {
      await axiosInstance.delete(`/budgets/${id}`);

      set((state) => ({
        budgets: state.budgets.filter(
          (budget) => budget._id !== id
        ),
      }));
    } catch (err) {
      console.error(
        "deleteBudget error:",
        err.response?.data?.message || err.message
      );

      throw err;
    }
  },
}));
