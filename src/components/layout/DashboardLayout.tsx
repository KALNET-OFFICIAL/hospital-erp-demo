import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { QuickActions } from "./QuickActions";
import { useAuthStore, useSidebarStore } from "@/stores";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const { isAuthenticated } = useAuthStore();
  const { isCollapsed } = useSidebarStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          isCollapsed ? "ml-[80px]" : "ml-[256px]"
        )}
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
