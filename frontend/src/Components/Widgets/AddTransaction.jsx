import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useBalanceStore } from "../../stores/balance.store";

const AddTransaction = () => {
  const [transaction, setTransaction] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    type: "income",
    category: "work",
  });

  const [notification, setNotification] = useState({ message: "", type: "" });

  const addIncome = useBalanceStore((state) => state.addIncome);
  const addExpenses = useBalanceStore((state) => state.addExpenses);
  const fetchTransactionStats = useBalanceStore((state) => state.fetchTransactionStats);
  const setMonthlyStats = useBalanceStore((state) => state.setMonthlyStats);

  const handleChanges = (e) => {
    setTransaction({
      ...transaction,
      [e.target.name]: e.target.value,
    });
  };

  const sendTransaction = async () => {
    try {
      const { data } = await axiosInstance.post("/transactions", transaction, { withCredentials: true });

      const { amount, type, date } = data.newTransaction;

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

      setNotification({ message: "Transaction added successfully", type: "success" });

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

      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    } catch (error) {
      console.error("❌ Error adding transaction:", error);
      setNotification({ message: "Error adding transaction", type: "error" });
    }
  };

  return (
    <div>
      <div className="flex flex-col space-y-4 mb-6">
        <input
          type="text"
          placeholder="Title"
          value={transaction.title}
          name="title"
          onChange={handleChanges}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        <input
          type="number"
          placeholder="Amount"
          value={transaction.amount}
          name="amount"
          onChange={handleChanges}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        <input
          type="date"
          placeholder="Date"
          value={transaction.date}
          name="date"
          onChange={handleChanges}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        <select
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm"
          value={transaction.type}
          name="type"
          onChange={handleChanges}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm"
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

      <div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 w-full sm:w-auto"
          onClick={sendTransaction}
        >
          Add Transaction
        </button>
      </div>

      {notification.message && (
        <div
          className={`p-4 mt-4 rounded ${
            notification.type === "success" ? "text-green-800 bg-green-200" : "text-red-800 bg-red-200"
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default AddTransaction;