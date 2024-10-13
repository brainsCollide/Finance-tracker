import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const TransactionBar = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true); // Initialize loading state

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);  // Set loading to true before fetching
            try {
                const response = await axiosInstance.get('/transactions');
                setTransactions(response.data);
            } catch (error) {
                console.log('error fetching data', error);
            } finally {
                setLoading(false);  // Set loading to false after fetching completes
            }
        };

        fetchTransactions();
    }, []);

    return (
        <div className="p-10 h-screen">
          <h2 className="text-xl font-bold mb-4">Transactions</h2>

          {loading ? (
            <p>Loading transactions...</p> // Show loading message while data is being fetched
          ) : (
            <ul className="space-y-2">
              {transactions.map((transaction) => (
                <li key={transaction.id} 
                    className={`p-4 border rounded bg-gray-100 flex justify-between ${
                      transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`}>
                  <div>
                    <h3 className="font-semibold">{transaction.title}</h3>
                    <p>{transaction.type === 'income' ? 'Income' : 'Expense'} - ${transaction.amount.toLocaleString('de-DE')}</p>
                  </div>
                  <span>{new Date(transaction.date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
};

export default TransactionBar;
