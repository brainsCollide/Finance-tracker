import { useState } from "react";
import { toast } from "react-toastify";

import {
  FiTag,
  FiDollarSign,
  FiCalendar,
  FiRepeat,
  FiFilter,
} from "react-icons/fi";

import axiosInstance from "../../api/axiosInstance";

// Tanggal lokal (bukan UTC) supaya default tidak mundur sehari di pagi hari
const todayLocal = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

// ─────────────────────────────────────────────
// Reusable Input Component
// ─────────────────────────────────────────────
const FormInput = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>

    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
        <Icon size={18} />
      </div>

      <input
        {...props}
        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
          error ? "border-rose-500" : "border-slate-200"
        } rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all`}
      />
    </div>

    {error && (
      <p className="text-[10px] text-rose-500 font-medium ml-1">{error}</p>
    )}
  </div>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const AddRecurring = ({ closeModal, onSuccess }) => {
  const [recurring, setRecurring] = useState({
    name: "",
    amount: "",
    category: "subscription",
    frequency: "monthly",
    nextDue: todayLocal(),
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChanges = (e) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    setRecurring((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrors({});

      await axiosInstance.post("/recurring", recurring, {
        withCredentials: true,
      });

      toast.success("Recurring payment created");

      onSuccess?.();
      closeModal?.();
    } catch (error) {
      console.error(error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Please check your fields");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to create recurring payment"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="p-1">
      <div className="flex flex-col space-y-5">

        {/* NAME */}
        <FormInput
          label="Name"
          icon={FiTag}
          type="text"
          name="name"
          placeholder="Netflix"
          value={recurring.name}
          onChange={handleChanges}
          error={errors.name}
          maxLength={60}
        />

        {/* AMOUNT + CATEGORY */}
        <div className="flex flex-col sm:flex-row gap-4">
          <FormInput
            label="Amount"
            icon={FiDollarSign}
            type="number"
            inputMode="numeric"
            min="0"
            name="amount"
            placeholder="0"
            value={recurring.amount}
            onChange={handleChanges}
            error={errors.amount}
          />

          <div className="space-y-1.5 flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Category
            </label>

            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">
                <FiFilter size={18} />
              </div>

              <select
                name="category"
                value={recurring.category}
                onChange={handleChanges}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="subscription">Subscription</option>
                <option value="rent">Rent</option>
                <option value="utility">Utilities</option>
                <option value="loan">Loan</option>
                <option value="other">Other</option>
              </select>
            </div>

            {errors.category && (
              <p className="text-[10px] text-rose-500 font-medium ml-1">
                {errors.category}
              </p>
            )}
          </div>
        </div>

        {/* FREQUENCY + NEXT DUE */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-1.5 flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Repeats
            </label>

            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">
                <FiRepeat size={18} />
              </div>

              <select
                name="frequency"
                value={recurring.frequency}
                onChange={handleChanges}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {errors.frequency && (
              <p className="text-[10px] text-rose-500 font-medium ml-1">
                {errors.frequency}
              </p>
            )}
          </div>

          <FormInput
            label="Next due"
            icon={FiCalendar}
            type="date"
            name="nextDue"
            value={recurring.nextDue}
            onChange={handleChanges}
            error={errors.nextDue}
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2
          bg-blue-600 hover:bg-blue-700 shadow-blue-500/20
          ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>Create recurring payment</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default AddRecurring;