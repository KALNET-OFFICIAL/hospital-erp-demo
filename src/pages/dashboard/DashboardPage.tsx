import { useState } from "react";
import {
  Users,
  Calendar,
  BedDouble,
  IndianRupee,
  ArrowRight,
  Plus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { BookAppointmentModal } from "@/components/appointments/BookAppointmentModal";
import { formatCurrency } from "@/lib/utils";
import { dashboardStats, revenueData, departmentRevenue, beds } from "@/lib/mock-data";
import { useAuthStore, useHospitalOpsStore, useThemeStore } from "@/stores";
import { getChartColors, getChartTooltipStyle, getIdentityColor } from "@/lib/theme";

export function DashboardPage() {
  const { user } = useAuthStore();
  const { appointments } = useHospitalOpsStore();
  const { theme } = useThemeStore();
  const mode =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light";
  const chartColors = getChartColors(mode);
  const tooltipStyle = getChartTooltipStyle(mode);
  const revenueColor = getIdentityColor("revenue", mode);
  const [showBookModal, setShowBookModal] = useState(false);

  const visibleAppointments =
    user?.role === "doctor"
      ? appointments.filter((appointment) => appointment.doctorId === user.id)
      : appointments;

  const todayAppointments = visibleAppointments.slice(0, 8);
  const availableBeds = beds.filter((bed) => bed.status === "available").length;
  const occupiedBeds = beds.filter((bed) => bed.status === "occupied").length;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-2">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-ink-muted">Here's what's happening at your hospital today</p>
        </div>
        <Button onClick={() => setShowBookModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Patients"
          value={dashboardStats.totalPatients.toLocaleString()}
          subtitle="Registered patients"
          change="+12% vs last month"
          icon={<Users className="h-5 w-5" />}
          iconColor="blue"
          to="/patients"
        />
        <KpiCard
          title="Today's Appointments"
          value={dashboardStats.todayAppointments.toString()}
          subtitle={`${dashboardStats.opdCount} OPD, ${dashboardStats.ipdCount} IPD`}
          icon={<Calendar className="h-5 w-5" />}
          iconColor="teal"
          to="/appointments/list"
        />
        <KpiCard
          title="Today's Revenue"
          value={formatCurrency(dashboardStats.todayRevenue)}
          subtitle="₹76,630 pending"
          change="+8% vs last month"
          icon={<IndianRupee className="h-5 w-5" />}
          iconColor="amber"
          to="/billing"
        />
        <KpiCard
          title="Bed Occupancy"
          value={`${dashboardStats.bedOccupancy}%`}
          subtitle={`${occupiedBeds} of ${beds.length} occupied`}
          icon={<BedDouble className="h-5 w-5" />}
          iconColor="purple"
          to="/ipd/beds"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-paper rounded-xl border border-line p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-ink">Revenue Overview</h3>
            <p className="text-sm text-ink-muted mt-1">Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={revenueColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={revenueColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                dataKey="month"
                stroke={chartColors.axis}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={revenueColor}
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Revenue Pie Chart */}
        <div className="bg-paper rounded-xl border border-line p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-ink">Department Revenue</h3>
            <p className="text-sm text-ink-muted mt-1">Current distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={departmentRevenue}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="revenue"
              >
                {departmentRevenue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getIdentityColor(entry.department, mode)} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-3">
            {departmentRevenue.map((dept) => (
              <div key={dept.department} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getIdentityColor(dept.department, mode) }}
                  />
                  <span className="text-ink-muted">{dept.department}</span>
                </div>
                <span className="font-medium text-ink">{formatCurrency(dept.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments and Bed Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-paper rounded-xl border border-line p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-ink">Today's Appointments</h3>
            <Link to="/appointments">
              <Button variant="link" size="sm">
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink text-sm truncate">
                    {appointment.patientName}
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">{appointment.doctorName}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm text-ink-muted">{appointment.time}</span>
                  <Badge
                    variant={
                      appointment.status === "cancelled"
                        ? "danger"
                        : appointment.status === "in-consultation"
                        ? "primary"
                        : "default"
                    }
                    className="text-xs capitalize"
                  >
                    {appointment.status.replace(/-/g, " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bed Status */}
        <div className="bg-paper rounded-xl border border-line p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-ink">Bed Status</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-success-500" />
                <span className="text-ink-muted">Available ({availableBeds})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-danger-500" />
                <span className="text-ink-muted">Occupied ({occupiedBeds})</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {beds.slice(0, 12).map((bed) => (
              <div
                key={bed.id}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  bed.status === "available"
                    ? "border-success-200 bg-success-50"
                    : bed.status === "occupied"
                    ? "border-danger-200 bg-danger-50"
                    : bed.status === "reserved"
                    ? "border-warning-200 bg-warning-50"
                    : "border-line bg-slate-50"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    bed.status === "available"
                      ? "text-success-700"
                      : bed.status === "occupied"
                      ? "text-danger-700"
                      : bed.status === "reserved"
                      ? "text-warning-700"
                      : "text-ink"
                  }`}
                >
                  {bed.id}
                </p>
                <p
                  className={`text-xs mt-1 capitalize ${
                    bed.status === "available"
                      ? "text-success-600"
                      : bed.status === "occupied"
                      ? "text-danger-600"
                      : bed.status === "reserved"
                      ? "text-warning-600"
                      : "text-ink-muted"
                  }`}
                >
                  {bed.status}
                </p>
              </div>
            ))}
          </div>
          <Link to="/ipd/beds">
            <Button variant="outline" className="w-full mt-6" size="sm">
              Manage Beds
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
      />
    </div>
  );
}
