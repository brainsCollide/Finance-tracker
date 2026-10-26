
import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import { useBudgetStore } from "./budget.store";

const PAYMENT_TO_TRANSACTION_CATEGORY = {
  rent: "other",
  subscription: "other",
  loan: "other",
  other: "other",
};

export const useBalanceStore = create((set, get) => ({
  income: 0,
  expenses: 0,
  transactions: [],

  // Akumulasi Januari sampai bulan yang dipilih
  yearToDate: {
    income: 0,
    expenses: 0,
    netCashflow: 0,
  },

  // Total satu tahun penuh
  yearlyTotal: {
    income: 0,
    expenses: 0,
    netCashflow: 0,
  },

  // Periode aktif
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

  // 2. Fetch statistik berdasarkan bulan dan tahun
  // Tanpa parameter = periode sekarang
  fetchTransactionStats: async (month, year) => {
    try {
      const params = {};

      if (month != null) params.month = month;
      if (year != null) params.year = year;

      const response = await axiosInstance.get("/transactions/stats", {
        params,
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

        yearlyTotal: {
          income: Number(data.yearlyTotal?.income) || 0,
          expenses: Number(data.yearlyTotal?.expenses) || 0,
          netCashflow: Number(data.yearlyTotal?.netCashflow) || 0,
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
  markPaymentAsPaid: async (payment) => {
    await axiosInstance.post(
      "/transactions",
      {
        type: "expense",
        amount: Number(payment.amount),
        title: payment.title,
        category: PAYMENT_TO_TRANSACTION_CATEGORY[payment.category] || "other",
      },
      { withCredentials: true }
    );

    await Promise.all([
      get().fetchTransactionStats(),
      get().fetchTransactions(),
    ]);

    await useBudgetStore.getState().fetchBudgets();
  },
}));
