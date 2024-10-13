import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
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
      text: 'Income vs Expenses (Bar Chart)',
    },
  },
};

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sept','Oct','Nov','Dec'];

function generateRandomData () {
  return Array.from({ length: 12}, () => Math.floor(Math.random() * 10000000) + 10000000);
}

export default function BarChartComponent() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);

  useEffect(() => {
    // Generate or fetch the data once when the component mounts
    setExpenses(generateRandomData());
    setIncome(generateRandomData());
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: 'Expenses',
        data: expenses,
        backgroundColor: 'rgb(255, 99, 132)', // Bar color
      },
      {
        label: 'Income',
        data: income,
        backgroundColor: 'rgb(0, 0, 128)', // Bar color
      },
    ],
  };

  return <Bar options={options} data={data} />;
}
