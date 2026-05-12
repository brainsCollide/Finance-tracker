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
      <p className="text-[10px] text-rose-500 font-medium ml-1">
        {error}
      </p>
    )}
  </div>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const AddRecurring = ({ closeModal, onSuccess }) => {
  const [recurring, setRecurring] = useState({
    title: "",
    amount: "",
    category: "other",
    frequency: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    nextDueDate: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─────────────────────────────────────────────
  // Handle Changes
  // ─────────────────────────────────────────────
  const handleChanges = (e) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    setRecurring((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ─────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      await axiosInstance.post(
        "/recurring",
        recurring,
        { withCredentials: true }
      );

      toast.success("Recurring payment created!");

      onSuccess?.();
      closeModal?.();

    } catch (error) {
      console.error(error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Please check your fields");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to create recurring payment"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-1">
      <div className="flex flex-col space-y-5">

        {/* TITLE */}
        <FormInput
          label="Title"
          icon={FiTag}
          type="text"
          name="title"
          placeholder="Netflix Subscription"
          value={recurring.title}
          onChange={handleChanges}
          error={errors.title}
        />

        {/* AMOUNT + CATEGORY */}
        <div className="flex flex-col sm:flex-row gap-4">
          <FormInput
            label="Amount"
            icon={FiDollarSign}
            type="number"
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
                <option value="internet">Internet</option>
                <option value="transport">Transport</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* FREQUENCY */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Frequency
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
        </div>

        {/* DATES */}
        <div className="flex flex-col sm:flex-row gap-4">
          <FormInput
            label="Start Date"
            icon={FiCalendar}
            type="date"
            name="startDate"
            value={recurring.startDate}
            onChange={handleChanges}
            error={errors.startDate}
          />

          <FormInput
            label="Next Due"
            icon={FiCalendar}
            type="date"
            name="nextDueDate"
            value={recurring.nextDueDate}
            onChange={handleChanges}
            error={errors.nextDueDate}
          />
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2
          bg-blue-600 hover:bg-blue-700 shadow-blue-500/20
          ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>Create Recurring</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddRecurring;