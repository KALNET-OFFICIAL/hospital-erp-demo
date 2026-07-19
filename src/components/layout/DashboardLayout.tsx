import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { QuickActions } from "./QuickActions";
import { useAuthStore, useSidebarStore } from "@/stores";
import { getSidebarWidth } from "@/lib/layout";

export function DashboardLayout() {
  const { isAuthenticated } = useAuthStore();
  const { isCollapsed } = useSidebarStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <Topbar />
      <main
        className="min-h-screen pt-16 transition-all duration-300"
        style={{ marginLeft: getSidebarWidth(isCollapsed) }}
      >
        <div className="mx-auto w-full max-w-[1600px] px-6 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
      {/* Floating Quick Actions */}
      <div className="fixed bottom-6 right-6 z-50">
        <QuickActions />
      </div>
    </div>
  );
}
