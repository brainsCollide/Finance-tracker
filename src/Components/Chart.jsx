import React from 'react';
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

export const data = {
  labels,
  datasets: [
    {
      label: 'Expenses',
      data: [7500000, 4500000, 8000000, 8000000, 9000000, 5700000, 10000000, 6500000, 8500000],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
        label: 'Income',
        data: [15000000, 12000000, 10000000, 12000000, 11000000, 15000000, 12000000, 9000000, 10000000],
        borderColor: 'rgb(0,0,128)',
        backgroundColor: 'rgba(0,0,128, 0.5)',
      },
  ],
};

export default function App() {
  return <Line options={options} data={data} />;
}
