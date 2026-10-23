
import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const GREEN = "#10B981";
const RED = "#F43F5E";

const formatRupiah = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const formatAxisValue = (value) => {
  if (Math.abs(value) >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1000) {
    return `Rp ${(value / 1000).toFixed(0)}K`;
  }

  return `Rp ${value}`;
};

/**
 * Supports common transaction shapes:
 * { amount, type: "income" | "expense", date }
 * { amount, transactionType: "income" | "expense", date }
 *
 * Adjust getTransactionType() or getTransactionDate() if your
 * backend uses different field names.
 */
function getTransactionType(transaction) {
  const type = String(
    transaction.type ??
    transaction.transactionType ??
    transaction.kind ??
    transaction.categoryType ??
    ""
  ).toLowerCase();

  if (["income", "earning", " pemasukan"].includes(type.trim())) {
    return "income";
  }

  if (["expense", "spending", "pengeluaran"].includes(type.trim())) {
    return "expense";
  }

  return null;
}

function getTransactionAmount(transaction) {
  return Number(
    transaction.amount ??
    transaction.total ??
    transaction.value ??
    0
  );
}

function getTransactionDate(transaction) {
  return (
    transaction.date ??
    transaction.transactionDate ??
    transaction.createdAt ??
    null
  );
}

export default function BarChartComponent({
  monthlyStats = [],
  transactions = [],
  mode = "monthly",
  selectedMonth = new Date().getMonth(),
  selectedYear = new Date().getFullYear(),
}) {
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(
      selectedYear,
      selectedMonth + 1,
      0
    ).getDate();

    const days = Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      income: 0,
      expenses: 0,
    }));

    transactions.forEach((transaction) => {
      const rawDate = getTransactionDate(transaction);
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return;

      if (
        date.getFullYear() !== selectedYear ||
        date.getMonth() !== selectedMonth
      ) {
        return;
      }

      const type = getTransactionType(transaction);
      const amount = Math.abs(getTransactionAmount(transaction));

      if (!type || !Number.isFinite(amount)) return;

      const dayIndex = date.getDate() - 1;

      if (type === "income") {
        days[dayIndex].income += amount;
      } else {
        days[dayIndex].expenses += amount;
      }
    });

    return days;
  }, [transactions, selectedMonth, selectedYear]);

  const data = useMemo(() => {
    if (mode === "daily") {
      const netCashflow = dailyData.map(
        (day) => day.income - day.expenses
      );

      return {
        labels: dailyData.map((day) => String(day.day)),
        datasets: [
          {
            label: "Net Cashflow",
            data: netCashflow,
            backgroundColor: netCashflow.map((value) =>
              value >= 0 ? GREEN : RED
            ),
            borderRadius: 5,
            borderSkipped: false,
            barPercentage: 0.7,
            categoryPercentage: 0.85,
          },
        ],
      };
    }

    const filledStats = Array.from({ length: 12 }, (_, index) =>
      monthlyStats[index] || {
        totalExpenses: 0,
        totalIncome: 0,
      }
    );

    return {
      labels: MONTHS,
      datasets: [
        {
          label: "Income",
          data: filledStats.map((entry) =>
            Number(entry.totalIncome || 0)
          ),
          backgroundColor: GREEN,
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
        },
        {
          label: "Expenses",
          data: filledStats.map((entry) =>
            Number(entry.totalExpenses || 0)
          ),
          backgroundColor: RED,
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
        },
      ],
    };
  }, [mode, dailyData, monthlyStats]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        display: mode === "monthly",
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          color: "#64748B",
          font: {
            size: 13,
            family: "Inter, sans-serif",
          },
          padding: 20,
        },
      },

      tooltip: {
        backgroundColor: "#1E293B",
        padding: 12,
        titleFont: {
          size: 14,
          family: "Inter, sans-serif",
          weight: "normal",
        },
        bodyFont: {
          size: 13,
          family: "Inter, sans-serif",
          weight: "bold",
        },
        usePointStyle: true,

        callbacks: {
          title: (items) => {
            if (mode === "daily" && items.length > 0) {
              const day = Number(items[0].label);
              const date = new Date(
                selectedYear,
                selectedMonth,
                day
              );

              return date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
            }

            return items[0]?.label ?? "";
          },

          label: (context) => {
            if (mode === "daily") {
              const value = Number(context.raw || 0);
              const status =
                value > 0
                  ? "Surplus"
                  : value < 0
                    ? "Defisit"
                    : "Seimbang";

              return ` ${status}: ${formatRupiah(value)}`;
            }

            return ` ${context.dataset.label}: ${formatRupiah(
              context.raw
            )}`;
          },

          afterBody: (items) => {
            if (mode !== "daily" || items.length === 0) {
              return [];
            }

            const day = Number(items[0].label);
            const daily = dailyData[day - 1];

            return [
              `Income: ${formatRupiah(daily?.income)}`,
              `Expenses: ${formatRupiah(daily?.expenses)}`,
            ];
          },
        },
      },
    },
    layout: {
            padding: {
              bottom: 8,
              left: 4,
              right: 4,
            },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "#94A3B8",
          font: {
            family: "Inter, sans-serif",
            size: 11,
          },

          // Monthly labels: diagonal on narrow screens.
          // Daily labels: show fewer dates to prevent crowding.
          maxRotation: mode === "monthly" ? 45 : 0,
          minRotation: mode === "monthly" ? 35 : 0,
          autoSkip: true,
          maxTicksLimit: mode === "daily" ? 10 : 12,
          padding: 8,
        },
        title: {
          display: mode === "daily",
          text: mode === "daily" ? "Tanggal" : "",
          color: "#94A3B8",
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: "#F1F5F9",
          drawTicks: false,
        },
        ticks: {
          color: "#94A3B8",
          font: {
            family: "Inter, sans-serif",
          },
          padding: 10,
          callback: (value) => formatAxisValue(value),
        },
      },
    },
  }), [mode, selectedMonth, selectedYear, dailyData]);

  if (mode === "monthly" && monthlyStats.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        No data available for this year.
      </div>
    );
  }

  if (mode === "daily" && transactions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        No transaction data available.
      </div>
    );
  }

  return (
    <div className="relative h-[280px] w-full sm:h-[320px] md:h-[350px]">
      <Bar data={data} options={options} />
    </div>
  );
}
