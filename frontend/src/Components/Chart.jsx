import React, {useEffect, useState} from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  tension: 0.3,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
    },
  },
};

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sept','Oct','Nov','Dec'];

function generateRandomData () {
  return Array.from({ length: 12}, () => Math.floor(Math.random() * 10000000) + 10000000);
}

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);

  useEffect(() => {
    // Generate or fetch the data once when the component mounts
    setExpenses(generateRandomData());
    setIncome(generateRandomData());
  }, []); // Empty dependency array ensures this runs once after the component mounts

  const data = {
    labels,
    datasets: [
      {
        label: 'Expenses',
        data: expenses,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Income',
        data: income,
        borderColor: 'rgb(0, 0, 128)',
        backgroundColor: 'rgba(0, 0, 128, 0.5)',
      },
    ],
  };

  return <Line options={options} data={data} />;
}