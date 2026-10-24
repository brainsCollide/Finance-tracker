import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("loading"); // loading | authed | guest
  const [user, setUser] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axiosInstance.get("/auth/current", { withCredentials: true });
        setUser(res.data.user);
        setStatus("authed");
      } catch {
        setStatus("guest");
      }
    };
    check();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "guest") return <Navigate to="/login" replace />;

  return <Outlet context={{ user }} />;
}