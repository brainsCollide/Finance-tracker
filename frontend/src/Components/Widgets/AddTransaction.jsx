import { useState } from "react";
import { useBalanceStore } from "../../stores/balance.store";
import { toast } from "react-toastify";
import { FiTag, FiDollarSign, FiCalendar, FiActivity, FiFilter } from "react-icons/fi";

// --- FormInput DI LUAR (Agar kursor tidak hilang saat ngetik) ---
const FormInput = ({ label, icon: Icon, error, transactionType, ...props }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${transactionType === 'income' ? 'group-focus-within:text-emerald-500' : 'group-focus-within:text-rose-500'} text-slate-400`}>
        <Icon size={18} />
      </div>
      <input
        {...props}
        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${error ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-slate-900 focus:outline-none focus:ring-4 ${transactionType === 'income' ? 'focus:ring-emerald-500/10 focus:border-emerald-500' : 'focus:ring-rose-500/10 focus:border-rose-500'} transition-all`}
      />
    </div>
    {error && <p className="text-[10px] text-rose-500 font-medium ml-1">{error}</p>}
  </div>
);

const AddTransaction = ({ closeModal }) => {
  const [transaction, setTransaction] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    type: "income",
    category: "work",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil Action dari Store
  const { addTransaction } = useBalanceStore();

  const handleChanges = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors({ ...errors, [name]: null });
    setTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // Panggil fungsi store (Otomatis re-fetch stats & chart)
      await addTransaction(transaction);

      toast.success("Transaction recorded!");
      closeModal?.();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Please check your input fields");
      } else {
        toast.error(error.response?.data?.message || "Failed to add transaction");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-1">
      <div className="flex flex-col space-y-5">
        <FormInput
          label="Title"
          icon={FiTag}
          type="text"
          name="title"
          placeholder="What is this for?"
          value={transaction.title}
          onChange={handleChanges}
          error={errors.title}
          transactionType={transaction.type}
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <FormInput
            label="Amount"
            icon={FiDollarSign}
            type="number"
            name="amount"
            placeholder="00"
            value={transaction.amount}
            onChange={handleChanges}
            error={errors.amount}
            transactionType={transaction.type}
          />
          <FormInput
            label="Date"
            icon={FiCalendar}
            type="date"
            name="date"
            value={transaction.date}
            onChange={handleChanges}
            error={errors.date}
            transactionType={transaction.type}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-1.5 flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">
                <FiActivity size={18} />
              </div>
              <select
                name="type"
                value={transaction.type}
                onChange={handleChanges}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">
                <FiFilter size={18} />
              </div>
              <select
                name="category"
                value={transaction.category}
                onChange={handleChanges}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="work">Work</option>
                <option value="grocery">Grocery</option>
                <option value="entertainment">Entertainment</option>
                <option value="transport">Transport</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2 
            ${transaction.type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'} 
            ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>Add {transaction.type === 'income' ? 'Income' : 'Expense'}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddTransaction;