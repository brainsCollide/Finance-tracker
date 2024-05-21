import Chart from './Chart';

export default function Dashboard() {
  return (

    <div className='flex flex-col space-y-10 pt-11 px-10'>
        <h2 className='text-xl font-medium'>Dashboard</h2>
        <div className='flex space-x-8'>
            <div className='w-2/5 h-[120px] shadow-lg shadow-gray-500 hover:shadow-none duration-500 border border-gray-300 rounded flex flex-col justify-center p-4'>
                <span>User Name 1</span>
                <span className='text-gray-400'>Your Balance is: 200.000.000</span>
            </div>
            <div className='w-2/5 h-[120px] shadow-lg shadow-gray-500 hover:shadow-none duration-500 border border-gray-300 rounded flex flex-col justify-center p-4'>
                <span>User Name 1</span>
                <span className='text-gray-400'>Your Expenses is: 70.000.000</span>
            </div>
        </div>
        <div className='flex space-x-8 w-4/5 flex-col'>
            <h2 className='font-medium'> Chart Expenses</h2>
            <Chart/>
        </div>
        <div className='flex space-x-8'>
            <div className='w-2/5 h-[120px] shadow-lg shadow-gray-500 hover:shadow-none duration-500 border border-gray-300 rounded flex flex-col justify-center p-4'>
                <span>Your Activity</span>
                <span className='text-gray-400'>Yoou sent Rp,1.000.000 to your mother</span>
            </div>
            <div className='w-2/5 h-[120px] shadow-lg shadow-gray-500 hover:shadow-none duration-500 border border-gray-300 rounded flex flex-col justify-center p-4'>
                <span>Upcoming Bills</span>
                <ol 
                style={{ listStyleType: 'decimal'}}
                className='px-4 py-2'
                >
                    <li>Gas</li>
                    <li>Water</li>
                </ol>
            </div>
        </div>
    </div>
  )
}
