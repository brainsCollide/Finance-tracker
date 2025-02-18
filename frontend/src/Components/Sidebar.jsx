import React, { useState, useEffect } from "react";
import T from "../assets/letter-t.svg";
import {
  LayoutDashboard,
  CircleUserRound,
  ArrowRightLeft,
  MoveRight,
  MoveLeft,
} from "lucide-react";

const navLinks = [
  { id: 1, title: "Dashboard", icon: LayoutDashboard, path: "/Dashboard" },
  { id: 2, title: "Account", icon: CircleUserRound, path: "/Account" },
  { id: 3, title: "Transactions", icon: ArrowRightLeft, path: "/TransactionBar" }
];

function Sidebar({ onSectionChange }) {
  const [activeNavBar, setActiveNavBar] = useState(1);``
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const currentNav = navLinks.find((link) => link.path === window.location.pathname);
    if (currentNav) {
      setActiveNavBar(currentNav.id);
    }
  }, []);

  const handleNavClick = (item) => {
    setActiveNavBar(item.id);
    onSectionChange(item.title);
  };

  return (
    <div
      className={`bg-gray-800 text-white flex flex-col relative transition-all duration-300 ease-in-out ${
        isExpanded ? "w-64" : "w-20"
      }`}
      style={{ minHeight: "100vh" }}
    >
      {/* Logo Section */}
      <div
        className={`flex items-center px-5 py-6 ${
          isExpanded ? "justify-start space-x-4" : "justify-center"
        } transition-all duration-300`}
      >
        <img
          src={T}
          alt="Logo"
          className="w-10 h-10 bg-rose-500 p-2 rounded-full"
        />
        {isExpanded && (
          <span className="text-xl font-bold tracking-wide transition-opacity duration-300 ease-in-out">
            Tracker
          </span>
        )}
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-8 -right-3 w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-all"
      >
        {isExpanded ? <MoveLeft size={16} /> : <MoveRight size={16} />}
      </button>

      {/* Navigation Links */}
      <div className="mt-10 space-y-2 px-2">
        {navLinks.map((item) => (
          <div
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`flex items-center ${
              isExpanded ? "justify-start space-x-4 px-4" : "justify-center"
            } py-3 rounded-md transition-all duration-300 cursor-pointer ${
              activeNavBar === item.id
                ? "bg-red-500 text-white"
                : "hover:bg-gray-700 text-gray-300"
            }`}
          >
            <item.icon size={24} />
            {isExpanded && (
              <span className="text-sm font-medium transition-opacity duration-300 ease-in-out">
                {item.title}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
