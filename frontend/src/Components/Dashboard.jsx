import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import AddTransaction from "./Widgets/AddTransaction";
import UpcomingPayment from "./Widgets/UpcomingPayment";
import Modal from "./Widgets/Modal";
import BarChartComponent from "./Charts/BarChart";
import DoughnutChartComponent from "./Charts/DoughnutChart";
import { useAuthStore } from "../stores/auth.store";
import SavingsRateBadge from "./Badges/SavingsRateBadge";
import PaymentRow from "../props/PaymentRow";
import { getDaysUntil, groupPayments } from "../utils/payments";

import {
  FiTrendingUp,
  FiTrendingDown,
  FiPocket,
  FiCalendar,
  FiTarget,
  FiChevronRight,
  FiCreditCard,
} from "react-icons/fi";

import { useBalanceStore } from "../stores/balance.store";
import { usePaymentStore } from "../stores/payment.store";
import { useBudgetStore } from "../stores/budget.store";
import { toast, ToastContainer } from "react-toastify";

const UNDO_MS = 5000;

export default function Dashboard() {
  const navigate = useNavigate();

  const [modalType, setModalType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [chartMode, setChartMode] = useState("monthly");
  const [summaryMode, setSummaryMode] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  const { user, fetchUser } = useAuthStore();

  const {
    income = 0,
    expenses = 0,
    monthlyStats = [],
    transactions = [],
    yearToDate,
    yearlyTotal,
    fetchTransactionStats,
    fetchTransactions,
  } = useBalanceStore();

  const {
    upcomingPayments = [],
    fetchUpcomingPayments,
    markAsPaid,
  } = usePaymentStore();

  const {
    budgets = [],
    fetchBudgets,
  } = useBudgetStore();

  // The selected month/year drives the summary and the chart's yearly data.
  const selectedMonthNumber = selectedMonth + 1;

  // Net cashflow values for the selected summary mode.
  const summaryIncome =
    summaryMode === "yearly"
      ? Number(yearlyTotal?.income) || 0
      : income;
  const summaryExpenses =
    summaryMode === "yearly"
      ? Number(yearlyTotal?.expenses) || 0
      : expenses;
  const balance = summaryIncome - summaryExpenses;
  const summaryNet =
    summaryMode === "yearly"
      ? Number(yearlyTotal?.netCashflow) || balance
      : Number(yearToDate?.netCashflow) || 0;

  const initDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetchUser();

      await Promise.all([
        fetchTransactions(),
        fetchUpcomingPayments(),
        fetchBudgets(),
      ]);
    } catch (error) {
      console.error("Failed to initialize dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchTransactions,
    fetchUpcomingPayments,
    fetchBudgets,
    fetchUser,
  ]);

  useEffect(() => {
    initDashboard();
  }, [initDashboard]);

  // Reload stats whenever the selected month or year changes.
  useEffect(() => {
    fetchTransactionStats(selectedMonthNumber, selectedYear);
  }, [fetchTransactionStats, selectedMonthNumber, selectedYear]);

  // --- Upcoming payments: urutan, undo, dan "view all" ---
  const [pendingIds, setPendingIds] = useState([]); // sedang menunggu undo
  const pendingRef = useRef(new Map()); // id -> { timeoutId, payment }
  const periodRef = useRef({
    month: selectedMonthNumber,
    year: selectedYear,
  });

  useEffect(() => {
    periodRef.current = { month: selectedMonthNumber, year: selectedYear };
  }, [selectedMonthNumber, selectedYear]);

  const sortedPayments = useMemo(
    () =>
      [...upcomingPayments]
        .filter((p) => !pendingIds.includes(p._id))
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [upcomingPayments, pendingIds]
  );

  // Kartu menampilkan yang mendesak (overdue + 14 hari ke depan), maksimal 4.
  // Kalau tidak ada yang mendesak, tampilkan 3 terdekat supaya kartu tidak kosong.
  const { cardPayments, hiddenCount } = useMemo(() => {
    const urgent = sortedPayments.filter(
      (p) => getDaysUntil(p.dueDate) <= 14
    );
    const shown =
      urgent.length > 0 ? urgent.slice(0, 4) : sortedPayments.slice(0, 3);
    return {
      cardPayments: shown,
      hiddenCount: sortedPayments.length - shown.length,
    };
  }, [sortedPayments]);

  const commitPaid = async (payment) => {
    pendingRef.current.delete(payment._id);
    try {
      await markAsPaid(payment);
      const { month, year } = periodRef.current;
      await Promise.all([
        fetchTransactionStats(month, year),
        fetchTransactions(),
        fetchBudgets(),
      ]);
    } catch {
      toast.error("Gagal menandai pembayaran");
    } finally {
      setPendingIds((ids) => ids.filter((id) => id !== payment._id));
    }
  };

  // ref supaya cleanup unmount selalu memakai versi terbaru
  const commitRef = useRef(commitPaid);
  commitRef.current = commitPaid;

  // Kalau user pindah halaman saat menunggu undo, proses pembayarannya sekarang
  useEffect(() => {
    const pending = pendingRef.current;
    return () => {
      pending.forEach(({ timeoutId, payment }) => {
        clearTimeout(timeoutId);
        commitRef.current(payment);
      });
      pending.clear();
    };
  }, []);

  const handleUndoPaid = (payment) => {
    const entry = pendingRef.current.get(payment._id);
    if (!entry) return; // sudah terlanjur diproses
    clearTimeout(entry.timeoutId);
    pendingRef.current.delete(payment._id);
    setPendingIds((ids) => ids.filter((id) => id !== payment._id));
  };

  const handleMarkPaid = (payment) => {
    if (pendingRef.current.has(payment._id)) return;

    setPendingIds((ids) => [...ids, payment._id]);
    const timeoutId = setTimeout(() => commitRef.current(payment), UNDO_MS);
    pendingRef.current.set(payment._id, { timeoutId, payment });

    toast(
      ({ closeToast }) => (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm">"{payment.title}" ditandai lunas</span>
          <button
            type="button"
            onClick={() => {
              handleUndoPaid(payment);
              closeToast();
            }}
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            Undo
          </button>
        </div>
      ),
      {
        autoClose: UNDO_MS,
        closeOnClick: false,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
      }
    );
  };

  const savingsRate =
    summaryIncome > 0
      ? Number(((balance / summaryIncome) * 100).toFixed(1))
      : 0;

  const today = new Date();
  const daysInSelectedMonth = new Date(
    selectedYear,
    selectedMonthNumber,
    0
  ).getDate();
  const daysElapsed =
    selectedYear === today.getFullYear() &&
    selectedMonthNumber === today.getMonth() + 1
      ? today.getDate()
      : daysInSelectedMonth;

  const monthlyBurn =
    daysElapsed > 0
      ? Math.round(summaryExpenses / daysElapsed)
      : 0;
  const yearlyMonthlyAverage = Math.round(summaryExpenses / 12);

  const activeBudgets = budgets.length;
  const recurringBills = sortedPayments.length;

  const periodLabel =
    summaryMode === "yearly"
      ? String(selectedYear)
      : new Date(
          selectedYear,
          selectedMonth,
          1
        ).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

  const periodNoun = summaryMode === "yearly" ? "year" : "month";

  const formatRupiah = (amount) =>
    `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-500">
            Loading your financial overview...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />

      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* HEADER */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-600">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              FINANCIAL OVERVIEW
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Welcome back,{" "}
              <span className="font-semibold text-slate-800">
                {user?.username || "Chief"}
              </span>
              . Here's your financial overview.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setModalType("transaction")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 sm:flex-none"
            >
              <PlusCircle size={18} />
              Transaction
            </button>

            <button
              type="button"
              onClick={() => setModalType("upcoming")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-none"
            >
              <PlusCircle size={18} />
              Payment
            </button>
          </div>
        </header>

        {/* PRIMARY FINANCIAL SUMMARY */}
        <section>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Financial summary
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your numbers for {periodLabel}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setSummaryMode("monthly")}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    summaryMode === "monthly"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setSummaryMode("yearly")}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    summaryMode === "yearly"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Yearly
                </button>
              </div>

              {summaryMode === "monthly" ? (
                <input
                  aria-label="Select month and year for financial summary"
                  type="month"
                  value={`${selectedYear}-${String(selectedMonthNumber).padStart(2, "0")}`}
                  onChange={(event) => {
                    if (!event.target.value) return;
                    const [year, month] = event.target.value
                      .split("-")
                      .map(Number);
                    setSelectedYear(year);
                    setSelectedMonth(month - 1);
                  }}
                  className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <input
                  aria-label="Select year for financial summary"
                  type="number"
                  min="2000"
                  max="2100"
                  value={selectedYear}
                  onChange={(event) => {
                    const year = Number(event.target.value);
                    if (
                      Number.isInteger(year) &&
                      year >= 2000 &&
                      year <= 2100
                    ) {
                      setSelectedYear(year);
                    }
                  }}
                  className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            {/* Main metric */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm sm:p-8 xl:col-span-5">
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">
                    Net cashflow
                  </p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0156d6]">
                    <FiPocket size={19} />
                  </div>
                </div>

                <p className="mt-5 break-words text-3xl font-semibold tracking-tight text-[#0156d6] sm:text-4xl">
                  {formatRupiah(balance)}
                </p>

                <p className="mt-3 text-sm text-slate-500">
                  {summaryMode === "yearly"
                    ? "Income minus expenses for the selected year."
                    : `Income minus expenses for ${periodLabel}.`}
                </p>

                <div className="mt-7 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500">
                        {summaryMode === "yearly"
                          ? "Yearly net"
                          : "Year-to-date net"}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-800">
                        {formatRupiah(summaryNet)}
                      </p>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                        balance >= 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {balance >= 0 ? (
                        <FiTrendingUp size={15} />
                      ) : (
                        <FiTrendingDown size={15} />
                      )}
                      {balance >= 0 ? "Positive" : "Negative"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Supporting metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-7">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <FiTrendingUp size={19} />
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    {summaryMode === "yearly" ? "This year" : periodLabel}
                  </span>
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  Total income
                </p>
                <p className="mt-1 break-words text-2xl font-semibold tracking-tight text-slate-900">
                  {formatRupiah(summaryIncome)}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {summaryMode === "yearly"
                    ? "Money received this year"
                    : `Money received in ${periodLabel}`}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <FiTrendingDown size={19} />
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    {summaryMode === "yearly" ? "This year" : periodLabel}
                  </span>
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  Total expenses
                </p>
                <p className="mt-1 break-words text-2xl font-semibold tracking-tight text-slate-900">
                  {formatRupiah(summaryExpenses)}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {summaryMode === "yearly"
                    ? "Money spent this year"
                    : `Money spent in ${periodLabel}`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CASHFLOW ANALYTICS */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Cashflow analytics
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {chartMode === "monthly"
                    ? `Compare income and spending across ${selectedYear}.`
                    : "Track your daily net cashflow."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setChartMode("monthly")}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      chartMode === "monthly"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Monthly
                  </button>

                  <button
                    type="button"
                    onClick={() => setChartMode("daily")}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      chartMode === "daily"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Daily
                  </button>
                </div>

                {chartMode === "daily" && (
                  <input
                    type="month"
                    value={`${selectedYear}-${String(
                      selectedMonth + 1
                    ).padStart(2, "0")}`}
                    onChange={(event) => {
                      if (!event.target.value) return;

                      const [year, month] = event.target.value
                        .split("-")
                        .map(Number);

                      setSelectedYear(year);
                      setSelectedMonth(month - 1);
                    }}
                    className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <BarChartComponent
              monthlyStats={monthlyStats}
              transactions={transactions}
              mode={chartMode}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />

            {chartMode === "daily" && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  Income greater than or equal to expenses
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                  Expenses greater than income
                </div>
              </div>
            )}
          </div>
        </section>

        {/* INSIGHTS */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Spending insights
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick look at your saving habits and financial commitments.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5">
              <SavingsRateBadge savingsRate={savingsRate} />
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <FiTrendingDown size={19} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">
                Average daily spending
              </p>
              <p className="mt-2 break-words text-2xl font-semibold tracking-tight text-slate-900">
                {formatRupiah(
                  summaryMode === "yearly"
                    ? yearlyMonthlyAverage
                    : monthlyBurn
                )}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {summaryMode === "yearly"
                  ? `Average monthly spending in ${selectedYear}.`
                  : `Daily average for ${periodLabel}.`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiTarget size={19} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">
                Budget plans
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {activeBudgets}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Budget categories being monitored.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FiCreditCard size={19} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">
                Upcoming bills
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {recurringBills}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Payments awaiting completion.
              </p>
            </div>
          </div>
        </section>

        {/* EXPENSE RATIO */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Expense ratio
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Compare your spending against income for the selected {periodNoun}.
            </p>
          </div>

          <DoughnutChartComponent
            income={summaryIncome}
            expenses={summaryExpenses}
          />
        </section>

        {/* BILLS & BUDGETS */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">

          {/* UPCOMING PAYMENTS */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <FiCalendar className="text-slate-500" size={19} />
                  Upcoming payments
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your nearest scheduled payments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalType("allPayments")}
                aria-label="View all payments"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <FiChevronRight size={21} />
              </button>
            </div>

            <div className="space-y-3">
              {cardPayments.length > 0 ? (
                <>
                  {cardPayments.map((payment) => (
                    <PaymentRow
                      key={payment._id}
                      payment={payment}
                      onPay={handleMarkPaid}
                    />
                  ))}

                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setModalType("allPayments")}
                      className="w-full rounded-xl py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      +{hiddenCount} more · View all
                    </button>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                  <p className="text-sm text-slate-500">
                    No upcoming payments.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    You're all caught up.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* BUDGET TRACKER */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <FiTarget className="text-slate-500" size={19} />
                  Budget tracker
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Spending progress across your categories.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/app/budgets")}
                aria-label="View all budgets"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <FiChevronRight size={21} />
              </button>
            </div>

            <div className="space-y-6">
              {budgets.length > 0 ? (
                budgets.slice(0, 4).map((budget) => {
                  const percentage =
                    budget.limit > 0
                      ? Math.min(
                          (budget.spent / budget.limit) * 100,
                          100
                        )
                      : 0;

                  return (
                    <div key={budget._id} className="space-y-2">
                      <div className="flex items-end justify-between gap-3">
                        <span className="text-sm font-medium capitalize text-slate-700">
                          {budget.category}
                        </span>

                        <span
                          className={`shrink-0 text-xs font-semibold ${
                            percentage > 90
                              ? "text-rose-600"
                              : "text-slate-500"
                          }`}
                        >
                          {percentage.toFixed(0)}% used
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            percentage > 90
                              ? "bg-rose-500"
                              : "bg-blue-600"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="flex justify-between gap-3 text-xs text-slate-400">
                        <span>{formatRupiah(budget.spent)}</span>
                        <span>Limit: {formatRupiah(budget.limit)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                  <p className="text-sm text-slate-500">
                    No budgets defined yet.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Create a budget to start tracking your spending.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* MODALS */}
      <Modal
        isOpen={modalType === "transaction"}
        onClose={() => setModalType(null)}
        title="Add Transaction"
        subtitle="Record your income and expenses to keep your financial activity organized and up to date."
      >
        <AddTransaction
          closeModal={() => {
            setModalType(null);
            fetchTransactionStats(selectedMonthNumber, selectedYear);
          }}
        />
      </Modal>

      <Modal
        isOpen={modalType === "upcoming"}
        onClose={() => setModalType(null)}
        title="Add Upcoming Payment"
        subtitle="Stay ahead of your bills and scheduled payments with smart reminders and due tracking."
      >
        <UpcomingPayment closeModal={() => setModalType(null)} />
      </Modal>

      <Modal
        isOpen={modalType === "allPayments"}
        onClose={() => setModalType(null)}
        title="Upcoming payments"
        subtitle="Everything that's scheduled, ordered by due date."
      >
        <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
          {groupPayments(sortedPayments).map((group) => (
            <div key={group.key}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {group.title} · {group.items.length}
              </h3>
              <div className="space-y-3">
                {group.items.map((payment) => (
                  <PaymentRow
                    key={payment._id}
                    payment={payment}
                    onPay={handleMarkPaid}
                  />
                ))}
              </div>
            </div>
          ))}

          {sortedPayments.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              You're all caught up.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}