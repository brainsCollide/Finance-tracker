import React, { useState } from 'react';
import T from '../assets/letter-t.svg';
import {
    LayoutDashboard,
    BarChart4,
    Activity,
    CircleUserRound,
    ArrowRightLeft,
    LogOut,
    MoveRight,
    MoveLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

const navLinks = [
    {
        id: 1,
        title: 'Dashboard',
        icon: LayoutDashboard,
    },
    {
        id: 2,
        title: 'Account',
        icon: CircleUserRound,
    },
    {
        id: 3,
        title: 'Activity',
        icon: Activity,
    },
    {
        id: 4,
        title: 'Analytics',
        icon: BarChart4,
    },
    {
        id: 5,
        title: 'Transactions',
        icon: ArrowRightLeft,
    },
    {
        id: 6,
        title: 'Log Out',
        icon: LogOut,
    }
];

const variants = {
    expanded: { width: '20%' },
    nonExpanded: { width: '9%' }
};

const iconVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
};

function Sidebar() {
    const [activeNavBar, setActiveNavBar] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <motion.div
            animate={isExpanded ? 'expanded' : 'nonExpanded'}
            variants={variants}
            className='flex flex-col border border-r-3 relative'
        >
            <div className='logo-div flex space-x-3 items-center relative px-12 py-11'>
                <img
                    className='bg-red-500'
                    src={T}
                    alt='letter t'
                    width={30}
                />
                {isExpanded && <span className='font-noto-sans text-xl'>Tracker</span>}
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={iconVariants}
                transition={{ duration: 0.5 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className='w-5 h-5 bg-[#FF8C8C] rounded-full absolute -right-[10.5px] top-12 flex items-center justify-center cursor-pointer'
            >
                {isExpanded ? <MoveLeft color="#ffffff" size={16} strokeWidth={3} /> : <MoveRight color="#ffffff" size={16} strokeWidth={3} />}
            </motion.div>

            <div className='mt-20 flex flex-col justify-center font-noto-sans font-normal space-y-10 text-md px-12'>
                {navLinks.map((item) => (
                    <div
                        key={item.id}
                        className={`flex items-center p-2 cursor-pointer transition duration-300 rounded ${
                            activeNavBar === item.id ? 'bg-[#FF8C8C] text-white' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setActiveNavBar(item.id)}
                    >
                        <item.icon size={24} />
                        {isExpanded && <span className='ml-5'>{item.title}</span>}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

export default Sidebar;
