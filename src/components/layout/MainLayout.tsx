import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Sidebar, MobileNav } from "./Navigation";

export const MainLayout = () => {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main className="flex-1 flex flex-col pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto w-full px-4 py-6 lg:px-8 lg:py-10">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
