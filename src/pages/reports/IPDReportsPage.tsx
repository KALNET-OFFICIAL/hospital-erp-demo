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
import {
  Download,
  Calendar,
  BedDouble,
  Clock,
  TrendingUp,
  Users,
  IndianRupee,
  Activity,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { formatCurrency } from "@/lib/utils";
import { getChartColors, getChartTooltipStyle, getIdentityColor } from "@/lib/theme";
import { useThemeStore } from "@/stores";

// Mock data for IPD reports
const occupancyTrend = [
  { date: "Mon", occupancy: 78, admissions: 12, discharges: 8 },
  { date: "Tue", occupancy: 82, admissions: 15, discharges: 10 },
  { date: "Wed", occupancy: 85, admissions: 10, discharges: 7 },
  { date: "Thu", occupancy: 88, admissions: 14, discharges: 9 },
  { date: "Fri", occupancy: 84, admissions: 8, discharges: 12 },
  { date: "Sat", occupancy: 80, admissions: 6, discharges: 10 },
  { date: "Sun", occupancy: 76, admissions: 4, discharges: 8 },
];

const wardOccupancy = [
  { ward: "General Ward", total: 40, occupied: 32, available: 8 },
  { ward: "Private Rooms", total: 20, occupied: 18, available: 2 },
  { ward: "ICU", total: 10, occupied: 8, available: 2 },
  { ward: "Pediatric", total: 15, occupied: 10, available: 5 },
  { ward: "Maternity", total: 12, occupied: 9, available: 3 },
];

const admissionsByDepartment = [
  { department: "General Medicine", count: 45, revenue: 675000, avgStay: 4.2 },
  { department: "Surgery", count: 32, revenue: 960000, avgStay: 5.8 },
  { department: "Orthopedics", count: 28, revenue: 840000, avgStay: 6.5 },
  { department: "Cardiology", count: 18, revenue: 720000, avgStay: 5.2 },
  { department: "Pediatrics", count: 22, revenue: 330000, avgStay: 3.5 },
];

const revenueTrend = [
  { month: "Jan", revenue: 2850000, patients: 125 },
  { month: "Feb", revenue: 3200000, patients: 142 },
  { month: "Mar", revenue: 2980000, patients: 138 },
  { month: "Apr", revenue: 3450000, patients: 156 },
  { month: "May", revenue: 3680000, patients: 168 },
  { month: "Jun", revenue: 3920000, patients: 175 },
];

const patientStatus = [
  { status: "Stable", count: 52 },
  { status: "Under Observation", count: 18 },
  { status: "Critical", count: 5 },
  { status: "Ready for Discharge", count: 12 },
];

const lengthOfStay = [
  { days: "1-2 days", count: 35 },
  { days: "3-5 days", count: 42 },
  { days: "6-10 days", count: 28 },
  { days: "11-15 days", count: 12 },
  { days: "15+ days", count: 8 },
];

const recentDischarges = [
  { id: "P001", name: "Rajesh Kumar", ward: "General", days: 5, bill: 45000, status: "paid" },
  { id: "P002", name: "Priya Sharma", ward: "Private", days: 3, bill: 75000, status: "pending" },
  { id: "P003", name: "Amit Singh", ward: "ICU", days: 7, bill: 185000, status: "partial" },
  { id: "P004", name: "Sunita Devi", ward: "Maternity", days: 4, bill: 55000, status: "paid" },
  { id: "P005", name: "Vijay Patel", ward: "Surgery", days: 6, bill: 125000, status: "pending" },
];

export function IPDReportsPage() {
  const [dateRange, setDateRange] = useState("This Month");
  const { theme } = useThemeStore();
  const mode =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light";
  const chartColors = getChartColors(mode);
  const tooltipStyle = getChartTooltipStyle(mode);

  const totalBeds = wardOccupancy.reduce((sum, w) => sum + w.total, 0);
  const occupiedBeds = wardOccupancy.reduce((sum, w) => sum + w.occupied, 0);
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);
  const totalRevenue = revenueTrend.reduce((sum, r) => sum + r.revenue, 0);
  const totalPatients = revenueTrend.reduce((sum, r) => sum + r.patients, 0);

  const statusVariant: Record<string, "success" | "warning" | "info"> = {
    paid: "success",
    pending: "warning",
    partial: "info",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">IPD Reports</h1>
          <p className="text-ink-muted">Inpatient department analytics and bed management</p>
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
          title="Bed Occupancy"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedBeds} of ${totalBeds} beds`}
          icon={<BedDouble className="h-5 w-5" />}
          iconColor="Bed Occupancy"
        />
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change="+15% from last period"
          icon={<IndianRupee className="h-5 w-5" />}
          iconColor="Total Revenue"
        />
        <KpiCard
          title="Avg. Length of Stay"
          value="4.8 days"
          change="-0.5 days from target"
          icon={<Clock className="h-5 w-5" />}
          iconColor="Length of Stay"
        />
        <KpiCard
          title="Current Patients"
          value={occupiedBeds.toString()}
          subtitle="Admitted now"
          icon={<Users className="h-5 w-5" />}
          iconColor="Current Patients"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Occupancy Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Occupancy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="date" stroke={chartColors.axis} fontSize={12} />
                  <YAxis stroke={chartColors.axis} fontSize={12} domain={[60, 100]} />
                  <Tooltip {...tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="occupancy"
                    stroke={getIdentityColor("Occupancy", mode)}
                    strokeWidth={2}
                    dot={{ fill: getIdentityColor("Occupancy", mode) }}
                    name="Occupancy %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Admissions vs Discharges */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Admissions vs Discharges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="date" stroke={chartColors.axis} fontSize={12} />
                  <YAxis stroke={chartColors.axis} fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Bar
                    dataKey="admissions"
                    fill={getIdentityColor("Admissions", mode)}
                    radius={[4, 4, 0, 0]}
                    name="Admissions"
                  />
                  <Bar
                    dataKey="discharges"
                    fill={getIdentityColor("Discharges", mode)}
                    radius={[4, 4, 0, 0]}
                    name="Discharges"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Patient Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={patientStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="count"
                    label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {patientStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getIdentityColor(entry.status, mode)} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {patientStatus.map((status) => (
                <div key={status.status} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getIdentityColor(status.status, mode) }}
                    />
                    <span className="text-ink-muted">{status.status}</span>
                  </div>
                  <span className="font-medium">{status.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Length of Stay */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Length of Stay Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lengthOfStay}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="days" stroke={chartColors.axis} fontSize={12} />
                  <YAxis stroke={chartColors.axis} fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Bar
                    dataKey="count"
                    fill={getIdentityColor("Length of Stay", mode)}
                    radius={[4, 4, 0, 0]}
                    name="Patients"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ward Occupancy */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ward-wise Occupancy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {wardOccupancy.map((ward) => {
              const occupancyPercent = Math.round((ward.occupied / ward.total) * 100);
              return (
                <div key={ward.ward} className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-ink text-sm">{ward.ward}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
                      <span>{occupancyPercent}% occupied</span>
                      <span>
                        {ward.occupied}/{ward.total}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${occupancyPercent}%`,
                          backgroundColor: getIdentityColor(ward.ward, mode),
                        }}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-ink-muted">
                    {ward.available} beds available
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Department Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Department-wise Admissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-line">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Department
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Admissions
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Revenue
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Avg. Revenue/Patient
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Avg. Stay
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {admissionsByDepartment.map((dept) => (
                  <tr key={dept.department} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-ink">{dept.department}</td>
                    <td className="px-4 py-3 text-right text-ink">{dept.count}</td>
                    <td className="px-4 py-3 text-right text-ink">
                      {formatCurrency(dept.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right text-ink">
                      {formatCurrency(Math.round(dept.revenue / dept.count))}
                    </td>
                    <td className="px-4 py-3 text-right text-ink">{dept.avgStay} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Discharges */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Discharges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-line">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Patient
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Ward
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Stay
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Bill Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentDischarges.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-ink">{patient.name}</p>
                        <p className="text-xs text-ink-muted">{patient.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink">{patient.ward}</td>
                    <td className="px-4 py-3 text-right text-ink">{patient.days} days</td>
                    <td className="px-4 py-3 text-right font-medium text-ink">
                      {formatCurrency(patient.bill)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[patient.status]}>{patient.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
