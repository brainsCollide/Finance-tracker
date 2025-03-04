import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useBalanceStore } from "../stores/balance.store";

ChartJS.register(ArcElement, Tooltip, Legend);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#4B5563",
        font: { size: 20 },
      },
    },
    title: {
      display: true,
      text: "Income vs Expenses",
      color: "#1F2937",
      font: { size: 18, weight: "bold" },
    },
    tooltip: {
      callbacks: {
        label: (context) => `Rp. ${context.raw.toLocaleString("id-ID")}`,
      },
    },
  },
};

export default function DoughnutChartComponent() {
  const expenses = useBalanceStore((state) => state.expenses);
  const income = useBalanceStore((state) => state.income);

  const data = {
    labels: ["Expenses", "Income"],
    datasets: [
      {
        label: "Amount",
        data: [expenses, income],
        backgroundColor: ["rgba(239, 68, 68, 0.9)", "rgba(22, 163, 74, 0.9)"], // ✅ Red for expenses, Green for income
        hoverBackgroundColor: ["rgba(239, 68, 68, 1)", "rgba(34, 197, 94, 1)"],
        borderWidth: 2,
      },
    ],
  };

  return <Doughnut options={options} data={data} />;  
}