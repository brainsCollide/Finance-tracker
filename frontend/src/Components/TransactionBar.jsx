import { useEffect, useState, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { IoMdPerson } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TransactionBar = ({ onSectionChange }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const toastShown = useRef(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get("/transactions", {
          withCredentials: true,
        });
        setTransactions(response.data);
      } catch (error) {
        handleFetchError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleFetchError = (error) => {
    if (error.response?.status === 401) {
      setIsAuthenticated(false);
      if (!toastShown.current) {
        toast.warning("You need to log in first!", { autoClose: 3000 });
        toastShown.current = true;
      }
    } else {
      const errorMessage = error.response?.data?.message || "Error fetching transactions";
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/transactions/${id}`, { withCredentials: true });
      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction._id !== id)
      );
      toast.success("Transaction deleted successfully!", { autoClose: 2000 });
    } catch (error) {
      toast.error("Failed to delete transaction", { autoClose: 3000 });
    }
  };

  const handleLoginRedirect = () => {
    onSectionChange("Account");
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center h-40 gap-5 bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <IoMdPerson size={40} className="text-blue-500" />
          <p className="text-gray-700 text-center font-semibold text-lg">
            Please log in to access your transactions.
          </p>
          <button
            onClick={handleLoginRedirect}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
          >
            Log In
          </button>
        </div>
      );
    }

    if (error) {
      return <div className="text-red-500 text-center mb-4">{error}</div>;
    }

    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 text-lg animate-pulse">Loading transactions...</p>
        </div>
      );
    }

    if (transactions.length === 0) {
      return (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 text-lg">No transactions found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className={`p-5 bg-white shadow-md rounded-lg border-l-4 hover:shadow-lg transition-all duration-200  ${
              transaction.type === "income" ? "border-green-500" : "border-red-500"
            }`}
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[70%]">
                {transaction.title}
              </h3>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  transaction.type === "income" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}
                aria-label={transaction.type === "income" ? "Income transaction" : "Expense transaction"}
              >
                {transaction.type === "income" ? "Income" : "Expense"}
              </span>
            </div>
            
            {/* Card Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>{transaction.category}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(transaction.date).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Amount */}
            <div className="mb-4">
              <span
                className={`text-xl font-bold ${
                  transaction.type === "income" ? "text-green-600" : "text-red-600"
                }`}
                aria-label={`Amount: ${transaction.amount.toLocaleString("de-DE")} Rupiah`}
              >
                Rp {transaction.amount.toLocaleString("de-DE")}
              </span>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => handleDelete(transaction._id)}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center justify-center"
              aria-label={`Delete transaction: ${transaction.title}`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <ToastContainer className="!font-sans"
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="relative flex p-3 min-h-[64px] rounded-md justify-between overflow-hidden cursor-pointer bg-white shadow-md my-2 max-w-[60vw] md:max-w-[350px]"
          bodyClassName="text-sm font-medium text-gray-800 flex items-center"
          icon={true} />
      <h2 className="text-xl sm:text-3xl font-bold text-[#0F172A] text-center sm:text-left mb-8">Your Transactions</h2>
      {renderContent()}
    </div>
  );
};

export default TransactionBar;
