import { create } from "zustand";

export const useBalanceStore = create((set) => ({
  income: 0,
  expenses: 0,

  // ✅ Default state with an array of 12 months
  monthlyStats: Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    totalIncome: 0,
    totalExpenses: 0,
  })),

  // ✅ Add income and expenses
  addIncome: (amount) => set((state) => ({ income: state.income + amount })),
  addExpenses: (amount) => set((state) => ({ expenses: state.expenses + amount })),

  // ✅ Correct Zustand update logic
  setMonthlyStats: (stats) =>
    set(() => {
      console.log("🔍 Incoming Monthly Stats:", stats);

      // ✅ Create a fresh array with default values
      const updatedStats = Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        totalIncome: 0,
        totalExpenses: 0,
      }));

      // ✅ Process and replace each month's data
      stats.forEach((entry) => {
        if (typeof entry.month !== "number") {
          console.warn("⚠️ Skipping invalid entry (missing month):", entry);
          return;
        }

        const monthIndex = entry.month - 1;

        if (monthIndex < 0 || monthIndex > 11) {
          console.warn("⚠️ Skipping out-of-range month:", entry);
          return;
        }

        updatedStats[monthIndex] = {
          month: entry.month,
          totalIncome: entry.totalIncome || 0,
          totalExpenses: entry.totalExpenses || 0,
        };
      });

      console.log("✅ Zustand Updated Monthly Stats:", updatedStats);

      // ✅ Replace state (ensuring React detects the change)
      return { monthlyStats: [...updatedStats] };
    }),
}));