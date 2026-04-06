import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  Plus,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Command,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore, useNotificationStore, useSidebarStore, useThemeStore } from "@/stores";
import { formatDate } from "@/lib/utils";
import { patients, staff, invoices, medicines } from "@/lib/mock-data";

interface SearchResult {
  id: string;
  label: string;
  meta: string;
  href: string;
  type: "patient" | "doctor" | "invoice" | "medicine";
}

export function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { isCollapsed, toggle } = useSidebarStore();
  const { theme, setTheme } = useThemeStore();

  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const quickAddOptions = [
    { label: "New Patient", href: "/patients/new" },
    { label: "New Appointment", href: "/appointments/new" },
    { label: "New Invoice", href: "/billing/new" },
  ];

  const roleNotifications = useMemo(() => {
    if (!user) {
      return notifications;
    }
    return notifications.filter((notification) => {
      const matchesRole =
        !notification.recipientRoles || notification.recipientRoles.includes(user.role);
      const matchesUser =
        !notification.recipientUserIds || notification.recipientUserIds.includes(user.id);
      return matchesRole && matchesUser;
    });
  }, [notifications, user]);

  const unreadCount = roleNotifications.filter((notification) => !notification.read).length;

  const searchIndex: SearchResult[] = useMemo(() => {
    const patientResults = patients.map((patient) => ({
      id: patient.id,
      label: patient.name,
      meta: `${patient.id} • ${patient.phone}`,
      href: `/patients/${patient.id}`,
      type: "patient" as const,
    }));

    const doctorResults = staff
      .filter((member) => member.role === "doctor")
      .map((doctor) => ({
        id: doctor.id,
        label: doctor.name,
        meta: `${doctor.department} • ${doctor.specialization ?? "Doctor"}`,
        href: "/staff",
        type: "doctor" as const,
      }));

    const invoiceResults = invoices.map((invoice) => ({
      id: invoice.id,
      label: invoice.id,
      meta: `${invoice.patientName} • ${invoice.paymentStatus}`,
      href: "/billing",
      type: "invoice" as const,
    }));

    const medicineResults = medicines.map((medicine) => ({
      id: medicine.id,
      label: medicine.name,
      meta: `${medicine.genericName} • Stock ${medicine.stock}`,
      href: "/pharmacy",
      type: "medicine" as const,
    }));

    return [...patientResults, ...doctorResults, ...invoiceResults, ...medicineResults];
  }, []);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return [];
    }
    return searchIndex
      .filter(
        (entry) =>
          entry.label.toLowerCase().includes(query) ||
          entry.meta.toLowerCase().includes(query) ||
          entry.id.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [searchIndex, searchQuery]);

  useEffect(() => {
    const handleGlobalSearchShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowSearch(true);
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleGlobalSearchShortcut);
    return () => document.removeEventListener("keydown", handleGlobalSearchShortcut);
  }, []);

  const handleSearchSelect = (result: SearchResult) => {
    navigate(result.href);
    setSearchQuery("");
    setShowSearch(false);
  };

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center justify-between px-6 transition-all duration-300 border-b",
        isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200",
        isCollapsed ? "left-[80px]" : "left-[256px]"
      )}
    >
      {/* Search */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={toggle} className={isDark ? "text-slate-300" : "text-slate-700"}>
          <Menu size={20} />
        </Button>
        <div className="relative hidden md:block">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search patients, doctors, invoices..."
            className={cn(
              "h-10 w-[360px] rounded-xl pl-10 lg:w-[430px]",
              isDark ? "border-slate-600 bg-slate-800 text-slate-200" : "border-slate-300 bg-slate-50"
            )}
            icon={<Search size={18} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
          />
          {showSearch && searchResults.length > 0 && (
            <div className={cn(
              "absolute top-full left-0 mt-2 w-full rounded-lg border shadow-lg",
              isDark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200"
            )}>
              {searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSearchSelect(result)}
                  className={cn(
                    "block w-full border-b px-4 py-3 text-left last:border-b-0",
                    isDark ? "border-slate-700 hover:bg-slate-700" : "border-slate-100 hover:bg-slate-50"
                  )}
                >
                  <p className={cn("text-sm font-medium", isDark ? "text-slate-200" : "text-slate-900")}>{result.label}</p>
                  <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                    {result.type.toUpperCase()} • {result.meta}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={cn(
          "hidden items-center gap-1 rounded-lg border px-2 py-1 text-xs xl:flex",
          isDark ? "border-slate-600 text-slate-400" : "border-slate-300 text-slate-500"
        )}>
          <Command size={12} />
          <span>Ctrl + K</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-700"
          onClick={toggleDarkMode}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-slate-700"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger-500 text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </Button>
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {roleNotifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        "flex cursor-pointer gap-3 border-b border-slate-100 px-4 py-3 hover:bg-slate-50",
                        !notification.read && "bg-primary-50/50"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-1 h-2 w-2 shrink-0 rounded-full",
                          notification.type === "error" && "bg-danger-500",
                          notification.type === "warning" && "bg-warning-500",
                          notification.type === "success" && "bg-success-500",
                          notification.type === "info" && "bg-primary-500"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full border-t border-slate-200 py-3 text-center text-sm text-primary-600 hover:bg-slate-50">
                  View all notifications
                </button>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
          >
            <Avatar name={user?.name} size="sm" />
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {showProfile && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfile(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <div className="border-b border-slate-200 px-4 py-3">
                  <p className="font-medium text-slate-900">{user?.name}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                </div>
                <div className="border-t border-slate-200 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-slate-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Click outside to close search */}
      {showSearch && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setShowSearch(false);
            setSearchQuery("");
          }}
        />
      )}
    </header>
  );
}
