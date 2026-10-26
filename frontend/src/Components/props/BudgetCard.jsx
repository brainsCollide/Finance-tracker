import React from "react";
import { 
  FiShoppingBag, FiCoffee, FiTruck, FiFilm, 
  FiZap, FiDollarSign, FiTrash2, FiEdit3 
} from "react-icons/fi";

const categoryIcons = {
  work: FiDollarSign,
  grocery: FiCoffee,
  entertainment: FiFilm,
  transport: FiTruck,
  health: FiZap,
  education: FiZap,
  other: FiDollarSign,
  Shopping: FiShoppingBag,
  Food: FiCoffee,
  Transportation: FiTruck,
  Utilities: FiZap,
};

const BudgetCard = ({ budget, onDelete, onEdit }) => {
  const { _id, category, spent = 0, limit = 0, percentage = 0 } = budget || {};

  // Guard semua field
  const safeCategory = category || "Other";
  const safeSpent = Number(spent) || 0;
  const safeLimit = Number(limit) || 0;
  const safePercentage = Number(percentage) || 0;

  const Icon = categoryIcons[safeCategory.toLowerCase()] || FiDollarSign;
  const isOverBudget = safePercentage >= 100;

  const getStatusStyles = () => {
    if (safePercentage < 60) return { text: "text-emerald-600", bg: "bg-emerald-500/10", bar: "bg-emerald-500" };
    if (safePercentage < 90) return { text: "text-amber-600", bg: "bg-amber-500/10", bar: "bg-amber-500" };
    return { text: "text-rose-600", bg: "bg-rose-500/10", bar: "bg-rose-500" };
  };

  const status = getStatusStyles();

  const remaining = safeLimit - safeSpent;
  const remainingFormatted = remaining >= 0 ? remaining.toLocaleString("id-ID") : `-${Math.abs(remaining).toLocaleString("id-ID")}`;

  return (
    <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl hover:scale-[1.015] transition-all duration-300 overflow-hidden">

  <div className={`absolute top-0 left-0 right-0 h-1 ${status.bar} opacity-90`}></div>

  {/* Action Buttons */}
  <div className="absolute top-3 right-3 flex gap-1.5 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 z-10">
    <button
      onClick={() => onEdit?.(budget)}
      className="p-2 bg-white/80 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
    >
      <FiEdit3 size={15} />
    </button>
    <button
      onClick={() => onDelete?.(_id)}
      className="p-2 bg-white/80 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
    >
      <FiTrash2 size={15} />
    </button>
  </div>

  <div className="p-5 pt-7">

    {/* Icon & Category */}
    <div className="flex items-center gap-4 mb-6">
      <div className={`p-3 rounded-xl ${status.bg}`}>
        <Icon size={24} className={`${status.text} stroke-[2.5]`} />
      </div>

      <div>
        <h3 className="font-bold text-lg text-gray-900 capitalize">
          {safeCategory}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <div className={`w-2 h-2 rounded-full ${status.bar}`}></div>
          <p className="text-xs font-semibold text-gray-500">
            {safePercentage.toFixed(1)}% Used
          </p>
        </div>
      </div>
    </div>

    {/* Amount Section */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <p className="text-[11px] font-bold text-gray-500 uppercase mb-1">
          Spent
        </p>
        <p className="text-xl font-black text-gray-900">
          Rp {safeSpent.toLocaleString("id-ID")}
        </p>
      </div>

      <div className="text-right">
        <p className="text-[11px] font-bold text-gray-500 uppercase mb-1">
          Limit
        </p>
        <p className="text-lg font-bold text-gray-600">
          Rp {safeLimit.toLocaleString("id-ID")}
        </p>
      </div>
    </div>

    {/* Progress */}
    <div className="space-y-2">
      <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`absolute inset-0 ${status.bar} transition-all duration-700`}
          style={{ width: `${Math.min(safePercentage, 100)}%` }}
        />
      </div>

      {isOverBudget ? (
        <div className="flex items-center justify-between text-xs">
          <span className="text-rose-600 font-semibold">
            OVER LIMIT
          </span>
          <span className="text-rose-600 font-bold">
            -Rp {Math.abs(remaining).toLocaleString("id-ID")}
          </span>
        </div>
      ) : (
        <div className="text-right text-xs text-gray-600">
          Rp {remainingFormatted} left
        </div>
      )}
    </div>
  </div>
</div>
  );
};

export default BudgetCard;