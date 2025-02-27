import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

export const useBalanceStore = create((set, get) => ({
  income: 0,
  expenses: 0,

  // ✅ Monthly Stats
  monthlyStats: Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    totalIncome: 0,
    totalExpenses: 0,
  })),

  // ✅ Fetch transaction stats (Only Income & Expenses)
  fetchTransactionStats: async () => {
    try {
      const response = await axiosInstance.get("/transactions/stats", { withCredentials: true });

      const income = Number(response.data.income) || 0;
      const expenses = Number(response.data.expenses) || 0;
      const monthlyStats = response.data.monthlyStats || [];

      set(() => ({
        income,
        expenses,
        monthlyStats,
      }));

      console.log("✅ Transaction Stats Fetched:", { income, expenses, monthlyStats });
    } catch (error) {
      console.error("❌ Error fetching transaction stats:", error);
    }
  },

  // ✅ Add income & re-fetch stats
  addIncome: async (amount) => {
    try {
      const numericAmount = Number(amount) || 0;
      await axiosInstance.post("/transactions", { type: "income", amount: numericAmount }, { withCredentials: true });

      set((state) => ({
        income: state.income + numericAmount, // Temporary state update for instant UI feedback
      }));

      await get().fetchTransactionStats(); // ✅ Re-fetch latest stats to ensure correct balance
    } catch (error) {
      console.error("❌ Error adding income:", error);
    }
  },

  // ✅ Add expenses & re-fetch stats
  addExpenses: async (amount) => {
    try {
      const numericAmount = Number(amount) || 0;
      await axiosInstance.post("/transactions", { type: "expense", amount: numericAmount }, { withCredentials: true });

      set((state) => ({
        expenses: state.expenses + numericAmount, // Temporary state update for instant UI feedback
      }));

      await get().fetchTransactionStats(); // ✅ Re-fetch latest stats to ensure correct balance
    } catch (error) {
      console.error("❌ Error adding expense:", error);
    }
  },

  // ✅ Set monthly transaction stats
  setMonthlyStats: (stats) => {
    if (!Array.isArray(stats)) {
      console.warn("⚠️ Invalid stats format received:", stats);
      return;
    }

    set(() => ({ monthlyStats: stats }));
    console.log("✅ Monthly Stats Updated:", stats);
  },
}));