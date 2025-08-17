import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import T from "../assets/letter-t.svg";
import {
  LayoutDashboard,
  CircleUserRound,
  ArrowRightLeft,
  MoveRight,
  MoveLeft,
  Menu,
  X,
  TrendingUp,
  Tag,
  Repeat,
  Award,
  DownloadCloud,
  Settings
} from "lucide-react";


const navLinks = [
  { id: 1, title: "Dashboard", icon: LayoutDashboard, path: "/Dashboard" },
  { id: 2, title: "Account", icon: CircleUserRound, path: "/Account" },
  { id: 3, title: "Transactions", icon: ArrowRightLeft, path: "/TransactionBar" },
  { id: 4, title: "Budgets", icon: TrendingUp, path: "/budgets" },
  { id: 6, title: "Recurring", icon: Repeat, path: "/recurring" },
  { id: 7, title: "Goals", icon: Award, path: "/Goals" },
  { id: 8, title: "Export", icon: DownloadCloud, path: "/export" },
];


function Sidebar({ onSectionChange }) {
  const [activeNavBar, setActiveNavBar] = useState(1);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // Detect mobile on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update active nav based on URL
  useEffect(() => {
    const currentNav = navLinks.find((link) => link.path === window.location.pathname);
    if (currentNav) setActiveNavBar(currentNav.id);
  }, []);

  const handleNavClick = (item) => {
    setActiveNavBar(item.id);
    onSectionChange(item.title);
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-md"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} className="text-white" />
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{
              x: isMobile ? "-100%" : 0,
              width: isMobile ? 0 : 80,
              opacity: 0
            }}
            animate={{
              x: 0,
              width: isMobile ? "75%" : isExpanded ? 256 : 80,
              opacity: 1
            }}
            exit={{
              x: isMobile ? "-100%" : 0,
              width: isMobile ? 0 : 80,
              opacity: 0
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed md:relative bg-gray-800 text-white flex flex-col shadow-lg z-50"
            style={{ minHeight: "100vh" }}
          >
            {/* Close Button Mobile */}
            {isMobile && (
              <button
                className="absolute top-4 right-4 p-2"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={24} className="text-white" />
              </button>
            )}

            {/* Logo Section (always left-aligned) */}
            <div className="flex items-center px-5 py-6 justify-start space-x-4">
              <img
                src={T}
                alt="Logo"
                className="w-10 h-10 bg-rose-500 p-2 rounded-full"
              />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    key="logo-text"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-xl font-bold tracking-wide select-none"
                  >
                    Tracker
                  </motion.span>
                  
                )}
              </AnimatePresence>
              
            </div>

            {/* Collapse/Expand Button Desktop */}
            {!isMobile && (
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute top-8 -right-3 w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isExpanded ? <MoveLeft size={16} /> : <MoveRight size={16} />}
              </motion.button>
            )}

            {/* Navigation Links */}
            <div className="mt-10 space-y-2 px-3">
              {navLinks.map((item) => (
                <motion.div
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center px-4 py-3 rounded-md cursor-pointer transition-colors duration-200 ${
                    activeNavBar === item.id
                      ? "bg-[#2563EB] text-white"
                      : "hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  <item.icon size={24} className="flex-shrink-0" />
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isExpanded ? 1 : 0,
                      marginLeft: isExpanded ? 16 : 0
                    }}
                    transition={{
                      opacity: { duration: 0.15, ease: "linear" },
                      marginLeft: { duration: 0.3, ease: "easeInOut" }
                    }}
                    className={`${!isExpanded && "pointer-events-none"} overflow-hidden whitespace-nowrap`}
                  >
                    {isExpanded && item.title}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop Mobile */}
      {isMobile && isSidebarOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 bg-black"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
