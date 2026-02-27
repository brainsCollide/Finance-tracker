import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { PlusCircle, Target, TrendingUp, AlertCircle } from 'lucide-react';
import BudgetCard from './props/BudgetCard';
import AddBudgetModal from './Widgets/AddBudgetModal';
import ConfirmModal from './Widgets/ConfirmModal';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]); // untuk hitung spent
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false); // ← ini yang hilang! tambahkan baris ini

  // Fetch budgets & transactions + hitung spent real
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch budgets
        const budgetsRes = await axiosInstance.get('/budgets', { withCredentials: true });
        let fetchedBudgets = Array.isArray(budgetsRes.data) ? budgetsRes.data : [];

        // 2. Fetch semua transaksi
        const transRes = await axiosInstance.get('/transactions', { withCredentials: true });
        const allTransactions = transRes.data || [];

        // 3. Hitung spent hanya dari expense, group by category
        const spentByCategory = allTransactions.reduce((acc, tx) => {
          if (tx.type === "expense" && tx.category) {
            const category = tx.category.toLowerCase(); // normalize case
            acc[category] = (acc[category] || 0) + Number(tx.amount || 0);
          }
          return acc;
        }, {});

        // 4. Update budgets dengan spent & percentage real-time
        fetchedBudgets = fetchedBudgets.map(budget => {
          const categoryKey = budget.category.toLowerCase();
          const realSpent = spentByCategory[categoryKey] || 0;
          const limit = Number(budget.limit) || 0;
          const percentage = limit > 0 ? Math.min((realSpent / limit) * 100, 100) : 0;

          return {
            ...budget,
            spent: realSpent,
            percentage,
          };
        });

        setBudgets(fetchedBudgets);
        setTransactions(allTransactions);
      } catch (err) {
        setError('Gagal memuat data budget atau transaksi. Coba refresh.');
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Delete logic
  const openDeleteConfirm = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteModal.id;
    if (!id) return;

    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/budgets/${id}`, { withCredentials: true });
      setBudgets((prev) => prev.filter((b) => b._id !== id));
      setDeleteModal({ isOpen: false, id: null });
      toast.success("Budget berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus budget");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Add/Edit logic
  const handleOpenAddModal = () => {
    setSelectedBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleBudgetAddedOrUpdated = (newBudget) => {
    setBudgets((prev) => {
      const exists = prev.find((b) => b._id === newBudget._id);
      if (exists) {
        return prev.map((b) => (b._id === newBudget._id ? newBudget : b));
      }
      return [...prev, newBudget];
    });
  };

  // Summary calculation (pakai spent real)
  const totalLimit = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const overallPercentage = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Memuat data keuangan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Refresh Halaman
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8 md:p-12">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-indigo-600">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <Target size={28} className="stroke-[2.5]" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600">Smart Planner</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Budgeting <span className="text-indigo-600">.</span>
            </h1>
            <p className="text-gray-600 font-medium max-w-2xl">
              Pantau efisiensi pengeluaranmu di setiap kategori secara real-time.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all duration-300 shadow-xl shadow-indigo-200/50 active:scale-95"
          >
            <PlusCircle className="transition-transform group-hover:rotate-90 duration-500" size={24} />
            <span>Buat Budget Baru</span>
          </button>
        </header>

        {/* Overall Summary */}
        {budgets.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-12 shadow-xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 text-indigo-500/5">
              <Target size={300} strokeWidth={1} />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest">
                  <TrendingUp size={16} /> Status Keseluruhan
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-tight">Total Penggunaan Bulanan</p>
                  <h2 className="text-5xl font-black text-gray-900 mt-2">
                    Rp {totalSpent.toLocaleString("id-ID")}
                    <span className="text-gray-400 font-light text-3xl ml-3">/ Rp {totalLimit.toLocaleString("id-ID")}</span>
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Intensitas Penggunaan</span>
                  <span className={`text-3xl font-black ${overallPercentage > 90 ? 'text-rose-600' : overallPercentage > 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {overallPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-6 bg-gray-100 rounded-2xl overflow-hidden p-0.5 border border-gray-200">
                  <div
                    className={`h-full rounded-xl transition-all duration-1000 ease-out shadow-inner ${
                      overallPercentage > 90 ? 'bg-rose-500' :
                      overallPercentage > 60 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${overallPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid Budget Cards */}
        {budgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget._id}
                budget={budget}
                onDelete={() => openDeleteConfirm(budget._id)}
                onEdit={() => handleOpenEditModal(budget)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border-4 border-dashed border-gray-200 shadow-inner">
            <div className="w-32 h-32 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 text-gray-300">
              <AlertCircle size={64} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Belum Ada Budget Aktif</h3>
            <p className="text-gray-500 font-medium mt-4 text-center max-w-md">
              Buat budget pertama Anda untuk mulai memantau dan mengontrol pengeluaran per kategori.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-8 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg"
            >
              Buat Budget Baru
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBudgetAdded={handleBudgetAddedOrUpdated}
        editingBudget={selectedBudget}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Penghapusan"
        message="Budget ini akan dihapus permanen beserta limitnya. Aksi ini tidak dapat dibatalkan."
        isLoading={isDeleting} // ← sekarang isDeleting sudah didefinisikan
      />
    </div>
  );
};

export default Budgets;