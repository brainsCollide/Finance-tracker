import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const TransactionBar = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // To handle errors

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null); // Reset error before fetching
      try {
        // Fetch transactions for the logged-in user
        const response = await axiosInstance.get("/transactions", {
          withCredentials: true, // Ensures cookies or tokens are sent
        });
        setTransactions(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Error fetching transactions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/transactions/${id}`, {
        withCredentials: true, // Ensures authentication for delete
      });
      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction._id !== id)
      );
    } catch (error) {
      console.error(
        "Error deleting transaction:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8">
        Your Transactions
      </h2>

      {/* Show error if any */}
      {error && (
        <div className="text-red-500 text-center mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 text-lg animate-pulse">
            Loading transactions...
          </p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 text-lg">No transactions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {transactions.map((transaction) => (
            <div
              key={transaction._id}
              className={`p-6 bg-white shadow-md rounded-lg border-l-4 transition-transform transform hover:scale-105 ${
                transaction.type === "income"
                  ? "border-green-500"
                  : "border-red-500"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 truncate">
                  {transaction.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    transaction.type === "income"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {transaction.type === "income" ? "Income" : "Expense"}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Date: {new Date(transaction.date).toLocaleDateString()}
              </p>
              <div className="mt-4">
                <span
                  className={`text-2xl font-bold ${
                    transaction.type === "income"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  Rp.{transaction.amount.toLocaleString("de-DE")}
                </span>
              </div>
              <button
                onClick={() => handleDelete(transaction._id)}
                className="px-4 py-2 mt-4 bg-red-500 text-white rounded-md shadow hover:bg-red-600 w-full"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionBar;
