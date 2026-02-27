import React, { useState } from "react";
import { usePaymentStore } from "../../stores/payment.store";
import { toast } from "react-toastify";
import { FiTag, FiDollarSign, FiCalendar, FiLayers } from "react-icons/fi";

const UpcomingPayment = ({ closeModal }) => {
  const addPayment = usePaymentStore((state) => state.addPayment);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    dueDate: "",
    category: "other",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.dueDate) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await addPayment(form);
      toast.success("Payment added successfully");
      // Close modal immediately for better UX
      closeModal?.();
    } catch (error) {
      toast.error(error.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  // Helper component for cleaner code
  const FormInput = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Icon size={18} />
        </div>
        <input
          {...props}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>
    </div>
  );

  return (
    <div className="p-1">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Input */}
        <FormInput
          label="Payment Title"
          icon={FiTag}
          type="text"
          name="title"
          placeholder="e.g. Netflix Subscription"
          value={form.title}
          onChange={handleInputChange}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Amount Input */}
          <FormInput
            label="Amount"
            icon={FiDollarSign}
            type="number"
            name="amount"
            placeholder="0.00"
            value={form.amount}
            onChange={handleInputChange}
          />

          {/* Due Date Input */}
          <FormInput
            label="Due Date"
            icon={FiCalendar}
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleInputChange}
          />
        </div>

        {/* Category Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            Category
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <FiLayers size={18} />
            </div>
            <select
              name="category"
              value={form.category}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="rent">Rent</option>
              <option value="subscription">Subscription</option>
              <option value="loan">Loan</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] mt-2 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>Add Payment Schedule</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default UpcomingPayment;