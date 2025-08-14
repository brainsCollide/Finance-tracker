import { ToastContainer } from "react-toastify";
import AuthPrompt from "./Widgets/AuthPrompt";
import { IoMdPerson } from "react-icons/io";
import TransactionCard from "./TransactionCard";
import useTransactions from "../hooks/useTransactions";
import "react-toastify/dist/ReactToastify.css";


const Loading = () => (
  <div className="flex justify-center items-center h-40">
    <p className="text-gray-500 text-lg animate-pulse">Loading transactions...</p>
  </div>
);

const Empty = () => (
  <div className="flex justify-center items-center h-40">
    <p className="text-gray-500 text-lg">No transactions found.</p>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="text-red-500 text-center mb-4">{message}</div>
);


const TransactionBar = ({ onSectionChange }) => {
  const { transactions, loading, error, isAuthenticated, deleteTransaction } = useTransactions();

  const handleLoginRedirect = () => onSectionChange("Account");

  const renderContent = () => {
    if (!isAuthenticated) return <AuthPrompt message="Please log in to access your transactions." onLogin={handleLoginRedirect} icon={IoMdPerson} />;
    if (loading) return <Loading />;
    if (error) return <ErrorMessage message={error} />;
    if (transactions.length === 0) return <Empty />;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {transactions.map((transaction) => (
          <TransactionCard key={transaction._id} transaction={transaction} onDelete={deleteTransaction} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h2 className="text-xl sm:text-3xl font-bold text-[#0F172A] text-center sm:text-left mb-8">Your Transactions</h2>
      {renderContent()}
      <ToastContainer />
    </div>
  );
};

export default TransactionBar;
