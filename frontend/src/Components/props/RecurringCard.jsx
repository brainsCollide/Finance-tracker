import React from "react";
import { FiTrash2, FiCalendar, FiRefreshCcw } from "react-icons/fi";

const CATEGORY_LABELS = {
  subscription: "Subscription",
  rent: "Rent",
  utility: "Utilities",
  loan: "Loan",
  other: "Other",
};

const formatDue = (date) => {
  const due = new Date(date);
  const sameYear = due.getUTCFullYear() === new Date().getFullYear();

  return due.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  });
};

const RecurringCard = ({ payment, onDelete }) => {
  const { id, name = "", amount = 0, frequency, nextDue, category } = payment;

  // Warna ikon berdasarkan nama (dekoratif)
  const getIconColor = () => {
    const lower = name.toLowerCase();
    if (lower.includes("netflix")) return "bg-rose-100 text-rose-600";
    if (lower.includes("spotify")) return "bg-emerald-100 text-emerald-600";
    if (lower.includes("gym")) return "bg-blue-100 text-blue-600";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${getIconColor()}`}
        >
          {name.charAt(0).toUpperCase()}
        </div>

        {/* Tampil selalu di layar sentuh, hanya muncul saat hover di perangkat dengan mouse */}
        <button
          type="button"
          onClick={() => onDelete(id)}
          aria-label={`Delete ${name}`}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100"
        >
          <FiTrash2 size={18} />
        </button>
      </div>

      <div className="space-y-1 mb-6">
        <h3 className="text-lg font-black text-slate-900 tracking-tight truncate">
          {name}
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <FiRefreshCcw size={10} />
          {frequency} · {CATEGORY_LABELS[category] || "Other"}
        </div>
      </div>

      <div className="flex items-end justify-between pt-4 border-t border-slate-50">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">
            Amount
          </p>
          <p className="text-xl font-black text-slate-900">
            Rp {amount.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5 text-right">
            Next due
          </p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
            <FiCalendar size={12} className="text-blue-500" />
            {formatDue(nextDue)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringCard;