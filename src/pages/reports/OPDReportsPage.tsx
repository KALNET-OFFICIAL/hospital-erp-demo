import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Download, Calendar, Users, Clock, Stethoscope, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { formatCurrency } from "@/lib/utils";
import { getChartColors, getChartTooltipStyle, getIdentityColor } from "@/lib/theme";
import { useThemeStore } from "@/stores";

// Mock data for OPD reports
const dailyOPDData = [
  { date: "Mon", patients: 45, revenue: 67500, avgWait: 12 },
  { date: "Tue", patients: 52, revenue: 78000, avgWait: 15 },
  { date: "Wed", patients: 38, revenue: 57000, avgWait: 10 },
  { date: "Thu", patients: 61, revenue: 91500, avgWait: 18 },
  { date: "Fri", patients: 55, revenue: 82500, avgWait: 14 },
  { date: "Sat", patients: 72, revenue: 108000, avgWait: 22 },
  { date: "Sun", patients: 28, revenue: 42000, avgWait: 8 },
];

const doctorPerformance = [
  { name: "Dr. Sarah Johnson", patients: 156, revenue: 234000, rating: 4.8 },
  { name: "Dr. Michael Chen", patients: 142, revenue: 213000, rating: 4.7 },
  { name: "Dr. Emily Parker", patients: 128, revenue: 192000, rating: 4.9 },
  { name: "Dr. James Wilson", patients: 118, revenue: 177000, rating: 4.5 },
  { name: "Dr. Lisa Anderson", patients: 95, revenue: 142500, rating: 4.6 },
];

const departmentData = [
  { department: "General Medicine", patients: 245, revenue: 367500 },
  { department: "Cardiology", patients: 89, revenue: 267000 },
  { department: "Orthopedics", patients: 76, revenue: 228000 },
  { department: "Pediatrics", patients: 124, revenue: 186000 },
  { department: "Dermatology", patients: 68, revenue: 102000 },
];

const appointmentTypes = [
  { name: "New Consultation", value: 320 },
  { name: "Follow-up", value: 245 },
  { name: "Emergency", value: 87 },
  { name: "Referral", value: 56 },
];

const timeSlotData = [
  { slot: "9-10 AM", patients: 42 },
  { slot: "10-11 AM", patients: 68 },
  { slot: "11-12 PM", patients: 55 },
  { slot: "12-1 PM", patients: 32 },
  { slot: "2-3 PM", patients: 48 },
  { slot: "3-4 PM", patients: 62 },
  { slot: "4-5 PM", patients: 45 },
  { slot: "5-6 PM", patients: 28 },
];

const monthlyTrend = [
  { month: "Jan", patients: 850, revenue: 1275000 },
  { month: "Feb", patients: 920, revenue: 1380000 },
  { month: "Mar", patients: 1050, revenue: 1575000 },
  { month: "Apr", patients: 980, revenue: 1470000 },
  { month: "May", patients: 1120, revenue: 1680000 },
  { month: "Jun", patients: 1200, revenue: 1800000 },
];

export function OPDReportsPage() {
  const [dateRange, setDateRange] = useState("This Month");
  const { theme } = useThemeStore();
  const mode =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light";
  const chartColors = getChartColors(mode);
  const tooltipStyle = getChartTooltipStyle(mode);

  const totalPatients = dailyOPDData.reduce((sum, d) => sum + d.patients, 0);
  const totalRevenue = dailyOPDData.reduce((sum, d) => sum + d.revenue, 0);
  const avgWaitTime = Math.round(dailyOPDData.reduce((sum, d) => sum + d.avgWait, 0) / dailyOPDData.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">OPD Reports</h1>
          <p className="text-ink-muted">Outpatient department analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            {dateRange}
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Patients"
          value={totalPatients.toString()}
          change="+12% from last week"
          icon={<Users className="h-5 w-5" />}
          iconColor="Total Patients"
        />
        <KpiCard
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          change="+8% from last week"
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="Revenue"
        />
        <KpiCard
          title="Avg. Wait Time"
          value={`${avgWaitTime} min`}
          subtitle="+2 min from target"
          icon={<Clock className="h-5 w-5" />}
          iconColor="Avg. Wait Time"
        />
        <KpiCard
          title="Active Doctors"
          value={doctorPerformance.length.toString()}
          subtitle="All available today"
          icon={<Stethoscope className="h-5 w-5" />}
          iconColor="Active Doctors"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Patient Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily Patient Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyOPDData}>
                  <defs>
                    <linearGradient id="patientGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={getIdentityColor("patients", mode)} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={getIdentityColor("patients", mode)} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="date" stroke={chartColors.axis} fontSize={12} />
                  <YAxis stroke={chartColors.axis} fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="patients"
                    stroke={getIdentityColor("patients", mode)}
                    strokeWidth={2}
                    fill="url(#patientGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Day */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyOPDData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="date" stroke={chartColors.axis} fontSize={12} />
                  <YAxis
                    stroke={chartColors.axis}
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                    {...tooltipStyle}
                  />
                  <Bar dataKey="revenue" fill={getIdentityColor("revenue", mode)} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Appointment Types */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Appointment Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {appointmentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getIdentityColor(entry.name, mode)} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {appointmentTypes.map((type) => (
                <div key={type.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getIdentityColor(type.name, mode) }}
                    />
                    <span className="text-ink-muted">{type.name}</span>
                  </div>
                  <span className="font-medium">{type.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Peak Hours Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSlotData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis type="number" stroke={chartColors.axis} fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="slot"
                    stroke={chartColors.axis}
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip formatter={(value) => [value, "Patients"]} {...tooltipStyle} />
                  <Bar dataKey="patients" fill={getIdentityColor("Peak Hours", mode)} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Performance Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Doctor Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-line">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Doctor
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Patients
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Revenue
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Avg/Patient
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {doctorPerformance.map((doc) => (
                  <tr key={doc.name} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={doc.name} size="sm" />
                        <span className="font-medium text-ink">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-ink">{doc.patients}</td>
                    <td className="px-4 py-3 text-right text-ink">
                      {formatCurrency(doc.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right text-ink">
                      {formatCurrency(Math.round(doc.revenue / doc.patients))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-warning-600">
                        ⭐ {doc.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Department Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Department-wise Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="department" stroke={chartColors.axis} fontSize={12} />
                <YAxis
                  yAxisId="left"
                  stroke={chartColors.axis}
                  fontSize={12}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <YAxis yAxisId="right" orientation="right" stroke={chartColors.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill={getIdentityColor("revenue", mode)}
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
                <Bar
                  yAxisId="right"
                  dataKey="patients"
                  fill={getIdentityColor("patients", mode)}
                  radius={[4, 4, 0, 0]}
                  name="Patients"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
