import { useState } from "react";
import { FiPlus, FiAlertCircle, FiCreditCard, FiTrendingDown } from "react-icons/fi";
import RecurringCard from "./props/RecurringCard";

const Recurring = () => {
  const [recurringPayments, setRecurringPayments] = useState([
    { id: 1, name: "Netflix", amount: 189000, frequency: "Monthly", nextDue: "2026-03-01" },
    { id: 2, name: "Gym Membership", amount: 550000, frequency: "Monthly", nextDue: "2026-02-20" },
    { id: 3, name: "Spotify", amount: 54990, frequency: "Monthly", nextDue: "2026-03-05" },
  ]);

  const handleDelete = (id) => {
    setRecurringPayments((prev) => prev.filter((item) => item.id !== id));
  };

  const totalMonthly = recurringPayments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-4 sm:p-8 md:p-12 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
              <FiCreditCard /> Automated Bills
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight italic uppercase">
              Recurring Payments
            </h1>
            <p className="text-slate-500 font-medium">Manage your active subscriptions and fixed monthly costs.</p>
          </div>

          {/* Monthly Projection Badge */}
          <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 pr-8">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                <FiTrendingDown size={24} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Monthly Projection</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                    Rp {totalMonthly.toLocaleString('id-ID')}
                </p>
            </div>
          </div>
        </header>

        {/* Content Section */}
        {recurringPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                <FiAlertCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No active subscriptions</h3>
            <p className="text-slate-500 mt-2">Looks like you don't have any recurring payments set up yet.</p>
            <button className="mt-6 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">
                Add Subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {recurringPayments.map((payment) => (
              <RecurringCard 
                key={payment.id} 
                payment={payment} 
                onDelete={handleDelete} 
              />
            ))}

            {/* Add New Quick Slot */}
            <button className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-500 transition-all min-h-[220px]">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                    <FiPlus size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Add New Bill</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recurring;