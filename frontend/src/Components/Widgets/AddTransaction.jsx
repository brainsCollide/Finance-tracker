import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useBalanceStore } from "../../stores/balance.store";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddTransaction = ( {closeModal} ) => {
  const [transaction, setTransaction] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    type: "income",
    category: "work",
  });
  
  // ✅ Add state for validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addIncome = useBalanceStore((state) => state.addIncome);
  const addExpenses = useBalanceStore((state) => state.addExpenses);
  const fetchTransactionStats = useBalanceStore((state) => state.fetchTransactionStats);
  const setMonthlyStats = useBalanceStore((state) => state.setMonthlyStats);

  const handleChanges = (e) => {
    const { name, value } = e.target;
    
    // ✅ Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
    
    setTransaction({
      ...transaction,
      [name]: value,
    });
  };

  const sendTransaction = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});
      
      const { data } = await axiosInstance.post("/transactions", transaction, { withCredentials: true });

      const { amount, type, date } = data.transaction; // ✅ Updated to match your backend response

      // ✅ Instant UI Update
      if (type === "income") {
        addIncome(Number(amount));
      } else {
        addExpenses(Number(amount));
      }

      // ✅ Ensure monthlyStats updates correctly
      setMonthlyStats((prevStats) => {
        if (!Array.isArray(prevStats)) {
          return Array.from({ length: 12 }, () => ({ totalIncome: 0, totalExpenses: 0 }));
        }

        const monthIndex = new Date(date).getMonth(); // Get month (0-11)
        const newStats = [...prevStats]; // Clone array to avoid mutation

        // ✅ Merge new transaction data with existing month data
        newStats[monthIndex] = {
          totalIncome: type === "income" ? prevStats[monthIndex].totalIncome + Number(amount) : prevStats[monthIndex].totalIncome,
          totalExpenses: type === "expense" ? prevStats[monthIndex].totalExpenses + Number(amount) : prevStats[monthIndex].totalExpenses,
        };

        return newStats;
      });

      // ✅ Fetch latest stats from backend after transaction (Ensures accuracy)
      await fetchTransactionStats();

      // ✅ Reset Form
      setTransaction({
        title: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        type: "income",
        category: "work",
      });

      toast.success("Transaction added successfully!", { autoClose: 3000 });
      
      setTimeout(() => {
        closeModal?.();
      }, 1500);
    } catch (error) {
      console.error("❌ Error adding transaction:", error);
      
      // ✅ Handle validation errors
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        
        // Show first error message as toast
        const firstErrorField = Object.keys(error.response.data.errors)[0];
        const firstErrorMessage = error.response.data.errors[firstErrorField];
        toast.error(firstErrorMessage, { autoClose: 5000 });
      } else {
        toast.error(error.response?.data?.message || "Failed to add transaction", { autoClose: 3000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col space-y-4 mb-6">
        <div>
          <input
            type="text"
            placeholder="Title"
            value={transaction.title}
            name="title"
            onChange={handleChanges}
            className={'px-4 py-2 border border-gray-300 rounded-md shadow-sm w-full'}
          />
        </div>
        
        <div>
          <input
            type="number"
            placeholder="Amount"
            value={transaction.amount}
            name="amount"
            onChange={handleChanges}
            className={'px-4 py-2 border border-gray-300 rounded-md shadow-sm w-full'}
          />
        </div>
        
        <div>
          <input
            type="date"
            placeholder="Date"
            value={transaction.date}
            name="date"
            onChange={handleChanges}
            className={`px-4 py-2 border border-gray-300'} rounded-md shadow-sm w-full`}
          />
        </div>
        
        <div>
          <select
            className={`px-4 py-2 border border-gray-300'} rounded-md shadow-sm w-full`}
            value={transaction.type}
            name="type"
            onChange={handleChanges}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div>
          <select
            className={`px-4 py-2 border border-gray-300'} rounded-md shadow-sm w-full`}
            value={transaction.category}
            name="category"
            onChange={handleChanges}
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

      <div>
        <button
          type="submit"
          className={`px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 w-full sm:w-auto ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={sendTransaction}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Transaction'}
        </button>
      </div>
    </div>
  );
};

export default AddTransaction;
