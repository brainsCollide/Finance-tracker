import React from "react";
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
  console.log("✅ Received Monthly Stats in BarChart:", monthlyStats); // ✅ Debugging

  // ✅ Ensure valid data to prevent crashes
  if (!Array.isArray(monthlyStats) || monthlyStats.length === 0) {
    console.warn("⚠️ monthlyStats is empty or not an array!", monthlyStats);
    return <p className="text-red-500">No data available for this year.</p>; // Prevent rendering crash
  }

  // ✅ Define labels for months
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // ✅ Ensure correct values (prevent undefined errors)
  const expenses = monthlyStats.map((entry) => entry.totalExpenses || 0);
  const income = monthlyStats.map((entry) => entry.totalIncome || 0);

  console.log("✅ Updated Expenses:", expenses); // ✅ Debug Expenses
  console.log("✅ Updated Income:", income); // ✅ Debug Income

  // ✅ Define Data
  const data = {
    labels,
    datasets: [
      {
        label: "Expenses",
        data: expenses,
        backgroundColor: "rgba(239, 68, 68, 0.8)", // Tailwind Red-500
        borderRadius: 5,
        barThickness: window.innerWidth < 768 ? 20 : 40, // ✅ Adaptive Bar Width
      },
      {
        label: "Income",
        data: income,
        backgroundColor: "rgba(14, 165, 233, 0.8)", // Tailwind Sky-500
        borderRadius: 5,
        barThickness: window.innerWidth < 768 ? 20 : 40, // ✅ Adaptive Bar Width
      },
    ],
  };

  // ✅ Define Options
  const options = {
    responsive: true,
    maintainAspectRatio: false, // ✅ Allow Dynamic Resizing
    plugins: {
      legend: {
        position: window.innerWidth < 768 ? "bottom" : "top", // ✅ Move legend for better UX
        labels: {
          color: "#4B5563", // Tailwind gray-600
          font: {
            size: window.innerWidth < 768 ? 12 : 14, // ✅ Responsive Font Size
          },
        },
      },
      title: {
        display: true,
        text: "Income vs Expenses",
        color: "#1F2937", // Tailwind gray-800
        font: {
          size: window.innerWidth < 768 ? 14 : 18, // ✅ Adjust for Mobile
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `Rp. ${context.raw.toLocaleString("id-ID")}`, // ✅ Proper Currency Formatting
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#6B7280", // Tailwind gray-500
          font: {
            size: window.innerWidth < 768 ? 10 : 12, // ✅ Responsive Font Size
          },
        },
        grid: {
          display: false, // ✅ Hide Grid for Cleaner Look
        },
      },
      y: {
        ticks: {
          color: "#6B7280",
          font: {
            size: window.innerWidth < 768 ? 10 : 12, // ✅ Responsive Font Size
          },
          callback: (value) => `Rp. ${value.toLocaleString("id-ID")}`,
        },
        grid: {
          color: "#E5E7EB", // Tailwind gray-200
        },
      },
    },
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* ✅ Makes Chart Scrollable in Small Screens */}
      <div className="w-[90vw] sm:w-full" style={{ height: window.innerWidth < 768 ? "250px" : "350px" }}>
        <Bar options={options} data={data} />
      </div>
    </div>
  );
}