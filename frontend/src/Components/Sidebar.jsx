import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import T from "../assets/letter-t.svg";
import { useAuthStore } from "../stores/auth.store";

import {
  LayoutDashboard,
  CircleUserRound,
  ArrowRightLeft,
  Menu,
  X,
  TrendingUp,
  Repeat,
  Award,
  DownloadCloud,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

const navLinks = [
  { id: 1, title: "Dashboard", icon: LayoutDashboard, path: "/app/dashboard" },
  { id: 2, title: "Account", icon: CircleUserRound, path: "/app/account" },
  { id: 3, title: "Transactions", icon: ArrowRightLeft, path: "/app/transactions" },
  { id: 4, title: "Budgets", icon: TrendingUp, path: "/app/budgets" },
  { id: 6, title: "Recurring", icon: Repeat, path: "/app/recurring" },
  { id: 7, title: "Goals", icon: Award, path: "/app/goals" },
  { id: 8, title: "Export", icon: DownloadCloud, path: "/app/export" },
];

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();

  const { user, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post(
        "/auth/logout",
        {},
        { withCredentials: true }
      );

      window.location.href = "/";
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          className="fixed top-5 left-5 z-[60] bg-white p-3 rounded-2xl shadow-lg border border-slate-100"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={20} className="text-slate-600" />
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{
              x: isMobile ? "-100%" : 0,
              width: isExpanded ? 280 : 88,
            }}
            animate={{
              x: 0,
              width: isMobile ? "80%" : isExpanded ? 280 : 88,
            }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 100,
            }}
            className="fixed md:sticky top-0 left-0 h-screen bg-[#0F172A] text-slate-300 flex flex-col z-[70] border-r border-slate-800 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center h-24 px-6 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <img src={T} alt="Logo" className="w-6 h-6 invert" />
                </div>

                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xl font-black text-white cursor-pointer"
                    onClick={() => navigate("/")}
                  >
                    Tracker<span className="text-blue-500">.</span>
                  </motion.span>
                )}
              </div>

              {!isMobile && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="absolute -right-3 top-10 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-[#0F172A]"
                >
                  {isExpanded ? (
                    <ChevronLeft size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              )}

              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="ml-auto text-slate-400"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              <p
                className={`text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mb-4 ${
                  !isExpanded && "opacity-0"
                }`}
              >
                Main Menu
              </p>

              {navLinks.map((item) => (
                <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/app"}   // 👈 INI PENTING
                onClick={() => {
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={({ isActive }) =>
                  `group relative flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-100"
                  }`
                }
              >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={22}
                        className={`shrink-0 ${
                          isActive
                            ? "text-white"
                            : "group-hover:text-blue-400"
                        }`}
                      />

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="ml-4 font-bold text-sm whitespace-nowrap"
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {!isExpanded && isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Bottom Profile */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3 p-3 rounded-2xl">
                <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                  <CircleUserRound size={20} className="text-slate-300" />
                </div>

                {isExpanded && (
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">
                      {user?.username || "Guest User"}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">
                      {user?.email || "Not signed in"}
                    </p>
                  </div>
                )}
              </div>

              {isExpanded && user && (
                <button
                  onClick={handleLogout}
                  className="w-full mt-4 flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl font-bold text-xs uppercase"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop */}
      {isMobile && isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[65]"
        />
      )}
    </>
  );
}

export default Sidebar;