import React from "react";
import { 
  FiArrowUpRight, 
  FiArrowDownLeft, 
  FiTrash2, 
  FiCalendar, 
  FiTag 
} from "react-icons/fi";

const TransactionCard = ({ transaction, onDelete }) => {
  const { title, type, category, date, amount, _id } = transaction;

  const isIncome = type === "income";

  // Konfigurasi tema berdasarkan tipe transaksi
  const theme = isIncome
    ? {
        bg: "bg-emerald-50",
        iconBg: "bg-emerald-500",
        text: "text-emerald-600",
        icon: FiArrowUpRight,
        label: "Income"
      }
    : {
        bg: "bg-rose-50",
        iconBg: "bg-rose-500",
        text: "text-rose-600",
        icon: FiArrowDownLeft,
        label: "Expense"
      };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300">
      
      {/* Header: Ikon Status & Tombol Delete (Muncul saat hover) */}
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${theme.bg} ${theme.text} transition-transform group-hover:scale-110`}>
          <theme.icon size={22} />
        </div>

        <button
          onClick={() => onDelete(_id)}
          className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 focus:opacity-100"
          title="Delete transaction"
        >
          <FiTrash2 size={18} />
        </button>
      </div>

      {/* Title & Category */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 truncate tracking-tight">
          {title}
        </h3>
        <div className="flex items-center text-slate-400 text-xs mt-1.5 font-medium">
          <FiTag className="mr-1.5" size={12} />
          <span className="capitalize">{category}</span>
          <span className="mx-2 text-slate-200">•</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${theme.bg} ${theme.text}`}>
            {theme.label}
          </span>
        </div>
      </div>

      {/* Footer: Amount & Date */}
      <div className="flex items-end justify-between pt-4 border-t border-slate-50">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
            Amount
          </span>
          <span className={`text-xl font-extrabold tracking-tight ${theme.text}`}>
            {isIncome ? "+" : "-"} Rp {amount.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex items-center text-slate-400 text-[11px] font-semibold bg-slate-50 px-2.5 py-1 rounded-lg">
          <FiCalendar className="mr-1.5" size={12} />
          {new Date(date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          })}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;