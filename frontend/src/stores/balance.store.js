
import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import { useBudgetStore } from "./budget.store";

export const useBalanceStore = create((set, get) => ({
  income: 0,
  expenses: 0,
  transactions: [],

  // Akumulasi Januari sampai bulan yang dipilih backend
  yearToDate: {
    income: 0,
    expenses: 0,
    netCashflow: 0,
  },

  // Periode aktif dari backend
  period: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  },

  // Statistik Januari–Desember untuk Bar Chart
  monthlyStats: Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    totalIncome: 0,
    totalExpenses: 0,
  })),

  // 1. Fetch daftar transaksi (Doughnut Chart)
  fetchTransactions: async () => {
    try {
      const response = await axiosInstance.get("/transactions", {
        withCredentials: true,
      });

      set({ transactions: response.data });
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
    }
  },

  // 2. Fetch statistik (Stat Cards & Bar Chart)
  fetchTransactionStats: async () => {
    try {
      const response = await axiosInstance.get("/transactions/stats", {
        withCredentials: true,
      });

      const data = response.data;

      set({
        income: Number(data.income) || 0,
        expenses: Number(data.expenses) || 0,

        yearToDate: {
          income: Number(data.yearToDate?.income) || 0,
          expenses: Number(data.yearToDate?.expenses) || 0,
          netCashflow: Number(data.yearToDate?.netCashflow) || 0,
        },

        period: {
          year: Number(data.period?.year) || new Date().getFullYear(),
          month:
            Number(data.period?.month) || new Date().getMonth() + 1,
        },

        monthlyStats: Array.from({ length: 12 }, (_, index) => {
          const monthData = data.monthlyStats?.find(
            (item) => Number(item.month) === index + 1
          );

          return {
            month: index + 1,
            totalIncome: Number(monthData?.totalIncome) || 0,
            totalExpenses: Number(monthData?.totalExpenses) || 0,
          };
        }),
      });
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
    }
  },

  // 3. Tambah transaksi dan refresh data terkait
  addTransaction: async (transactionData) => {
    try {
      await axiosInstance.post("/transactions", transactionData, {
        withCredentials: true,
      });

      await Promise.all([
        get().fetchTransactionStats(),
        get().fetchTransactions(),
      ]);

      await useBudgetStore.getState().fetchBudgets();
    } catch (error) {
      throw error;
    }
  },

  // 4. Tandai pembayaran sebagai lunas
  markPaymentAsPaid: async (amount) => {
    try {
      await axiosInstance.post(
        "/transactions",
        {
          type: "expense",
          amount: Number(amount),
          title: "Paid Upcoming Payment",
          category: "other",
        },
        { withCredentials: true }
      );

      await Promise.all([
        get().fetchTransactionStats(),
        get().fetchTransactions(),
      ]);

      await useBudgetStore.getState().fetchBudgets();
    } catch (error) {
      throw error;
    }
  },
}));
