import Sidebar from "../Components/Sidebar";
import { Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;