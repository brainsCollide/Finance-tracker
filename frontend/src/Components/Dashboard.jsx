import React, { useState, useEffect, useCallback } from "react";
import AddTransaction from "./Widgets/AddTransaction";
import StatCard from "./props/StatCard";
import UpcomingPayment from "./Widgets/UpcomingPayment";
import Modal from "./Widgets/Modal";
import BarChartComponent from "./BarChart";
import DoughnutChartComponent from "./DoughnutChart";
import axiosInstance from "../api/axiosInstance";
import {
  IoMdCheckmark,
} from "react-icons/io";

import {
  FiTrendingUp,
  FiTrendingDown,
  FiPocket,
  FiCalendar,
  FiTarget,
  FiChevronRight,
  FiActivity,
  FiCreditCard,
  FiZap,
} from "react-icons/fi";

import { useBalanceStore } from "../stores/balance.store";
import { usePaymentStore } from "../stores/payment.store";
import { useBudgetStore } from "../stores/budget.store";
import { toast, ToastContainer } from "react-toastify";

export default function Dashboard({ onSectionChange }) {
  const [modalType, setModalType] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Zustand Stores
  const {
    income,
    expenses,
    monthlyStats,
    fetchTransactionStats,
  } = useBalanceStore();

  const {
    upcomingPayments,
    fetchUpcomingPayments,
    markAsPaid,
  } = usePaymentStore();

  const {
    budgets,
    fetchBudgets,
  } = useBudgetStore();

  const balance = income - expenses;

  const initDashboard = useCallback(async () => {
    try {
      setIsLoading(true);

      const authResponse = await axiosInstance.get("/auth/current", {
        withCredentials: true,
      });

      setUser(authResponse.data.user);

      await Promise.all([
        fetchTransactionStats(),
        fetchUpcomingPayments(),
        fetchBudgets(),
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchTransactionStats,
    fetchUpcomingPayments,
    fetchBudgets,
  ]);

  useEffect(() => {
    initDashboard();
  }, [initDashboard]);

  const handleMarkPaid = async (id, amount) => {
    try {
      await markAsPaid(id, amount);
      toast.success("Pembayaran berhasil dibayar");
    } catch {
      toast.error("Gagal menandai pembayaran");
    }
  };

  // --- DUMMY INSIGHTS ---
  const savingsRate =
    income > 0
      ? Math.max(((balance / income) * 100).toFixed(0), 0)
      : 0;

  const monthlyBurn =
    expenses > 0
      ? Math.round(expenses / 30)
      : 0;

  const activeBudgets = budgets.length;

  const recurringBills = upcomingPayments.length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">
            Syncing your financial data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-8 md:p-12">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />

      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <FiActivity />
            Financial Overview
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight italic uppercase">
            Dashboard <span className="text-blue-600">.</span>
          </h1>

          <p className="text-slate-500 font-medium">
            Welcome back,{" "}
            <span className="font-bold text-slate-800">
              {user?.username || "Chief"}
            </span>
            ! Here's your financial overview today.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setModalType("transaction")}
            className="flex-1 sm:flex-none px-6 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-xl active:scale-95 text-sm"
          >
            + Transaction
          </button>

          <button
            onClick={() => setModalType("upcoming")}
            className="flex-1 sm:flex-none px-6 py-3.5 bg-white text-slate-900 border border-slate-200 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 text-sm"
          >
            + Payment
          </button>
        </div>
      </div>

      {/* --- PRIMARY STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Income"
          icon={FiTrendingUp}
          value={`Rp ${income.toLocaleString("id-ID")}`}
          accentColor="emerald"
        />

        <StatCard
          title="Expenses"
          icon={FiTrendingDown}
          value={`Rp ${expenses.toLocaleString("id-ID")}`}
          accentColor="rose"
        />

        <StatCard
          title="Balance"
          icon={FiPocket}
          value={`Rp ${balance.toLocaleString("id-ID")}`}
          accentColor="blue"
        />
      </div>

      {/* --- SMART INSIGHTS (NEW SAAS FEEL) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">

        {/* Savings Rate */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <FiZap size={22} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
              Healthy
            </span>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Savings Rate
          </p>

          <h2 className="text-3xl font-black text-slate-900">
            {savingsRate}%
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Based on your current monthly cashflow.
          </p>
        </div>

        {/* Daily Burn */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <FiTrendingDown size={22} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Daily
            </span>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Average Spend
          </p>

          <h2 className="text-3xl font-black text-slate-900">
            Rp {monthlyBurn.toLocaleString("id-ID")}
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Estimated spending per day this month.
          </p>
        </div>

        {/* Active Budgets */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiTarget size={22} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
              Active
            </span>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Budget Plans
          </p>

          <h2 className="text-3xl font-black text-slate-900">
            {activeBudgets}
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Budget categories currently monitored.
          </p>
        </div>

        {/* Upcoming Bills */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <FiCreditCard size={22} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
              Scheduled
            </span>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Upcoming Bills
          </p>

          <h2 className="text-3xl font-black text-slate-900">
            {recurringBills}
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Payments waiting to be completed.
          </p>
        </div>
      </div>

      {/* --- CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

        {/* CASHFLOW */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase italic">
                Cashflow Analytics
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Monitor your income and spending trends.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Live Data
            </div>
          </div>

          <BarChartComponent monthlyStats={monthlyStats} />
        </div>

        {/* EXPENSE RATIO */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900 uppercase italic">
              Expense Ratio
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Compare your spending against total income.
            </p>
          </div>

          <DoughnutChartComponent
            income={income}
            expenses={expenses}
          />
        </div>
      </div>

      {/* --- BOTTOM SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* UPCOMING PAYMENTS */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase italic flex items-center gap-2">
                <FiCalendar className="text-rose-500" />
                Bills
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Your nearest scheduled payments.
              </p>
            </div>

            <button
              onClick={() => onSectionChange("Payments")}
              className="text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-all"
            >
              <FiChevronRight size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.slice(0, 3).map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors shadow-sm">
                      <FiCalendar size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[120px] sm:max-w-[200px]">
                        {payment.title}
                      </p>

                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Due{" "}
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-rose-500">
                      Rp {payment.amount.toLocaleString("id-ID")}
                    </span>

                    <button
                      onClick={() =>
                        handleMarkPaid(payment._id, payment.amount)
                      }
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <IoMdCheckmark size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm font-medium italic">
                  All bills are paid!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* BUDGET TRACKER */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase italic flex items-center gap-2">
                <FiTarget className="text-blue-600" />
                Budgets
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Monitor spending limits across categories.
              </p>
            </div>

            <button
              onClick={() => onSectionChange("Budgets")}
              className="text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-all"
            >
              <FiChevronRight size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {budgets.length > 0 ? (
              budgets.slice(0, 4).map((budget) => {
                const percentage = Math.min(
                  (budget.spent / budget.limit) * 100,
                  100
                );

                return (
                  <div
                    key={budget._id}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-slate-700 capitalize">
                        {budget.category}
                      </span>

                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {percentage.toFixed(0)}% Used
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          percentage > 90
                            ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                            : "bg-blue-600"
                        }`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      <span>
                        Rp {budget.spent.toLocaleString()}
                      </span>

                      <span>
                        Limit: Rp {budget.limit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-slate-50 rounded-3xl">
                <p className="text-slate-400 text-sm font-medium italic">
                  No budgets defined yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <Modal
        isOpen={modalType === "transaction"}
        onClose={() => setModalType(null)}
        title="Add Transaction"
        subtitle="Record your income and expenses to keep your financial activity organized and up to date."
      >
        <AddTransaction />
      </Modal>

      <Modal
        isOpen={modalType === "upcoming"}
        onClose={() => setModalType(null)}
        title="Add Upcoming Payment"
        subtitle="Stay ahead of your bills and scheduled payments with smart reminders and due tracking."
      >
        <UpcomingPayment
          closeModal={() => setModalType(null)}
        />
      </Modal>
    </div>
  );
}