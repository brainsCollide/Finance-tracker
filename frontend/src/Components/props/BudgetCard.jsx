import React from "react";
import { 
  FiShoppingBag, FiCoffee, FiTruck, FiFilm, 
  FiZap, FiDollarSign, FiArrowUpRight, FiTrash2, FiEdit3 
} from "react-icons/fi";
import { AlertCircle } from "lucide-react";

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
    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
      
      {/* Gradient accent top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${status.bar} opacity-90 group-hover:opacity-100 transition-opacity`}></div>

      {/* Action Buttons */}
      <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <button
          onClick={() => onEdit?.(budget)}
          className="p-2.5 bg-white/80 backdrop-blur-sm text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"
          title="Edit Budget"
        >
          <FiEdit3 size={18} />
        </button>
        <button
          onClick={() => onDelete?.(_id)}
          className="p-2.5 bg-white/80 backdrop-blur-sm text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm"
          title="Delete Budget"
        >
          <FiTrash2 size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="p-7 pt-10">
        {/* Icon & Category */}
        <div className="flex items-center gap-5 mb-8">
          <div className={`p-5 rounded-2xl ${status.bg} transition-transform group-hover:scale-110 duration-300`}>
            <Icon size={32} className={`${status.text} stroke-[2.5]`} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-900 capitalize tracking-tight">
              {safeCategory}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2.5 h-2.5 rounded-full ${status.bar}`}></div>
              <p className="text-sm font-semibold text-gray-500">
                {safePercentage.toFixed(1)}% Utilized
              </p>
            </div>
          </div>
        </div>

        {/* Amount Section */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Spent</p>
            <p className="text-2xl font-black text-gray-900">
              Rp {safeSpent.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Limit Cap</p>
            <p className="text-xl font-bold text-gray-600">
              Rp {safeLimit.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
            <div
              className={`absolute inset-0 ${status.bar} transition-all duration-1000 ease-out shadow-sm`}
              style={{ width: `${Math.min(safePercentage, 100)}%` }}
            />
          </div>

          {/* Status Message */}
          {isOverBudget ? (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-rose-600 font-semibold animate-pulse">
                <AlertCircle size={16} />
                <span>OVER LIMIT!</span>
              </div>
              <span className="text-rose-600 font-bold">
                -Rp {Math.abs(remaining).toLocaleString("id-ID")}
              </span>
            </div>
          ) : (
            <div className="text-right text-sm font-medium text-gray-600">
              Rp {remainingFormatted} tersisa
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;