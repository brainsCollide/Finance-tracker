import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,  // Required for doughnut charts
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,  // Register the ArcElement for Doughnut/Pie charts
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Income vs Expenses (Doughnut Chart)',
    },
  },
};

function generateRandomData () {
  return Array.from({ length: 2 }, () => Math.floor(Math.random() * 10000000) + 10000000);
}

export default function DoughnutChartComponent() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);

  useEffect(() => {
    // Generate or fetch the data once when the component mounts
    setExpenses(generateRandomData());
    setIncome(generateRandomData());
  }, []);

  const data = {
    labels: ['Expenses', 'Income'],
    datasets: [
      {
        label: 'Amount',
        data: [expenses[0], income[1]],  // Assuming first element is expenses, second is income
        backgroundColor: ['rgb(14, 165, 233)', 'rgb(239, 68, 68)'],  // Colors for each section
        hoverBackgroundColor: ['rgb(0, 0, 128)', 'rgb(0, 0, 128)'],
      },
    ],
  };

  return <Doughnut options={options} data={data} />;
}
