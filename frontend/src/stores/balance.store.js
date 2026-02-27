import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

export const useBalanceStore = create((set, get) => ({
  income: 0,
  expenses: 0,
  transactions: [],
  monthlyStats: Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    totalIncome: 0,
    totalExpenses: 0,
  })),

  // 1. Fetch List Transaksi (Untuk Doughnut Chart)
  fetchTransactions: async () => {
    try {
      const response = await axiosInstance.get("/transactions", { withCredentials: true });
      set({ transactions: response.data });
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
    }
  },

  // 2. Fetch Statistik (Untuk Stat Cards & Bar Chart)
  fetchTransactionStats: async () => {
    try {
      const response = await axiosInstance.get("/transactions/stats", { withCredentials: true });
      set({
        income: Number(response.data.income) || 0,
        expenses: Number(response.data.expenses) || 0,
        monthlyStats: response.data.monthlyStats || [],
      });
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
    }
  },

  // 3. Fungsi Tambah Transaksi (Satu Pintu untuk Update Semua)
  addTransaction: async (transactionData) => {
    try {
      await axiosInstance.post("/transactions", transactionData, { withCredentials: true });
      
      // ✅ TRIGGER UPDATE INSTAN:
      // Ambil data terbaru untuk Cards, Bar Chart, dan Doughnut Chart secara paralel
      await Promise.all([
        get().fetchTransactionStats(),
        get().fetchTransactions()
      ]);
    } catch (error) {
      throw error;
    }
  },

  // Helper untuk Payment (Opsional jika masih dipakai)
  markPaymentAsPaid: async (amount) => {
    try {
      await axiosInstance.post("/transactions", {
        type: "expense",
        amount: Number(amount),
        title: "Paid Upcoming Payment",
        category: "other",
      });
      await get().fetchTransactionStats();
      await get().fetchTransactions();
    } catch (error) {
      throw error;
    }
  },
}));