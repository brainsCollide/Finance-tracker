import React from "react";
import { FiTrash2, FiCalendar, FiRefreshCcw, FiExternalLink } from "react-icons/fi";

const RecurringCard = ({ payment, onDelete }) => {
  const { id, name, amount, frequency, nextDue } = payment;

  // Logika untuk menentukan icon brand (opsional/mockup)
  const getIconColor = () => {
    if (name.toLowerCase().includes('netflix')) return 'bg-rose-100 text-rose-600';
    if (name.toLowerCase().includes('spotify')) return 'bg-emerald-100 text-emerald-600';
    if (name.toLowerCase().includes('gym')) return 'bg-blue-100 text-blue-600';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${getIconColor()}`}>
          {name.charAt(0)}
        </div>
        <button
          onClick={() => onDelete(id)}
          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
        >
          <FiTrash2 size={18} />
        </button>
      </div>

      <div className="space-y-1 mb-6">
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          {name} <FiExternalLink size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors cursor-pointer" />
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <FiRefreshCcw size={10} />
          {frequency} Subscription
        </div>
      </div>

      <div className="flex items-end justify-between pt-4 border-t border-slate-50">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Amount</p>
          <p className="text-xl font-black text-slate-900">
            Rp {amount.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5 text-right">Next Due</p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
            <FiCalendar size={12} className="text-blue-500" />
            {new Date(nextDue).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringCard;