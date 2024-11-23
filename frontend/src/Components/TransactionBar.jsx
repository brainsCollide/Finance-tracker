import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const TransactionBar = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/transactions");
        setTransactions(response.data);
      } catch (error) {
        console.log("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Transactions</h2>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">No transactions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`p-6 bg-white shadow-md rounded-lg border-l-4 ${
                transaction.type === "income" ? "border-green-500" : "border-red-500"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
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
                    transaction.type === "income" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  ${transaction.amount.toLocaleString("de-DE")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionBar;
