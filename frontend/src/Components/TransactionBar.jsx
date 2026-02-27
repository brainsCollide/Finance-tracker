import { ToastContainer } from "react-toastify";
import AuthPrompt from "./Widgets/AuthPrompt";
import { IoMdPerson } from "react-icons/io";
import { FiInbox, FiLoader, FiAlertCircle, FiSearch, FiFilter, FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";
import TransactionCard from "./TransactionCard";
import useTransactions from "../hooks/useTransactions";
import "react-toastify/dist/ReactToastify.css";

const Loading = () => (
  <div className="flex flex-col justify-center items-center h-96 space-y-4">
    <div className="relative">
      <div className="w-14 h-14 border-[3px] border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
      <FiLoader className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={24} />
    </div>
    <p className="text-slate-400 font-medium tracking-wide">Syncing your ledger...</p>
  </div>
);

const Empty = () => (
  <div className="flex flex-col justify-center items-center h-[400px] bg-white rounded-[2rem] border-2 border-dashed border-slate-100 p-12 text-center transition-all">
    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-300 ring-8 ring-slate-50/50">
      <FiInbox size={40} />
    </div>
    <h3 className="text-slate-900 font-bold text-xl tracking-tight">Your ledger is empty</h3>
    <p className="text-slate-500 text-sm max-w-xs mt-2 leading-relaxed">
      Every great fortune starts with a single entry. Start tracking your income and expenses today.
    </p>
  </div>
);

const TransactionBar = ({ onSectionChange }) => {
  const { transactions, loading, error, isAuthenticated, deleteTransaction } = useTransactions();

  const handleLoginRedirect = () => onSectionChange("Account");

  // Quick summary calculation for the page header
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const renderContent = () => {
    if (!isAuthenticated) return (
      <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-slate-100 text-center">
        <AuthPrompt message="Please log in to access your transactions." onLogin={handleLoginRedirect} icon={IoMdPerson} />
      </div>
    );
    
    if (loading) return <Loading />;
    if (error) return (
        <div className="flex items-center space-x-3 bg-rose-50 border border-rose-100 p-5 rounded-2xl text-rose-600 mb-6 shadow-sm">
            <FiAlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
        </div>
    );
    if (transactions.length === 0) return <Empty />;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {transactions.map((transaction) => (
          <TransactionCard 
            key={transaction._id} 
            transaction={transaction} 
            onDelete={deleteTransaction} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8 md:p-12 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1600px] mx-auto">
        
        {/* --- PAGE HEADER --- */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Live Ledger</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight italic uppercase">
              Transaction History
            </h1>
            <p className="text-slate-500 font-medium">Monitoring your flow of {transactions.length} activities</p>
          </div>

          {/* Quick Stats Summary */}
          <div className="flex items-center gap-4 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm">
             <div className="flex items-center space-x-3 px-4 py-2 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                <div className="text-emerald-500"><FiArrowUpRight size={20}/></div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Total In</p>
                    <p className="text-sm font-bold text-emerald-600">Rp {totalIncome.toLocaleString('id-ID')}</p>
                </div>
             </div>
             <div className="flex items-center space-x-3 px-4 py-2 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                <div className="text-rose-500"><FiArrowDownLeft size={20}/></div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Total Out</p>
                    <p className="text-sm font-bold text-rose-600">Rp {totalExpense.toLocaleString('id-ID')}</p>
                </div>
             </div>
          </div>
        </header>

        {/* --- TOOLBAR --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search by title, category, or amount..." 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                />
            </div>
            <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                <FiFilter />
                <span>Filters</span>
            </button>
        </div>

        {/* --- MAIN CONTENT --- */}
        <main>
          {renderContent()}
        </main>
      </div>

      <ToastContainer 
        position="bottom-right"
        toastClassName="rounded-2xl font-sans shadow-2xl border border-slate-50 !bg-white !text-slate-900"
        progressClassName="!bg-blue-500"
      />
    </div>
  );
};

export default TransactionBar;