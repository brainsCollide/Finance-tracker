import React, { useState, useEffect } from "react";
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

export default function BarChartComponent({ monthlyStats }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // ✅ Update width on resize (Prevents errors)
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!Array.isArray(monthlyStats) || monthlyStats.length === 0) {
    return <p className="text-gray-500">No data available for this year.</p>;
  }

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // ✅ Ensure all months have values (Prevents undefined errors)
  const filledStats = Array.from({ length: 12 }, (_, index) =>
    monthlyStats[index] || { totalExpenses: 0, totalIncome: 0 }
  );

  const expenses = filledStats.map((entry) => entry.totalExpenses || 0);
  const income = filledStats.map((entry) => entry.totalIncome || 0);

  const data = {
    labels,
    datasets: [
      {
        label: "Expenses",
        data: expenses,
        backgroundColor: "rgba(239, 68, 68, 0.9)", 
        borderColor: "rgba(239, 68, 68, 1)", 
        borderWidth: 2,
        borderRadius: 5,
        barThickness: "flex", // Let Chart.js adjust it
        categoryPercentage: 0.9, // Reduce width per category
        barPercentage: 1.0, // Ensure bars fit well without overlap
      },
      {
        label: "Income",
        data: income,
        backgroundColor: "rgba(22, 163, 74, 0.9)", 
        borderColor: "rgba(22, 163, 74, 1)", 
        borderWidth: 2,
        borderRadius: 5,
        barThickness: "flex",
        categoryPercentage: 0.9,
        barPercentage: 1.0,
      },
    ],
    
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: windowWidth < 768 ? "bottom" : "top",
        labels: {
          color: "#374151", // Tailwind Gray-700
          font: { size: windowWidth < 768 ? 12 : 14 },
        },
      },
      title: {
        display: true,
        text: "Income vs Expenses",
        color: "#1F2937", // Tailwind Gray-800
        font: { size: windowWidth < 768 ? 14 : 18, weight: "bold" },
      },
      tooltip: {
        callbacks: {
          label: (context) => `Rp. ${context.raw.toLocaleString("id-ID")}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#6B7280", font: { size: windowWidth < 768 ? 10 : 12 } },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "#6B7280",
          font: { size: windowWidth < 768 ? 10 : 12 },
          callback: (value) => `Rp. ${value.toLocaleString("id-ID")}`,
        },
        grid: { color: "#E5E7EB" },
      },
    },
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="w-[90vw] sm:w-full" style={{ height: windowWidth < 768 ? "250px" : "350px" }}>
        <Bar options={options} data={data} />
      </div>
    </div>
  );
}