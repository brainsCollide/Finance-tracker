import React, { useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useBalanceStore } from "../stores/balance.store";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChartComponent() {
  const transactions = useBalanceStore((state) => state.transactions);
  const fetchTransactions = useBalanceStore(
    (state) => state.fetchTransactions
  );

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

  const data = {
    labels: Object.keys(categoryMap),
    datasets: [
      {
        data: Object.values(categoryMap),
        // Modern solid Tailwind hex colors (Blue, Emerald, Amber, Violet, Pink, Teal, Rose, Slate)
        backgroundColor: [
          "#3B82F6", 
          "#10B981", 
          "#F59E0B", 
          "#8B5CF6", 
          "#EC4899", 
          "#14B8A6", 
          "#F43F5E", 
          "#64748B", 
        ],
        borderWidth: 0, // Removes the harsh white borders
        hoverOffset: 6, // Makes the hovered segment pop out slightly
        spacing: 2, // Adds a highly modern tiny gap between segments
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
          label: (context) => ` Rp. ${context.raw.toLocaleString("id-ID")}`,
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