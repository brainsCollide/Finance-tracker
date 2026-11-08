import { useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Outlet } from "react-router-dom";
import { useCategoryStore } from "../stores/category.store";

function AppLayout() {
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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