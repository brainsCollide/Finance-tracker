import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

const AddGoalModal = ({ isOpen, onClose, onSaved, goal }) => {
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync edit mode + reset
  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || "",
        targetAmount: goal.targetAmount || "",
        currentAmount: goal.currentAmount || "",
        deadline: goal.deadline
          ? new Date(goal.deadline).toISOString().split("T")[0]
          : "",
      });
    } else {
      setFormData({
        title: "",
        targetAmount: "",
        currentAmount: "",
        deadline: "",
      });
    }

    setFormError("");
  }, [goal, isOpen]);

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

    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      setFormError("All required fields must be filled");
      return;
    }

    if (Number(formData.targetAmount) <= 0) {
      setFormError("Target amount must be greater than 0");
      return;
    }

    if (Number(formData.currentAmount) < 0) {
      setFormError("Current amount cannot be negative");
      return;
    }

    setIsSubmitting(true);

    try {
      let res;

      // EDIT MODE
      if (goal?._id) {
        res = await axiosInstance.put(
          `/goals/${goal._id}`,
          formData
        );
      }
      // CREATE MODE
      else {
        res = await axiosInstance.post(
          "/goals",
          formData
        );
      }

      onSaved?.(res.data);

      onClose?.();

    } catch (err) {
      console.log("GOAL ERROR FULL:", err);
      console.log("RESPONSE:", err.response?.data);

      setFormError(
        err.response?.data?.message ||
        err.message ||
        "Failed to save goal"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-1">

      {/* ERROR */}
      {formError && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-sm text-rose-600 font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* TITLE */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            Goal Title
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Example: Buy MacBook Pro"
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

        {/* TARGET AMOUNT */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            Target Amount
          </label>

          <input
            type="number"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleInputChange}
            min="1"
            required
            placeholder="Example: 15000000"
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

        {/* CURRENT AMOUNT */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            Current Savings
          </label>

          <input
            type="number"
            name="currentAmount"
            value={formData.currentAmount}
            onChange={handleInputChange}
            min="0"
            placeholder="Example: 5000000"
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

        {/* DEADLINE */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            Deadline
          </label>

          <input
            type="date"
            name="deadline"
            value={formData.deadline}
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
          />
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

              bg-amber-500
              hover:bg-amber-600

              text-white
              font-bold

              rounded-2xl

              shadow-lg shadow-amber-200/50

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
              goal ? "Update Goal" : "Save Goal"
            )}
          </button>

        </div>
      </form>
    </div>
  );
};

export default AddGoalModal;