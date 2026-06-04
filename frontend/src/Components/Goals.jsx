import { useEffect, useState } from "react";
import { FiPlus, FiTarget } from "react-icons/fi";
import { PlusCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

import GoalCard from "./props/GoalCard";
import Modal from "./Widgets/Modal";
import AddGoalModal from "./Widgets/AddGoalModal";

import { useGoalStore } from "../stores/goal.store";

import "react-toastify/dist/ReactToastify.css";

const Goals = () => {
  const {
    goals,
    fetchGoals,
    upsertGoal,
    deleteGoal,
    isLoadingGoals,
    error,
  } = useGoalStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenCreate = () => {
    setSelectedGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const handleGoalSaved = (savedGoal) => {
    upsertGoal(savedGoal);

    toast.success(
      selectedGoal
        ? "Goal updated successfully"
        : "Goal created successfully"
    );
  };

  const handleGoalDeleted = async (id) => {
    try {
      await deleteGoal(id);
      toast.success("Goal deleted successfully");
    } catch (err) {
      toast.error("Failed to delete goal");
    }
  };

  const isLoading = isLoadingGoals;

  return (
    <div className="p-4 sm:p-8 md:p-12 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              <FiTarget className="stroke-[3]" />
              Future Planning
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight italic uppercase">
              Financial Goals{" "}
              <span className="text-amber-500">.</span>
            </h1>

            <p className="text-slate-500 font-medium">
              Turning your dreams into achievable milestones.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="group flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-xl"
          >
            <span>Create New Goal</span>
            <PlusCircle size={20} />
          </button>
        </header>

        {/* CONTENT */}
        {isLoading && <p>Loading...</p>}

        {error && (
          <div className="p-5 bg-rose-50 text-rose-600 rounded-2xl">
            {error}
          </div>
        )}

        {!isLoading && goals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <button
              onClick={handleOpenCreate}
              className="
                group relative
                w-full max-w-md
                border-2 border-dashed border-slate-200
                rounded-[2rem]
                p-12
                flex flex-col items-center justify-center gap-5
                bg-white/60 backdrop-blur
                hover:border-blue-300
                hover:bg-blue-50/30
                transition-all
                shadow-sm hover:shadow-md
              "
            >
              {/* Icon bubble */}
              <div className="
                w-20 h-20 rounded-full
                bg-slate-50
                flex items-center justify-center
                text-slate-300
                group-hover:bg-blue-100
                group-hover:text-blue-500
                transition-all
              ">
                <FiTarget size={34} />
              </div>

              {/* Text */}
              <div className="text-center space-y-2">
                <p className="text-slate-900 font-black uppercase tracking-widest text-[11px]">
                  No financial goals yet
                </p>

                <p className="text-slate-400 text-sm font-medium">
                  Start building your future by setting your first goal
                </p>
              </div>

              {/* CTA hint */}
              <div className="
                mt-2 px-4 py-2
                rounded-xl
                bg-slate-900 text-white
                text-xs font-bold
                group-hover:bg-blue-600
                transition-all
              ">
                + Create your first goal
              </div>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onEdit={() => handleOpenEdit(goal)}
              onDelete={() => handleGoalDeleted(goal._id)}
            />
          ))}
        </div>

        {/* MODAL */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedGoal(null);
          }}
          title={selectedGoal ? "Edit Goal" : "Create Goal"}
        >
          <AddGoalModal
            goal={selectedGoal}
            onSaved={handleGoalSaved}
            onClose={() => setIsModalOpen(false)}
          />
        </Modal>

        <ToastContainer />
      </div>
    </div>
  );
};

export default Goals;