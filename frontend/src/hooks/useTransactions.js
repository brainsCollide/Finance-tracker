import { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

const useTransactions = () => {
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
        const response = await axiosInstance.get("/transactions", { withCredentials: true });
        setTransactions(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setIsAuthenticated(false);
          if (!toastShown.current) {
            toast.warning("You need to log in first!", { autoClose: 3000 });
            toastShown.current = true;
          }
        } else {
          const msg = err.response?.data?.message || "Error fetching transactions";
          setError(msg);
          toast.error(msg, { autoClose: 3000 });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const deleteTransaction = async (id) => {
    try {
      await axiosInstance.delete(`/transactions/${id}`, { withCredentials: true });
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      toast.success("Transaction deleted successfully!", { autoClose: 2000 });
    } catch {
      toast.error("Failed to delete transaction", { autoClose: 3000 });
    }
  };

  return {
    transactions,
    loading,
    error,
    isAuthenticated,
    deleteTransaction,
  };
};


export default useTransactions;