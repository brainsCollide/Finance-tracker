import { useState, useEffect } from 'react';
import BarChart from './BarChart';
import DoughnutChart from './DoughnutChart';
import axios from 'axios';
import { IoMdWallet, IoMdPerson, IoMdBasket } from "react-icons/io";




const UserCard = ({ title, content, greet }) => (
    <div className='w-2/5 h-[120px] bg-rose-600 hover:shadow-md hover:shadow-red-300 duration-500 border border-gray-300 rounded-md flex flex-col justify-center p-4'>
    <div className='flex flex-col justify-center space-y-1 text-white'>
        <IoMdPerson size={30} color='white' />
        <span className='text-xl font-semibold'>{content}</span>
        <span className='text-sm font-light'>{greet}</span>
    </div>
</div>
);

const BalanceCard = ({ balance }) => (
    <div className='w-2/5 h-[120px] bg-sky-500 hover:shadow-md hover:shadow-red-300 duration-500 border border-gray-300 rounded-md flex flex-col justify-center p-4'>
        <div className='flex flex-col justify-center space-y-1 text-white'>
            <IoMdWallet size={30} color='white' />
            <span className='text-xl font-semibold'>Rp. {balance.toLocaleString('de-DE')}</span>
            <span className='text-sm font-light'>Balance</span>
        </div>
    </div>
);

const ExpenseCard = ({ expense }) => (
    <div className='w-2/5 h-[120px] bg-emerald-500 hover:shadow-md hover:shadow-red-300 duration-500 border border-gray-300 rounded-md flex flex-col justify-center p-4'>
        <div className='flex flex-col text-white'>
            <IoMdBasket size={30} color='white' />
            <span className='text-xl font-semibold'>Rp. {expense.toLocaleString('de-DE')}</span>
            <span className='text-sm font-light'>Your Expense is:</span>  
        </div>
    </div>
);

const TransactionCard = ({ expense, income }) => (
    <div className='w-2/5 h-[120px] bg-emerald-500 hover:shadow-md hover:shadow-red-300 duration-500 border border-gray-300 rounded-md flex flex-col justify-center p-4'>
        <div className='flex flex-col text-white'>
            <span className='text-sm font-light'>Latest Expense:</span>  
            <span className='text-xl font-semibold'>Rp. {expense.toLocaleString('de-DE')}</span>
            <span className='text-sm font-light'>Latest Income:</span>  
            <span className='text-xl font-semibold'>Rp. {income.toLocaleString('de-DE')}</span>
        </div>
    </div>
);


export default function Dashboard() {
    const [transactions, setTransactions] = useState();
    const [latestTransaction, setLatestTransaction] = useState(null); // Added state for latestTransaction


    const fetchTransactions = async () => {
        try {
            const response = await axiosInstance.get('/transactions');
            const allTransactions = response.data;
            
            // Sort transactions by createdAt and get the latest one
            const latestTransaction = allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            
            setTransactions(allTransactions); // If you want to display all transactions
            setLatestTransaction(latestTransaction); // Set the latest transaction
        } catch (error) {
            console.log('Error fetching data', error);
        }
    };

    useEffect(() => {
        fetchTransactions(); // Call fetchTransactions on mount
    }, []);

    const user = [
        {
            name: 'John Doe',
            id: 1,
            balance: 200000000,
            expense: 1000000
        }
        
    ]

    return (
        <div className='flex-1 flex-col h-screen space-y-10 pt-11 pb-10 px-6 bg-slate-200'>
            <div className='flex space-x-4'>
                {user.map(item => (
                    <UserCard key={item.id} title="Welcome back," content={item.name}  greet="Anything i can help?"/>
                ))}
                {user.map(item => (
                    <BalanceCard key={item.id} name={item.name} balance={item.balance} />
                ))}
                {user.map(item => (
                    <ExpenseCard key={item.id} expense={item.expense} />
                ))}
                {user.map(item => (
                    <ExpenseCard key={item.id} expense={item.expense} />
                ))}
            </div>
            <div className='flex justify-between'>
                <div className='w-8/12 bg-white rounded-md p-5'>
                    <h2 className='font-medium'>Yearly Summary</h2>
                    <BarChart/>
                </div>
                <div className='w-3/8 bg-white rounded-md p-5 justify-center'>
                    <h2 className='font-medium'>Total Report</h2>
                    <DoughnutChart/>
                </div>
            </div>
            <div>
            {latestTransaction ? (
                <TransactionCard 
                    expense={latestTransaction.expense}
                    income={latestTransaction.income} 
                />
            ) : (
                <p>Loading...</p>
            )}
        </div>
        </div>
    );
}
