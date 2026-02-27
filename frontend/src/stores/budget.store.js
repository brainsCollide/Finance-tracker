import { create } from 'zustand';
import axiosInstance from '../api/axiosInstance';

export const useBudgetStore = create((set) => ({
  budgets: [],
  isLoadingBudgets: false,
  fetchBudgets: async () => {
    set({ isLoadingBudgets: true });
    try {
      const res = await axiosInstance.get('/budgets');
      set({ budgets: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {
      console.error("Error fetching budgets:", err);
    } finally {
      set({ isLoadingBudgets: false });
    }
  },
  // Tambahkan fungsi helper untuk update state local setelah API call sukses
  setBudgets: (newBudgets) => set({ budgets: newBudgets })
}));