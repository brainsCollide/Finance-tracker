import React from "react";
import { FiZap } from "react-icons/fi";

export default function SavingsRateBadge({ savingsRate }) {
  // 🔥 logic status dinamis
  const getStatus = (rate) => {
    if (rate >= 20) return { label: "Healthy", color: "emerald" };
    if (rate >= 10) return { label: "Warning", color: "amber" };
    return { label: "Danger", color: "rose" };
  };

  const status = getStatus(savingsRate);

  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-500",
    amber: "bg-amber-50 text-amber-500",
    rose: "bg-rose-50 text-rose-500",
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-all group">
      
      {/* top */}
      <div className="flex items-center justify-between mb-5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[status.color]}`}
        >
          <FiZap size={22} />
        </div>

        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${colorMap[status.color]}`}
        >
          {status.label}
        </span>
      </div>

      {/* title */}
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
        Savings Rate
      </p>

      {/* value */}
      <h2 className="text-3xl font-black text-slate-900">
        {savingsRate}%
      </h2>

      {/* desc */}
      <p className="text-sm text-slate-500 mt-2">
        Based on your current monthly cashflow.
      </p>
    </div>
  );
}