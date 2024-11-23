import React, { useState, useEffect } from "react";
import T from "../assets/letter-t.svg";
import {
  LayoutDashboard,
  CircleUserRound,
  ArrowRightLeft,
  LogOut,
  MoveRight,
  MoveLeft,
} from "lucide-react";
import { motion } from "framer-motion";

const navLinks = [
  { id: 1, title: "Dashboard", icon: LayoutDashboard, path: "/Dashboard" },
  { id: 2, title: "Account", icon: CircleUserRound, path: "Account" },
  { id: 3, title: "Transactions", icon: ArrowRightLeft, path: "/TransactionBar" },
  { id: 4, title: "Log Out", icon: LogOut }, // No path for log out
];

const variants = {
  expanded: { width: "250px" },
  nonExpanded: { width: "80px" },
};

function Sidebar({ onSectionChange }) {
  const [activeNavBar, setActiveNavBar] = useState(1);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const currentNav = navLinks.find((link) => link.path === window.location.pathname);
    if (currentNav) {
      setActiveNavBar(currentNav.id);
    }
  }, [window.location.pathname]);

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    localStorage.clear(); // Example: Clear local storage or session
    alert("You have been logged out."); // Show confirmation (optional)
    // Optionally, redirect to a login page
    window.location.href = "/login"; // Replace "/login" with your login page route
  };

  const handleNavClick = (item) => {
    if (item.title === "Log Out") {
      handleLogout(); // Call the logout function
    } else {
      setActiveNavBar(item.id);
      onSectionChange(item.title);
    }
  };

  return (
    <motion.div
      animate={isExpanded ? "expanded" : "nonExpanded"}
      variants={variants}
      className="bg-gray-800 text-white shadow-md flex flex-col relative transition-all"
    >
      {/* Logo Section */}
      <div className="flex items-center space-x-3 px-5 py-6">
        <img
          src={T}
          alt="Logo"
          className="w-10 h-10 bg-rose-500 p-2 rounded-full"
        />
        {isExpanded && <h1 className="text-xl font-bold tracking-wide">Tracker</h1>}
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-8 -right-3 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition"
      >
        {isExpanded ? <MoveLeft size={10} /> : <MoveRight size={10} />}
      </button>

      {/* Navigation Links */}
      <div className="mt-10 space-y-4 px-4">
        {navLinks.map((item) => (
          <div
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`flex items-center space-x-3 p-3 rounded-md transition-all cursor-pointer ${
              activeNavBar === item.id
                ? "bg-red-500 text-white"
                : "hover:bg-gray-700 text-gray-300"
            }`}
          >
            <item.icon size={24} />
            {isExpanded && <span className="text-sm font-medium">{item.title}</span>}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default Sidebar;
