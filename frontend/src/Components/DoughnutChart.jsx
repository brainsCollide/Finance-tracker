import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement, // Required for Doughnut charts
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

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
};

function generateRandomData() {
  return Array.from({ length: 2 }, () => Math.floor(Math.random() * 10_000_000) + 10_000_000);
}

export default function DoughnutChartComponent() {
  const [dataValues, setDataValues] = useState([]);

  useEffect(() => {
    setDataValues(generateRandomData());
  }, []);

  const data = {
    labels: ["Expenses", "Income"],
    datasets: [
      {
        label: "Amount",
        data: dataValues,
        backgroundColor: ["rgba(239, 68, 68, 0.8)", "rgba(14, 165, 233, 0.8)"], // Vibrant colors
        hoverBackgroundColor: ["rgba(239, 68, 68, 1)", "rgba(14, 165, 233, 1)"],
        borderWidth: 2,
      },
    ],
  };

  return <Doughnut options={options} data={data} />;
}
