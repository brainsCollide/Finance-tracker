import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

export const useGoalStore = create((set, get) => ({
  goals: [],
  isLoadingGoals: false,
  error: null,

  // ───────── FETCH ─────────
  fetchGoals: async () => {
  try {
    set({ isLoadingGoals: true, error: null });

    const res = await axiosInstance.get("/goals");

    set({
      goals: res.data,
      isLoadingGoals: false,
    });

  } catch (err) {
    const status = err.response?.status;

    // 🔥 IMPORTANT: user belum login = jangan dianggap error UI
    if (status === 401) {
      set({
        goals: [],
        isLoadingGoals: false,
        error: null, // jangan tampilkan error
      });
      return;
    }

    set({
      error:
        err.response?.data?.message ||
        "Failed to fetch goals",
      isLoadingGoals: false,
    });
  }
},

  // ───────── CREATE / UPDATE (UPSERT) ─────────
  upsertGoal: (goal) => {
    set((state) => {
      const exists = state.goals.find((g) => g._id === goal._id);

      if (exists) {
        return {
          goals: state.goals.map((g) =>
            g._id === goal._id ? goal : g
          ),
        };
      }

      return {
        goals: [goal, ...state.goals],
      };
    });
  },

  

  // ───────── DELETE ─────────
  deleteGoal: async (id) => {
    try {
      await axiosInstance.delete(`/goals/${id}`);

      set((state) => ({
        goals: state.goals.filter((g) => g._id !== id),
      }));
    } catch (err) {
      throw err;
    }
  },
}));