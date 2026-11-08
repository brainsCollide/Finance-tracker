import React, { useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useBalanceStore } from "../../stores/balance.store";
import { useCurrency } from "../../hooks/useCurrency";
import { useCategoryMeta } from "../../hooks/useCategoryMeta";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChartComponent() {
  const transactions = useBalanceStore((state) => state.transactions);
  const { format } = useCurrency();
  const fetchTransactions = useBalanceStore(
    (state) => state.fetchTransactions
  );

  const { getMeta } = useCategoryMeta();

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter expense only
  const expenseTransactions = transactions.filter(
    (trx) => trx.type === "expense"
  );

  // Clean empty state if there are no expenses
  if (!expenseTransactions || expenseTransactions.length === 0) {
    return (
      <div className="flex h-[250px] md:h-[350px] items-center justify-center text-slate-400">
        No expenses recorded yet.
      </div>
    );
  }

  // Group by category
  const categoryMap = expenseTransactions.reduce((acc, trx) => {
    acc[trx.category] = (acc[trx.category] || 0) + trx.amount;
    return acc;
  }, {});

  const keys = Object.keys(categoryMap);
  const metas = keys.map((key) => getMeta(key));

  const data = {
    labels: metas.map((m) => m.label),
    datasets: [
      {
        data: keys.map((key) => categoryMap[key]),
        backgroundColor: metas.map((m) => m.color),
        borderWidth: 0,
        hoverOffset: 6,
        spacing: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%", // Makes the doughnut ring thinner and more elegant
    plugins: {
      legend: {
        position: "bottom", // Bottom usually fits better for category lists
        labels: {
          usePointStyle: true, // Uses circles instead of boxes
          boxWidth: 8,
          boxHeight: 8,
          color: "#64748B",
          font: { size: 12, family: "Inter, sans-serif" },
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "#1E293B", // Matches the sleek dark tooltip from the Bar chart
        padding: 12,
        titleFont: { size: 14, family: "Inter, sans-serif", weight: "normal" },
        bodyFont: { size: 13, family: "Inter, sans-serif", weight: "bold" },
        usePointStyle: true,
        callbacks: {
          label: (context) => ` ${format(context.raw)}`,
        },
      },
    },
  };

  return (
    // Matches the responsive height wrapper of the Bar Chart
    <div className="relative w-full h-[250px] md:h-[350px] flex items-center justify-center">
      <Doughnut options={options} data={data} />
    </div>
  );
}