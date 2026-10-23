import { useEffect, useState } from "react";
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

const Recurring = () => {
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 📡 FETCH DATA
  const fetchRecurring = async () => {
    try {
      const res = await axiosInstance.get("/recurring");

      console.log("RESPONSE:", res.data);

      const formatted = res.data.map((item) => ({
        id: item._id,
        name: item.name || item.title,
        amount: item.amount,
        frequency: item.frequency,
        nextDue: item.nextDue || item.nextDueDate,
        category: item.category,
        isActive: item.isActive,
      }));

      setRecurringPayments(formatted);

    } catch (err) {
      console.error("Failed to fetch recurring:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  // 🗑 DELETE
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/recurring/${id}`);

      setRecurringPayments((prev) =>
        prev.filter((item) => item.id !== id)
      );

    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // 💰 TOTAL MONTHLY
  const totalMonthly = recurringPayments.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  // ⏳ LOADING STATE
  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading recurring payments...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 md:p-12 min-h-screen bg-[#F8FAFC]">

      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
              <FiCreditCard />
              Automated Bills
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              Subscription
            </h1>

            <p className="text-slate-500 font-light">
              Manage your active subscriptions and fixed monthly costs.
            </p>
          </div>

          {/* MONTHLY PROJECTION */}
          <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 pr-8">

            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
              <FiTrendingDown size={24} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Monthly Projection
              </p>

              <p className="text-2xl font-black text-slate-900 mt-1">
                Rp {totalMonthly.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </header>

        {/* EMPTY STATE */}
        {recurringPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">

            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
              <FiAlertCircle size={40} />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              No active subscriptions
            </h3>

            <p className="text-slate-500 mt-2">
              Looks like you don't have any recurring payments set up yet.
            </p>

            {/* ✅ OPEN MODAL */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
            >
              Add Subscription
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
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-500 transition-all min-h-[220px]"
            >

              <div className="p-3 bg-slate-50 rounded-2xl">
                <FiPlus size={24} />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest">
                Add New Bill
              </span>

            </button>
          </div>
        )}

      </div>

      {/* ✅ MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Subscription"
        subtitle="Track your recurring expenses and automate your monthly planning."
      >
        <AddRecurring />
      </Modal>

    </div>
  );
};

export default Recurring;