import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { FiInbox, FiLoader, FiAlertCircle, FiArrowUpRight, FiArrowDownLeft } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from "framer-motion";
import Modal from './Widgets/Modal';
import 'react-toastify/dist/ReactToastify.css';
import BudgetCard from './props/BudgetCard';
import AddBudgetModal from './Widgets/AddBudgetModal';
import ConfirmModal from './Widgets/ConfirmModal';
import { useBudgetStore } from '../stores/budget.store';

// ─── Loading ─────────────────────────────────────────────

const Loading = () => (
  <div className="flex flex-col justify-center items-center h-96 space-y-4">
    <div className="relative">
      <div className="w-14 h-14 border-[3px] border-slate-100 border-t-blue-500 rounded-full animate-spin" />
      <FiLoader className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={24} />
    </div>
    <p className="text-slate-400 font-medium tracking-wide">
      Loading your budgets...
    </p>
  </div>
);

// ─── Empty State ─────────────────────────────────────────

const Empty = ({ onAdd }) => (
  <div className="flex flex-col justify-center items-center h-[400px] bg-white rounded-[2rem] border-2 border-dashed border-slate-100 p-12 text-center transition-all">
    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-300 ring-8 ring-slate-50/50">
      <FiInbox size={40} />
    </div>
    <h3 className="text-slate-900 font-bold text-xl tracking-tight">
      No active budgets yet
    </h3>
    <p className="text-slate-500 text-sm max-w-xs mt-2 leading-relaxed">
      Set your first budget to start tracking and controlling spending by category.
    </p>
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────

const Budgets = () => {
  const {
    budgets = [],
    isLoadingBudgets,
    error,
    fetchBudgets,
    deleteBudget,
    upsertBudget,
  } = useBudgetStore();

  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const openDeleteConfirm = (id) =>
    setDeleteModal({ isOpen: true, id });

  const handleConfirmDelete = async () => {
    const id = deleteModal.id;
    if (!id) return;

    setIsDeleting(true);
    try {
      await deleteBudget(id);

      setDeleteModal({ isOpen: false, id: null });
      toast.success('Budget deleted successfully');
    } catch (err) {
      toast.error('Failed to delete budget');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleBudgetAddedOrUpdated = (budget) => {
    upsertBudget(budget);
  };

  const totalLimit = budgets.reduce(
    (sum, b) => sum + (Number(b.limit) || 0),
    0
  );

  const totalSpent = budgets.reduce(
    (sum, b) => sum + (Number(b.spent) || 0),
    0
  );

  const overallPercentage =
    totalLimit > 0
      ? Math.min((totalSpent / totalLimit) * 100, 100)
      : 0;

  const renderContent = () => {
    if (isLoadingBudgets) return <Loading />;

    if (error)
      return (
        <div className="flex items-center space-x-3 bg-rose-50 border border-rose-100 p-5 rounded-2xl text-rose-600 mb-6 shadow-sm">
          <FiAlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      );

    if (budgets.length === 0)
      return <Empty onAdd={handleOpenAddModal} />;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {budgets.map((budget, index) => (
          <motion.div
            key={budget._id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.45,
              delay: index * 0.08,
              ease: "easeOut",
            }}
          >
            <BudgetCard
              budget={budget}
              onDelete={() => openDeleteConfirm(budget._id)}
              onEdit={() => handleOpenEditModal(budget)}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8 md:p-12 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1600px] mx-auto">

        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span>Smart Planner</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              Budget Tracker
            </h1>

            <p className="text-slate-500 font-light">
              Monitoring {budgets.length} active budget{budgets.length !== 1 ? 's' : ''} in real-time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">

            {budgets.length > 0 && (
              <div className="flex items-center gap-4 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm">

                <div className="flex items-center space-x-3 px-4 py-2 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                  <FiArrowUpRight size={20} className="text-emerald-500" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Total Limit
                    </p>
                    <p className="text-sm font-bold text-emerald-600">
                      Rp {totalLimit.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 px-4 py-2 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                  <FiArrowDownLeft size={20} className="text-rose-500" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Total Spent
                    </p>
                    <p className="text-sm font-bold text-rose-600">
                      Rp {totalSpent.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

              </div>
            )}

            <button
              onClick={handleOpenAddModal}
              className="group flex items-center gap-3 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-blue-200/60 active:scale-95"
            >
              <PlusCircle className="transition-transform group-hover:rotate-90 duration-500" size={20} />
              <span>New Budget</span>
            </button>

          </div>
        </header>

        {/* OVERALL USAGE (FIXED POSITION) */}
        {budgets.length > 0 && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Overall Usage
              </p>

              <span
                className={`text-sm font-black ${
                  overallPercentage > 90
                    ? 'text-rose-600'
                    : overallPercentage > 60
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {overallPercentage.toFixed(1)}% used
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  overallPercentage > 90
                    ? 'bg-rose-500'
                    : overallPercentage > 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* CONTENT */}
        <main>{renderContent()}</main>

      </div>

      {/* MODALS */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBudget(null);
        }}
        title={selectedBudget ? "Edit Budget" : "Add Budget"}
        subtitle={selectedBudget ? "Update your budget details" : "Create a new budget to start tracking"}
      >
        <AddBudgetModal
          budget={selectedBudget}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBudget(null);
          }}
          onSaved={handleBudgetAddedOrUpdated}
        />
      </Modal>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Budget"
        message="This budget and its limit will be permanently deleted. This action cannot be undone."
        isLoading={isDeleting}
      />

      <ToastContainer
        position="bottom-right"
        toastClassName="rounded-2xl font-sans shadow-2xl border border-slate-50 !bg-white !text-slate-900"
        progressClassName="!bg-blue-500"
      />
    </div>
  );
};

export default Budgets;