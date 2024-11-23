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
        callback: (value) => `Rp. ${value / 1_000_000}M`, // Show millions
      },
      grid: {
        color: "#E5E7EB", // Tailwind gray-200
      },
    },
  },
};

const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function generateRandomData() {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10_000_000) + 10_000_000);
}

export default function BarChartComponent() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);

  useEffect(() => {
    setExpenses(generateRandomData());
    setIncome(generateRandomData());
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: "Expenses",
        data: expenses,
        backgroundColor: "rgba(239, 68, 68, 0.8)", // Tailwind red-500
        borderRadius: 5, // Rounded bars
      },
      {
        label: "Income",
        data: income,
        backgroundColor: "rgba(14, 165, 233, 0.8)", // Tailwind sky-500
        borderRadius: 5,
      },
    ],
  };

  return <Bar options={options} data={data} />;
}
