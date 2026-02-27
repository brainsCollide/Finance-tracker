import { create } from 'zustand';
import axiosInstance from '../api/axiosInstance';
import { useBalanceStore } from "./balance.store";


export const usePaymentStore = create((set) => ({
  upcomingPayments: [],
  isLoadingPayments: false,
  paymentError: null,

  // Fetch semua upcoming payments
    fetchUpcomingPayments: async () => {
    set({ isLoadingPayments: true, paymentError: null });
    try {
        const res = await axiosInstance.get('/payments');
        console.log("Payments dari backend:", res.data); 
        set({ upcomingPayments: res.data || [], isLoadingPayments: false });
    } catch (err) {
        set({
        paymentError: err.response?.data?.message || 'Gagal memuat upcoming payments',
        isLoadingPayments: false,
        });
    }
    },

    addPayment: async (paymentData) => {
        try {
            const res = await axiosInstance.post('/payments', paymentData);

            console.log("Response add payment:", res.data);

            const newPayment = res.data.newPayment; // ✅ FIX

            set((state) => ({
                upcomingPayments: [...state.upcomingPayments, newPayment],
            }));

            return newPayment;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Gagal menambah payment');
        }
    },
    // Mark as paid (delete dari list)
  
    markAsPaid: async (id, amount) => {
    try {
        // 1. delete di backend
        await axiosInstance.delete(`/payments/${id}`);

        // 2. remove dari list (optimistic)
        set((state) => ({
        upcomingPayments: state.upcomingPayments.filter((p) => p._id !== id),
        }));

        // 3. update balance store
        await useBalanceStore.getState().markPaymentAsPaid(amount);

    } catch (err) {
        throw new Error(err.response?.data?.message || 'Gagal menandai paid');
    }
    },

  // Reset state (opsional, misal logout)
  resetPayments: () => set({ upcomingPayments: [], isLoadingPayments: false, paymentError: null }),
}));