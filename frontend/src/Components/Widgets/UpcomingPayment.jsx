import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";

const UpcomingPayment = ({ onPaymentAdded, closeModal }) => {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    dueDate: "",
    category: "other",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Handle input change
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.dueDate) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/payments", form, { withCredentials: true });

      // ✅ Notify parent (Dashboard) to update the payment list
      if (onPaymentAdded) {
        onPaymentAdded(response.data.newPayment);
      }

      // ✅ Show success message
      toast.success("Payment added successfully");

      // ✅ Reset form
      setForm({ title: "", amount: "", dueDate: "", category: "other" });

      // ✅ Close modal after 1.5s
      setTimeout(() => {
        closeModal?.(); // Calls global modal close function
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Upcoming Payment</h2>

      {/* ✅ Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Payment Title"
          value={form.title}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        <select
          name="category"
          value={form.category}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="rent">Rent</option>
          <option value="subscription">Subscription</option>
          <option value="loan">Loan</option>
          <option value="other">Other</option>
        </select>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Adding..." : "+ Add Payment"}
        </button>
      </form>
    </div>
  );
};

export default UpcomingPayment;