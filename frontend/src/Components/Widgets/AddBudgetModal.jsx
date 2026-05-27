import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

const AddBudgetModal = ({ isOpen, onClose, onSaved, budget }) => {
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
    period: "monthly",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 FIX: sync edit mode + reset clean state
  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category || "",
        limit: budget.limit || "",
        period: budget.period || "monthly",
      });
    } else {
      setFormData({
        category: "",
        limit: "",
        period: "monthly",
      });
    }
    setFormError("");
  }, [budget, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    if (!formData.category || !formData.limit) {
      setFormError("Category and limit are required");
      return;
    }

    if (Number(formData.limit) <= 0) {
      setFormError("Limit must be greater than 0");
      return;
    }

    setIsSubmitting(true);

    try {
      let res;

      // 🔥 EDIT MODE
      if (budget?._id) {
        res = await axiosInstance.put(
          `/budgets/${budget._id}`,
          formData
        );
      }
      // 🔥 CREATE MODE
      else {
        res = await axiosInstance.post("/budgets", formData);
      }

      // 🔥 FIX: pakai onSaved (bukan onBudgetAdded)
      onSaved?.(res.data);

      onClose?.();

    } catch (err) {
      console.log("BUDGET ERROR FULL:", err);
      console.log("RESPONSE:", err.response?.data);

      setFormError(
        err.response?.data?.message ||
        err.message ||
        "Failed to create budget"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-1">

      {formError && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-sm text-rose-600 font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* CATEGORY */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            Category
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="
              w-full px-4 py-3
              bg-slate-50
              border border-slate-200
              rounded-2xl
              text-slate-900

              focus:outline-none
              focus:ring-4
              focus:ring-blue-500/10
              focus:border-blue-500

              transition-all
            "
          >
            <option value="">Select category</option>
            <option value="work">Work</option>
            <option value="grocery">Grocery</option>
            <option value="entertainment">Entertainment</option>
            <option value="transport">Transport</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* LIMIT */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            Budget Limit
          </label>

          <input
            type="number"
            name="limit"
            value={formData.limit}
            onChange={handleInputChange}
            min="1"
            required
            placeholder="Example: 1500000"
            className="
              w-full px-4 py-3
              bg-slate-50
              border border-slate-200
              rounded-2xl
              text-slate-900

              focus:outline-none
              focus:ring-4
              focus:ring-blue-500/10
              focus:border-blue-500

              transition-all
            "
          />
        </div>

        {/* PERIOD */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            Period
          </label>

          <select
            name="period"
            value={formData.period}
            onChange={handleInputChange}
            className="
              w-full px-4 py-3
              bg-slate-50
              border border-slate-200
              rounded-2xl
              text-slate-900

              focus:outline-none
              focus:ring-4
              focus:ring-blue-500/10
              focus:border-blue-500

              transition-all
            "
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-3">

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="
              px-5 py-3
              rounded-2xl
              text-slate-600
              font-bold

              hover:bg-slate-100

              transition-all
              active:scale-95

              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              px-6 py-3

              bg-blue-500
              hover:bg-blue-600

              text-white
              font-bold

              rounded-2xl

              shadow-lg shadow-blue-200/50

              transition-all
              active:scale-95

              disabled:opacity-50
              disabled:cursor-not-allowed

              min-w-[140px]

              flex items-center justify-center
            "
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              budget ? "Update Budget" : "Save Budget"
            )}
          </button>

        </div>
      </form>
    </div>
  );
};

export default AddBudgetModal;