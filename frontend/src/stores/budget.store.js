import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

export const useBudgetStore = create((set, get) => ({
  budgets: [],
  isLoadingBudgets: false,

  // ─────────────────────────────
  // FETCH + ENRICH DATA
  // ─────────────────────────────
  fetchBudgets: async () => {
    set({ isLoadingBudgets: true });

    try {
      const [budgetsRes, transRes] = await Promise.all([
        axiosInstance.get("/budgets"),
        axiosInstance.get("/transactions"),
      ]);

      const budgets = Array.isArray(budgetsRes.data)
        ? budgetsRes.data
        : [];

      const transactions = transRes.data || [];

      // hitung spent per category
      const spentByCategory = transactions.reduce((acc, tx) => {
        if (tx.type === "expense" && tx.category) {
          const key = tx.category.toLowerCase();

          acc[key] =
            (acc[key] || 0) + Number(tx.amount || 0);
        }

        return acc;
      }, {});

      const enriched = budgets.map((b) => {
        const spent =
          spentByCategory[b.category?.toLowerCase()] || 0;

        const limit = Number(b.limit) || 0;

        return {
          ...b,
          spent,
          percentage:
            limit > 0 ? (spent / limit) * 100 : 0,
        };
      });

      set({ budgets: enriched });
    } catch (err) {
      console.error("fetchBudgets error:", err);

      set({ budgets: [] });
    } finally {
      set({ isLoadingBudgets: false });
    }
  },

  // ─────────────────────────────
  // CREATE
  // ─────────────────────────────
  addBudget: (budget) => {
    set((state) => ({
      budgets: [budget, ...state.budgets],
    }));
  },

  // ─────────────────────────────
  // UPDATE
  // ─────────────────────────────
  updateBudget: (updated) => {
    set((state) => ({
      budgets: state.budgets.map((b) =>
        b._id === updated._id
          ? { ...b, ...updated }
          : b
      ),
    }));
  },

  upsertBudget: (budget) =>
  set((state) => {
    const exists = state.budgets.find(b => b._id === budget._id);

    if (exists) {
      return {
        budgets: state.budgets.map(b =>
          b._id === budget._id ? budget : b
        ),
      };
    }

    return {
      budgets: [budget, ...state.budgets],
    };
  }),

  // ─────────────────────────────
  // DELETE FROM DATABASE + UI
  // ─────────────────────────────
  deleteBudget: async (id) => {
    try {
      // delete di backend
      await axiosInstance.delete(`/budgets/${id}`);

      // update UI local
      set((state) => ({
        budgets: state.budgets.filter(
          (b) => b._id !== id
        ),
      }));
    } catch (err) {
      console.error("deleteBudget error:", err);
      throw err;
    }
  },
}));