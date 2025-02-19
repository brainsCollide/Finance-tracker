import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#4B5563", // Tailwind gray-600
        font: {
          size: 14,
        },
      },
    },
    title: {
      display: true,
      text: "Income vs Expenses",
      color: "#1F2937", // Tailwind gray-800
      font: {
        size: 18,
        weight: "bold",
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          return `Rp. ${context.raw.toLocaleString("id-ID")}`;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#6B7280", // Tailwind gray-500
        font: {
          size: 12,
        },
      },
      grid: {
        display: false,
      },
    },
    y: {
      ticks: {
        color: "#6B7280",
        callback: (value) => `Rp. ${value}M`, // Show millions
      },
      grid: {
        color: "#E5E7EB", // Tailwind gray-200
      },
    },
  },
};

const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function BarChartComponent({ monthlyStats }) {
  console.log("✅ Received Monthly Stats in BarChart:", monthlyStats); // ✅ Debugging

  if (!Array.isArray(monthlyStats)) {
    console.warn("⚠️ monthlyStats is not an array!", monthlyStats);
    return <p className="text-red-500">Error: Monthly Stats is not available.</p>; // Prevent rendering crash
  }

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // ✅ Ensure correct values (prevent undefined errors)
  const expenses = monthlyStats.map((entry) => entry.totalExpenses || 0);
  const income = monthlyStats.map((entry) => entry.totalIncome || 0);

  console.log("✅ Updated Expenses:", expenses); // ✅ Debug Expenses
  console.log("✅ Updated Income:", income); // ✅ Debug Income

  const data = {
    labels,
    datasets: [
      {
        label: "Expenses",
        data: expenses,
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderRadius: 5,
      },
      {
        label: "Income",
        data: income,
        backgroundColor: "rgba(14, 165, 233, 0.8)",
        borderRadius: 5,
      },
    ],
  };

  return <Bar options={options} data={data} />;
}