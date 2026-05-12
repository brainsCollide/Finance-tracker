import React from "react";
import { FiTrash2, FiCalendar, FiTarget, FiAward } from "react-icons/fi";

const GoalCard = ({ goal, onDelete }) => {
  const { title, targetAmount, currentAmount, deadline, _id } = goal;
  const progress = Math.min((currentAmount / targetAmount) * 100, 100);
  const isCompleted = progress >= 100;

  return (
    <div className="group bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
      {/* Background Decoration */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>

      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
          {isCompleted ? <FiAward size={24} /> : <FiTarget size={24} />}
        </div>
        <button
          onClick={() => onDelete(_id)}
          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
        >
          <FiTrash2 size={18} />
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest">
          <FiCalendar size={12} />
          <span>Due {new Date(deadline).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Savings</p>
            <p className="text-lg font-black text-slate-900">
              Rp {currentAmount.toLocaleString('id-ID')}
            </p>
          </div>
          <p className="text-xs font-bold text-slate-400 pb-1">
            of Rp {targetAmount.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Progress Bar Modern */}
        <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              isCompleted ? 'bg-emerald-500' : 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.3)]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-500' : 'text-blue-500'}`}>
                {isCompleted ? 'Goal Achieved!' : 'Keep going!'}
            </span>
            <span className="text-xs font-black text-slate-900">{progress.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;