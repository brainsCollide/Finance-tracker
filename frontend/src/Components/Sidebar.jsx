import React, { useState, useEffect } from 'react';
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
        path: '/Dashboard'    
    },
    {
        id: 2,
        title: 'Account',
        icon: CircleUserRound,
        path: 'Account'
    },
    {
        id: 3,
        title: 'Activity',
        icon: Activity,
        path: '/Activity'
    },
    {
        id: 4,
        title: 'Analytics',
        icon: BarChart4,
        path:'/Analytics'
    },
    {
        id: 5,
        title: 'Transactions',
        icon: ArrowRightLeft,
        path: '/TransactionBar'
    },
    {
        id: 6,
        title: 'Log Out',
        icon: LogOut,
        path: '/LogOut'
    }
];

const variants = {
    expanded: { width: '19%' },
    nonExpanded: { width: '10%' }
};

const iconVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
};

function Sidebar({ onSectionChange }) {
    const [activeNavBar, setActiveNavBar] = useState(1);
    const location = window.location.pathname;
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        const currentNav = navLinks.find((link) => link.path === window.location.pathname);
        if (currentNav) {
            setActiveNavBar(currentNav.id);
        }
    }, [window.location.pathname]);

    const handleNavClick = (item) => {
        setActiveNavBar(item.id);
        onSectionChange(item.title);
    }
 
    return (
        <motion.div
            animate={isExpanded ? 'expanded' : 'nonExpanded'}
            variants={variants}
            className='flex flex-col border border-r-3 relative'
        >
            <div className='logo-div flex space-x-3 items-center relative px-12 py-11'>
                <img
                    className='bg-rose-500 border rounded-lg'
                    src={T}
                    alt='letter t'
                    width={40}
                />
                {isExpanded && <span className='font-noto-sans text-xl'>Tracker</span>}
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={iconVariants}
                transition={{ duration: 0.5 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className='w-10 h-10 bg-[#FF8C8C] rounded-full absolute -right-5 top-11 flex items-center justify-center cursor-pointer'
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
                        onClick={() => handleNavClick(item)}
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
