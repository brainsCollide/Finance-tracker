import { useCallback, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

import {
  FiPlus,
  FiAlertCircle,
  FiCreditCard,
  FiTrendingDown,
} from "react-icons/fi";

import RecurringCard from "./props/RecurringCard";
import Modal from "./Widgets/Modal";
import AddRecurring from "./Widgets/AddRecurring";

// Faktor konversi ke biaya per bulan
const MONTHLY_FACTOR = {
  daily: 365 / 12,
  weekly: 52 / 12,
  monthly: 1,
  yearly: 1 / 12,
};

const Recurring = () => {
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRecurring = useCallback(async () => {
    try {
      setError("");
      const res = await axiosInstance.get("/recurring");

      setRecurringPayments(
        res.data.map((item) => ({
          id: item._id,
          name: item.name,
          amount: item.amount,
          frequency: item.frequency,
          nextDue: item.nextDue,
          category: item.category,
          isActive: item.isActive,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch recurring:", err);
      setError(
        err.response?.data?.message ||
          "We couldn't load your recurring payments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecurring();
  }, [fetchRecurring]);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/recurring/${id}`);

      setRecurringPayments((prev) => prev.filter((item) => item.id !== id));
      toast.success("Recurring payment deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete recurring payment");
    }
  };

  const handleRetry = () => {
    setLoading(true);
    fetchRecurring();
  };

  // Hanya item aktif, dikonversi ke biaya per bulan sesuai frekuensinya
  const activePayments = recurringPayments.filter((p) => p.isActive !== false);

  const totalMonthly = activePayments.reduce(
    (acc, p) => acc + p.amount * (MONTHLY_FACTOR[p.frequency] ?? 1),
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-500">
            Loading recurring payments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 md:p-12 min-h-screen bg-[#F8FAFC]">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
              <FiCreditCard />
              Fixed costs
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              Recurring payments
            </h1>

            <p className="text-slate-500 font-light">
              Keep track of the subscriptions and bills that repeat on a
              schedule.
            </p>
          </div>

          {/* MONTHLY PROJECTION */}
          {!error && recurringPayments.length > 0 && (
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 pr-8">

              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                <FiTrendingDown size={24} />
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Monthly projection
                </p>

                <p className="text-2xl font-black text-slate-900 mt-1">
                  Rp {Math.round(totalMonthly).toLocaleString("id-ID")}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  {activePayments.length} active{" "}
                  {activePayments.length === 1 ? "payment" : "payments"}
                </p>
              </div>
            </div>
          )}
        </header>

        {/* ERROR STATE */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-rose-100">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-rose-400">
              <FiAlertCircle size={40} />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Couldn't load your payments
            </h3>

            <p className="text-slate-500 mt-2 text-center max-w-sm">{error}</p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-6 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
            >
              Try again
            </button>
          </div>
        ) : recurringPayments.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">

            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
              <FiAlertCircle size={40} />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              No recurring payments yet
            </h3>

            <p className="text-slate-500 mt-2 text-center max-w-sm">
              Add your subscriptions, rent, or loans to see your fixed monthly
              costs in one place.
            </p>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-6 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
            >
              Add recurring payment
            </button>
          </div>
        ) : (
          /* GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {recurringPayments.map((payment) => (
              <RecurringCard
                key={payment.id}
                payment={payment}
                onDelete={handleDelete}
              />
            ))}

            {/* ADD NEW CARD */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-500 transition-all min-h-[220px]"
            >
              <div className="p-3 bg-slate-50 rounded-2xl">
                <FiPlus size={24} />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest">
                Add recurring payment
              </span>
            </button>
          </div>
        )}

      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add recurring payment"
        subtitle="Add a bill that repeats on a schedule so your fixed costs stay visible."
      >
        <AddRecurring
          closeModal={() => setIsModalOpen(false)}
          onSuccess={fetchRecurring}
        />
      </Modal>
    </div>
  );
};

export default Recurring;