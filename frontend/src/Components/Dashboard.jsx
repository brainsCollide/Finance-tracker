import React, { useState } from 'react';
import AddTransaction from './Widgets/AddTransaction';
import Modal from './Widgets/Modal';
import BarChart from './BarChart';
import DoughnutChart from './DoughnutChart';
import UpcomingBills from './Widgets/UpcomingBills';
import { IoMdWallet, IoMdPerson, IoMdBasket } from "react-icons/io";

const Card = ({ title, icon: Icon, value, description, bgColor }) => (
    <div className={`flex flex-col items-start p-5 rounded-lg shadow-md ${bgColor}`}>
        <div className="flex items-center space-x-4">
            <Icon size={32} className="text-white" />
            <h3 className="text-white text-lg font-semibold">{title}</h3>
        </div>
        <div className="mt-3">
            <h4 className="text-white text-2xl font-bold">{value}</h4>
            {description && <p className="text-white text-sm">{description}</p>}
        </div>
    </div>
);

export default function Dashboard() {
    const user = { name: 'John Doe', balance: 200000000, expense: 1000000 };
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
                    Welcome back, {user.name} 👋
                </h1>
                <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 w-full sm:w-auto"
                    onClick={() => setIsModalOpen(true)}
                >
                    Add Transaction
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 sm:mb-8">
                <Card
                    title="Balance"
                    icon={IoMdWallet}
                    value={`Rp. ${user.balance.toLocaleString('de-DE')}`}
                    bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <Card
                    title="Expenses"
                    icon={IoMdBasket}
                    value={`Rp. ${user.expense.toLocaleString('de-DE')}`}
                    bgColor="bg-gradient-to-r from-green-500 to-green-600"
                />
                <Card
                    title="Total Savings"
                    icon={IoMdPerson}
                    value={`Rp. ${(user.balance - user.expense).toLocaleString('de-DE')}`}
                    bgColor="bg-gradient-to-r from-purple-500 to-purple-600"
                />
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 sm:mb-8">
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg sm:text-xl font-medium mb-4">Yearly Summary</h2>
                    <BarChart />
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg sm:text-xl font-medium mb-4">Total Report</h2>
                    <DoughnutChart />
                </div>
            </div>

            {/* Upcoming Bills Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <UpcomingBills />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
                <AddTransaction />
            </Modal>
        </div>
    );
}
