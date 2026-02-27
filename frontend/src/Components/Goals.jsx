import { useState } from "react";
import { FiPlus, FiTarget } from "react-icons/fi";
import { PlusCircle} from 'lucide-react';
import GoalCard from "./props/GoalCard";

const dummyGoals = [
  { _id: "1", title: "Buy a new laptop", targetAmount: 15000000, currentAmount: 5500000, deadline: "2025-12-31" },
  { _id: "2", title: "Vacation Fund", targetAmount: 20000000, currentAmount: 12000000, deadline: "2025-08-31" },
];

const Goals = () => {
  const [goals, setGoals] = useState(dummyGoals);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", targetAmount: "", deadline: "" });

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) return;
    setGoals((prev) => [...prev, { ...newGoal, _id: Date.now().toString(), currentAmount: 0 }]);
    setNewGoal({ title: "", targetAmount: "", deadline: "" });
    setShowForm(false);
  };

  return (
    <div className="p-4 sm:p-8 md:p-12 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              <FiTarget className="stroke-[3]" /> Future Planning
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight italic uppercase">
              Financial Goals <span className="text-amber-500">.</span>
            </h1>
            <p className="text-slate-500 font-medium">Turning your dreams into achievable milestones.</p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`group relative flex items-center justify-center gap-3 px-8 py-4 font-bold rounded-[2rem] transition-all duration-300 active:scale-95 shadow-xl overflow-hidden ${
              showForm 
                ? "bg-rose-50 text-rose-600 shadow-rose-100" 
                : "bg-slate-900 text-white shadow-slate-200 hover:bg-blue-600"
            }`}
          >
            {/* Efek Glow Tipis saat Hover */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <span className="relative z-10">
              {showForm ? "Cancel Entry" : "Create New Goal"}
            </span>

            <div className={`relative z-10 transition-transform duration-500 ${showForm ? 'rotate-45' : 'group-hover:rotate-90'}`}>
              {showForm ? <FiPlus size={20} className="stroke-[3]" /> : <PlusCircle size={20} />}
            </div>
          </button>
        </header>

        {/* Dynamic Entry Form */}
        {showForm && (
          <div className="mb-10 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                New Goal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Goal Title</label>
                <input
                    type="text"
                    placeholder="e.g. Dream Wedding"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target (IDR)</label>
                <input
                    type="number"
                    placeholder="0"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
                <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
                <button
                onClick={handleAddGoal}
                className="px-10 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                Confirm & Add Goal
                </button>
            </div>
          </div>
        )}

        {/* Goals List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {goals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} onDelete={(id) => setGoals(goals.filter(g => g._id !== id))} />
          ))}

          {/* Empty/Add Slot Placeholder */}
          {!showForm && (
            <button 
                onClick={() => setShowForm(true)}
                className="group border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all min-h-[250px]"
            >
                <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-500 transition-all">
                    <FiPlus size={28} />
                </div>
                <div className="text-center">
                    <p className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Ready for a new one?</p>
                    <p className="text-slate-400 text-xs font-medium mt-1">Add another life goal</p>
                </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;