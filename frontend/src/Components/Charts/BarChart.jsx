import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function BarChartComponent({ monthlyStats }) {
  if (!Array.isArray(monthlyStats) || monthlyStats.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        No data available for this year.
      </div>
    );
  }

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Ensure all months have values
  const filledStats = Array.from({ length: 12 }, (_, index) =>
    monthlyStats[index] || { totalExpenses: 0, totalIncome: 0 }
  );

  const expenses = filledStats.map((entry) => entry.totalExpenses || 0);
  const income = filledStats.map((entry) => entry.totalIncome || 0);

  const data = {
    labels,
    datasets: [
      {
        label: "Income",
        data: income,
        backgroundColor: "#10B981", // Modern Emerald Green
        borderRadius: 6, // Rounded pill-like tops
        borderSkipped: false,
        barPercentage: 0.6, // Slimmer bars
        categoryPercentage: 0.8,
      },
      {
        label: "Expenses",
        data: expenses,
        backgroundColor: "#F43F5E", // Modern Rose Red
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false, // Tooltip shows both when hovering over a month
    },
    plugins: {
      legend: {
        position: "top",
        align: "end", // Pushes legend to the right
        labels: {
          usePointStyle: true, // Uses modern circles instead of default boxes
          boxWidth: 8,
          boxHeight: 8,
          color: "#64748B", // Slate-500
          font: { size: 13, family: "Inter, sans-serif" },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "#1E293B", // Dark sleek tooltip
        padding: 12,
        titleFont: { size: 14, family: "Inter, sans-serif", weight: "normal" },
        bodyFont: { size: 13, family: "Inter, sans-serif", weight: "bold" },
        usePointStyle: true,
        callbacks: {
          label: (context) => ` Rp. ${context.raw.toLocaleString("id-ID")}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false }, // Clean X-axis
        ticks: { color: "#94A3B8", font: { family: "Inter, sans-serif" } },
      },
      y: {
        beginAtZero: true,
        border: { display: false }, // Removes the solid Y-axis line
        grid: {
          color: "#F1F5F9", // Very faint grid line
          drawTicks: false,
        },
        ticks: {
          color: "#94A3B8",
          font: { family: "Inter, sans-serif" },
          padding: 10, // Gives breathing room to the labels
          callback: (value) => {
            // Shortens large numbers (e.g., 10,000,000 -> 10M) for a cleaner axis
            if (value >= 1000000) return `Rp. ${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `Rp. ${(value / 1000).toFixed(0)}K`;
            return `Rp. ${value}`;
          },
        },
      },
    },
  };

  return (
    // Tailwind handles the responsive height natively now
    <div className="relative w-full h-[250px] md:h-[350px]">
      <Bar options={options} data={data} />
    </div>
  );
}