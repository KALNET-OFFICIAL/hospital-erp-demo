import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebarStore, useAuthStore, useThemeStore } from "@/stores";
import type { UserRole } from "@/types";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  BedDouble,
  Receipt,
  Pill,
  UserCog,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Activity,
  ClipboardList,
  FileText,
  Package,
  Truck,
  Clock,
  CreditCard,
  RotateCcw,
  ListOrdered,
  UserPlus,
  CalendarDays,
  Clipboard,
  Building2,
  Shield,
  History,
  Upload,
  FlaskConical,
  AlertTriangle,
  DollarSign,
  GitPullRequest,
  ListTodo,
} from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  roles: UserRole[];
  children?: NavItem[];
}

// ADMIN SIDEBAR - Full Access
const adminNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard size={20} />,
    roles: ["admin"],
  },
  {
    label: "Handover Board",
    href: "/handover",
    icon: <ListTodo size={20} />,
    roles: ["admin"],
  },
  {
    label: "Patients",
    icon: <Users size={20} />,
    roles: ["admin"],
    children: [
      { label: "Patient List", href: "/patients", icon: <Users size={18} />, roles: ["admin"] },
      { label: "Add Patient", href: "/patients/new", icon: <UserPlus size={18} />, roles: ["admin"] },
      { label: "Timeline View", href: "/patients/timeline", icon: <History size={18} />, roles: ["admin"] },
      { label: "Referrals", href: "/referrals", icon: <GitPullRequest size={18} />, roles: ["admin"] },
    ],
  },
  {
    label: "Appointments",
    icon: <Calendar size={20} />,
    roles: ["admin"],
    children: [
      { label: "Calendar", href: "/appointments", icon: <CalendarDays size={18} />, roles: ["admin"] },
      { label: "Appointment List", href: "/appointments/list", icon: <ListOrdered size={18} />, roles: ["admin"] },
      { label: "Queue Management", href: "/appointments/queue", icon: <Clock size={18} />, roles: ["admin"] },
    ],
  },
  {
    label: "OPD",
    icon: <Stethoscope size={20} />,
    roles: ["admin"],
    children: [
      { label: "Today's OPD", href: "/opd", icon: <Stethoscope size={18} />, roles: ["admin"] },
      { label: "Consultation Records", href: "/opd/records", icon: <ClipboardList size={18} />, roles: ["admin"] },
    ],
  },
  {
    label: "IPD",
    icon: <BedDouble size={20} />,
    roles: ["admin"],
    children: [
      { label: "Admissions", href: "/ipd", icon: <BedDouble size={18} />, roles: ["admin"] },
      { label: "Bed Management", href: "/ipd/beds", icon: <BedDouble size={18} />, roles: ["admin"] },
      { label: "Attender Details", href: "/ipd/attenders", icon: <Users size={18} />, roles: ["admin"] },
      { label: "Discharge", href: "/ipd/discharge", icon: <ClipboardList size={18} />, roles: ["admin"] },
    ],
  },
  {
    label: "Billing",
    icon: <Receipt size={20} />,
    roles: ["admin"],
    children: [
      { label: "Invoices", href: "/billing", icon: <Receipt size={18} />, roles: ["admin"] },
      { label: "Create Bill", href: "/billing/new", icon: <CreditCard size={18} />, roles: ["admin"] },
      { label: "Payments", href: "/billing/payments", icon: <DollarSign size={18} />, roles: ["admin"] },
      { label: "Refunds", href: "/billing/refunds", icon: <RotateCcw size={18} />, roles: ["admin"] },
      { label: "Service Catalog", href: "/billing/services", icon: <ListOrdered size={18} />, roles: ["admin"] },
    ],
  },
  {
    label: "Pharmacy",
    icon: <Pill size={20} />,
    roles: ["admin"],
    children: [
      { label: "POS Sales", href: "/pharmacy/pos", icon: <CreditCard size={18} />, roles: ["admin"] },
      { label: "Inventory", href: "/pharmacy", icon: <Package size={18} />, roles: ["admin"] },
      { label: "Medicines", href: "/pharmacy/medicines", icon: <Pill size={18} />, roles: ["admin"] },
      { label: "Purchase Orders", href: "/pharmacy/purchases", icon: <Clipboard size={18} />, roles: ["admin"] },
      { label: "Suppliers", href: "/pharmacy/suppliers", icon: <Truck size={18} />, roles: ["admin"] },
      { label: "Expiry Alerts", href: "/pharmacy/expiry", icon: <AlertTriangle size={18} />, roles: ["admin"] },
    ],
  },
  {
    label: "Staff",
    icon: <UserCog size={20} />,
    roles: ["admin"],
    children: [
      { label: "Staff List", href: "/staff", icon: <Users size={18} />, roles: ["admin"] },
      { label: "Roles & Permissions", href: "/staff/roles", icon: <Shield size={18} />, roles: ["admin"] },
      { label: "Doctor Schedules", href: "/staff/schedules", icon: <Calendar size={18} />, roles: ["admin"] },
      { label: "Availability", href: "/staff/availability", icon: <Clock size={18} />, roles: ["admin"] },
    ],
  },
  {
    label: "Reports",
    icon: <BarChart3 size={20} />,
    roles: ["admin"],
    children: [
      { label: "Revenue", href: "/reports", icon: <DollarSign size={18} />, roles: ["admin"] },
      { label: "OPD Reports", href: "/reports/opd", icon: <Stethoscope size={18} />, roles: ["admin"] },
      { label: "IPD Reports", href: "/reports/ipd", icon: <BedDouble size={18} />, roles: ["admin"] },
      { label: "Pharmacy Reports", href: "/reports/pharmacy", icon: <Pill size={18} />, roles: ["admin"] },
    ],
  },
  {
    label: "Documents",
    icon: <FileText size={20} />,
    roles: ["admin"],
    children: [
      { label: "Patient Files", href: "/documents", icon: <FileText size={18} />, roles: ["admin"] },
      { label: "Lab Reports", href: "/documents/lab", icon: <FlaskConical size={18} />, roles: ["admin"] },
      { label: "Upload Center", href: "/documents/upload", icon: <Upload size={18} />, roles: ["admin"] },
    ],
  },
  {
    label: "Settings",
    icon: <Settings size={20} />,
    roles: ["admin"],
    children: [
      { label: "Hospital Profile", href: "/settings", icon: <Building2 size={18} />, roles: ["admin"] },
      { label: "Departments", href: "/settings/departments", icon: <Building2 size={18} />, roles: ["admin"] },
      { label: "Services & Pricing", href: "/settings/services", icon: <ListOrdered size={18} />, roles: ["admin"] },
      { label: "Bed/Ward Config", href: "/settings/beds", icon: <BedDouble size={18} />, roles: ["admin"] },
      { label: "Audit Logs", href: "/settings/audit-logs", icon: <History size={18} />, roles: ["admin"] },
    ],
  },
];

// DOCTOR SIDEBAR
const doctorNavItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard size={20} />, roles: ["doctor"] },
  { label: "Handover Board", href: "/handover", icon: <ListTodo size={20} />, roles: ["doctor"] },
  {
    label: "My Patients",
    icon: <Users size={20} />,
    roles: ["doctor"],
    children: [
      { label: "Patient List", href: "/patients", icon: <Users size={18} />, roles: ["doctor"] },
      { label: "Timeline", href: "/patients/timeline", icon: <History size={18} />, roles: ["doctor"] },
      { label: "Referrals", href: "/referrals", icon: <GitPullRequest size={18} />, roles: ["doctor"] },
    ],
  },
  {
    label: "Appointments",
    icon: <Calendar size={20} />,
    roles: ["doctor"],
    children: [
      { label: "Today's Schedule", href: "/appointments", icon: <CalendarDays size={18} />, roles: ["doctor"] },
      { label: "Queue", href: "/appointments/queue", icon: <Clock size={18} />, roles: ["doctor"] },
    ],
  },
  {
    label: "OPD",
    icon: <Stethoscope size={20} />,
    roles: ["doctor"],
    children: [
      { label: "Consultation", href: "/opd", icon: <Stethoscope size={18} />, roles: ["doctor"] },
      { label: "EMR Entry", href: "/opd/emr", icon: <ClipboardList size={18} />, roles: ["doctor"] },
    ],
  },
  {
    label: "IPD",
    icon: <BedDouble size={20} />,
    roles: ["doctor"],
    children: [
      { label: "My Patients", href: "/ipd", icon: <BedDouble size={18} />, roles: ["doctor"] },
      { label: "Treatment Notes", href: "/ipd/notes", icon: <ClipboardList size={18} />, roles: ["doctor"] },
    ],
  },
  { label: "Documents", href: "/documents", icon: <FileText size={20} />, roles: ["doctor"] },
  {
    label: "My Schedule",
    icon: <Clock size={20} />,
    roles: ["doctor"],
    children: [
      { label: "Availability", href: "/staff/availability", icon: <Clock size={18} />, roles: ["doctor"] },
      { label: "Leaves", href: "/staff/leaves", icon: <Calendar size={18} />, roles: ["doctor"] },
    ],
  },
];

// RECEPTION SIDEBAR
const receptionNavItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard size={20} />, roles: ["reception"] },
  { label: "Handover Board", href: "/handover", icon: <ListTodo size={20} />, roles: ["reception"] },
  {
    label: "Patients",
    icon: <Users size={20} />,
    roles: ["reception"],
    children: [
      { label: "Register Patient", href: "/patients/new", icon: <UserPlus size={18} />, roles: ["reception"] },
      { label: "Patient List", href: "/patients", icon: <Users size={18} />, roles: ["reception"] },
      { label: "Referrals", href: "/referrals", icon: <GitPullRequest size={18} />, roles: ["reception"] },
    ],
  },
  {
    label: "Appointments",
    icon: <Calendar size={20} />,
    roles: ["reception"],
    children: [
      { label: "Book Appointment", href: "/appointments/new", icon: <CalendarDays size={18} />, roles: ["reception"] },
      { label: "Calendar", href: "/appointments", icon: <Calendar size={18} />, roles: ["reception"] },
      { label: "Queue Management", href: "/appointments/queue", icon: <Clock size={18} />, roles: ["reception"] },
    ],
  },
  {
    label: "OPD",
    icon: <Stethoscope size={20} />,
    roles: ["reception"],
    children: [
      { label: "Check-in Patients", href: "/opd", icon: <Stethoscope size={18} />, roles: ["reception"] },
    ],
  },
  {
    label: "Billing",
    icon: <Receipt size={20} />,
    roles: ["reception"],
    children: [
      { label: "Create Bill", href: "/billing/new", icon: <CreditCard size={18} />, roles: ["reception"] },
      { label: "Payments", href: "/billing/payments", icon: <DollarSign size={18} />, roles: ["reception"] },
      { label: "Invoice List", href: "/billing", icon: <Receipt size={18} />, roles: ["reception"] },
    ],
  },
  { label: "Documents", href: "/documents", icon: <FileText size={20} />, roles: ["reception"] },
];

// PHARMACIST SIDEBAR
const pharmacistNavItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard size={20} />, roles: ["pharmacist"] },
  { label: "Handover Board", href: "/handover", icon: <ListTodo size={20} />, roles: ["pharmacist"] },
  {
    label: "POS",
    icon: <CreditCard size={20} />,
    roles: ["pharmacist"],
    children: [
      { label: "New Sale", href: "/pharmacy/pos", icon: <CreditCard size={18} />, roles: ["pharmacist"] },
    ],
  },
  {
    label: "Inventory",
    icon: <Package size={20} />,
    roles: ["pharmacist"],
    children: [
      { label: "Stock List", href: "/pharmacy", icon: <Package size={18} />, roles: ["pharmacist"] },
      { label: "Low Stock", href: "/pharmacy/low-stock", icon: <AlertTriangle size={18} />, roles: ["pharmacist"] },
      { label: "Expiry Tracking", href: "/pharmacy/expiry", icon: <AlertTriangle size={18} />, roles: ["pharmacist"] },
    ],
  },
  {
    label: "Medicines",
    icon: <Pill size={20} />,
    roles: ["pharmacist"],
    children: [
      { label: "Medicine List", href: "/pharmacy/medicines", icon: <Pill size={18} />, roles: ["pharmacist"] },
      { label: "Add Medicine", href: "/pharmacy/medicines/new", icon: <Pill size={18} />, roles: ["pharmacist"] },
    ],
  },
  {
    label: "Purchases",
    icon: <Clipboard size={20} />,
    roles: ["pharmacist"],
    children: [
      { label: "Purchase Orders", href: "/pharmacy/purchases", icon: <Clipboard size={18} />, roles: ["pharmacist"] },
      { label: "Add Stock", href: "/pharmacy/purchases/new", icon: <Package size={18} />, roles: ["pharmacist"] },
    ],
  },
  {
    label: "Suppliers",
    icon: <Truck size={20} />,
    roles: ["pharmacist"],
    children: [
      { label: "Supplier List", href: "/pharmacy/suppliers", icon: <Truck size={18} />, roles: ["pharmacist"] },
      { label: "Add Supplier", href: "/pharmacy/suppliers/new", icon: <Truck size={18} />, roles: ["pharmacist"] },
    ],
  },
  {
    label: "Reports",
    icon: <BarChart3 size={20} />,
    roles: ["pharmacist"],
    children: [
      { label: "Sales Reports", href: "/reports/pharmacy", icon: <DollarSign size={18} />, roles: ["pharmacist"] },
    ],
  },
];

export function Sidebar() {
  const { isCollapsed, toggle } = useSidebarStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const userRole = user?.role || "admin";
  
  // Select nav items based on role
  const getNavItems = () => {
    switch (userRole) {
      case "doctor":
        return doctorNavItems;
      case "reception":
        return receptionNavItems;
      case "pharmacist":
        return pharmacistNavItems;
      default:
        return adminNavItems;
    }
  };

  const navItems = getNavItems();

  useEffect(() => {
    const activeParents = navItems
      .filter(
        (item) =>
          item.children &&
          item.children.some(
            (child) =>
              child.href !== undefined && child.href === location.pathname
          )
      )
      .map((item) => item.label);
    setExpandedItems(activeParents);
  }, [location.pathname, navItems]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [label]));
  };

  // Check if a parent menu has any active children (for visual indication, not full highlight)
  const hasActiveChild = (item: NavItem): boolean => {
    if (!item.children) return false;
    return item.children.some(
      (child) =>
        child.href !== undefined && child.href === location.pathname
    );
  };

  // Only top-level items without children should be "active" (blue background)
  const isItemActive = (item: NavItem): boolean => {
    // Parent items with children should NOT be highlighted blue - their children handle that
    if (item.children) {
      return false;
    }
    // Direct link items
    if (item.href) {
      return location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
    }
    return false;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r transition-all duration-300",
        isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200",
        isCollapsed ? "w-[80px]" : "w-[256px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center justify-between px-4 border-b",
        isDark ? "border-slate-700" : "border-gray-200"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className={cn("text-lg font-bold leading-none", isDark ? "text-white" : "text-slate-900")}>KALNET</h1>
              <p className={cn("text-xs mt-0.5", isDark ? "text-slate-400" : "text-slate-500")}>Hospital OS</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <Activity className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                // Expandable menu item
                <div>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
                      hasActiveChild(item)
                        ? "text-blue-500 bg-blue-600/10"
                        : isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-gray-100",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          size={16}
                          className={cn(
                            "transition-transform",
                            hasActiveChild(item) ? "text-blue-500" : isDark ? "text-slate-500" : "text-slate-400",
                            expandedItems.includes(item.label) && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>
                  {!isCollapsed && expandedItems.includes(item.label) && (
                    <ul className="mt-1 space-y-1 pl-4">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <NavLink
                            to={child.href!}
                            end
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                isActive
                                  ? "bg-blue-600 text-white font-medium"
                                  : isDark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-600 hover:bg-gray-50 hover:text-slate-900"
                              )
                            }
                          >
                            {child.icon}
                            <span>{child.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // Direct link item
                <NavLink
                  to={item.href!}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-gray-100",
                      isCollapsed && "justify-center px-2"
                    )
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={toggle}
        className={cn(
          "flex h-12 items-center justify-center border-t transition-colors",
          isDark ? "border-slate-700 text-slate-500 hover:bg-slate-800 hover:text-slate-300" : "border-gray-200 text-slate-400 hover:bg-gray-50 hover:text-slate-600"
        )}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </aside>
  );
}
