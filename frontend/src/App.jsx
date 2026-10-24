import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import axiosInstance from "./api/axiosInstance";

import WelcomePage from "./Components/WelcomePage";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./Components/ProtectedRoute";

import Dashboard from "./Components/Dashboard";
import TransactionBar from "./Components/TransactionBar";
import ProfileBoard from "./Components/ProfileBoard";
import ProfilePage from "./Components/ProfilePage";
import Goals from "./Components/Goals";
import Budgets from "./Components/Budgets";
import Export from "./Components/Export";
import Recurring from "./Components/Recurring";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";

// Halaman profil user (di dalam app, setelah login)
function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/current", { withCredentials: true });
        setUser(res.data.user);
      } catch {
        navigate("/login", { replace: true });
      }
    };
    loadUser();
  }, [navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ProfilePage
      user={user}
      onLogout={() => navigate("/login", { replace: true })}
    />
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes: full page, tanpa sidebar */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<ProfileBoard />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected routes: wajib login */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<TransactionBar />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="goals" element={<Goals />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="export" element={<Export />} />
          <Route path="recurring" element={<Recurring />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}