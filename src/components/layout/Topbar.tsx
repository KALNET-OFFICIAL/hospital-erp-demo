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
import { getSidebarWidth } from "@/lib/layout";
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

  return (
    <header
      className="fixed top-0 right-0 z-30 flex h-16 items-center justify-between px-6 transition-all duration-300 border-b border-line bg-bg"
      style={{ left: getSidebarWidth(isCollapsed) }}
    >
      {/* Search */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={toggle} className="text-ink-muted">
          <Menu size={20} />
        </Button>
        <div className="relative hidden md:block">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search patients, doctors, invoices..."
            className="h-10 w-[360px] rounded-xl border-line bg-slate-50 pl-10 lg:w-[430px]"
            icon={<Search size={18} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
          />
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full rounded-lg border border-line bg-paper shadow-lg">
              {searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSearchSelect(result)}
                  className="block w-full border-b border-line px-4 py-3 text-left last:border-b-0 hover:bg-hover"
                >
                  <p className="text-sm font-medium text-ink">{result.label}</p>
                  <p className="text-xs text-ink-muted">
                    {result.type.toUpperCase()} • {result.meta}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="hidden items-center gap-1 rounded-lg border border-line px-2 py-1 text-xs text-ink-muted xl:flex">
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
          className="text-ink-muted"
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
            className="relative text-ink-muted"
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
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-line bg-paper shadow-lg">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <h3 className="font-semibold text-ink">Notifications</h3>
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
                        "flex cursor-pointer gap-3 border-b border-line px-4 py-3 hover:bg-hover",
                        !notification.read && "bg-selected"
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
                        <p className="text-sm font-medium text-ink truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-ink-muted truncate">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full border-t border-line py-3 text-center text-sm text-primary-600 hover:bg-hover">
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
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-hover"
          >
            <Avatar name={user?.name} size="sm" />
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-ink">{user?.name}</p>
              <p className="text-xs text-ink-muted capitalize">{user?.role}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {showProfile && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfile(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-line bg-paper py-1 shadow-lg">
                <div className="border-b border-line px-4 py-3">
                  <p className="font-medium text-ink">{user?.name}</p>
                  <p className="text-sm text-ink-muted">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-muted hover:bg-hover"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-muted hover:bg-hover"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                </div>
                <div className="border-t border-line py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-hover"
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
