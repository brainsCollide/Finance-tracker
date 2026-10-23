
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import WelcomePage from "./Components/WelcomePage";
import AppLayout from "./layout/AppLayout";

import Dashboard from "./Components/Dashboard";
import TransactionBar from "./Components/TransactionBar";
import ProfileBoard from "./Components/ProfileBoard";
import Goals from "./Components/Goals";
import Budgets from "./Components/Budgets";
import Export from "./Components/Export";
import Recurring from "./Components/Recurring";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<WelcomePage />} />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />
      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      {/* Redirect */}
      <Route
        path="/app"
        element={<Navigate to="/app/dashboard" replace />}
      />

      {/* Application layout */}
      <Route path="/app" element={<AppLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<TransactionBar />} />
        <Route path="account" element={<ProfileBoard />} />
        <Route path="goals" element={<Goals />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="export" element={<Export />} />
        <Route path="recurring" element={<Recurring />} />
      </Route>
    </Routes>
  );
}
