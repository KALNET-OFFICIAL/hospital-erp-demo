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
} from "recharts";
import { Download, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { revenueData, departmentRevenue } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { getChartColors, getChartTooltipStyle, getIdentityColor } from "@/lib/theme";
import { useThemeStore } from "@/stores";

export function ReportsPage() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const mode =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light";
  const chartColors = getChartColors(mode);
  const tooltipStyle = getChartTooltipStyle(mode);
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalPatients = revenueData.reduce((sum, d) => sum + d.patients, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500">Hospital performance insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar size={16} />
            Last 6 months
          </Button>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          variant="interactive"
          accent="primary"
          onClick={() => navigate("/billing")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-sm text-success-600">+15% from last period</p>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="teal"
          onClick={() => navigate("/patients")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Patients</p>
            <p className="text-2xl font-bold text-slate-900">
              {totalPatients.toLocaleString()}
            </p>
            <p className="text-sm text-success-600">+8% from last period</p>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="violet"
          onClick={() => navigate("/reports/opd")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Avg. Revenue/Patient</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(Math.round(totalRevenue / totalPatients))}
            </p>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="success"
          onClick={() => navigate("/billing/payments")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Collection Rate</p>
            <p className="text-2xl font-bold text-success-600">94%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="month" stroke={chartColors.axis} fontSize={12} />
                  <YAxis
                    stroke={chartColors.axis}
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                    {...tooltipStyle}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={getIdentityColor("revenue", mode)}
                    strokeWidth={3}
                    dot={{ fill: getIdentityColor("revenue", mode), strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Patient Count */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="month" stroke={chartColors.axis} fontSize={12} />
                  <YAxis stroke={chartColors.axis} fontSize={12} />
                  <Tooltip
                    formatter={(value) => [Number(value), "Patients"]}
                    {...tooltipStyle}
                  />
                  <Bar dataKey="patients" fill={getIdentityColor("patients", mode)} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Department Revenue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentRevenue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis
                    type="number"
                    stroke={chartColors.axis}
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <YAxis
                    type="category"
                    dataKey="department"
                    stroke={chartColors.axis}
                    fontSize={12}
                    width={120}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                    {...tooltipStyle}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {departmentRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getIdentityColor(entry.department, mode)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentRevenue}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="revenue"
                    label={({ percent }) =>
                      `${((percent || 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {departmentRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getIdentityColor(entry.department, mode)} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    {...tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {departmentRevenue.map((dept) => (
                <div
                  key={dept.department}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getIdentityColor(dept.department, mode) }}
                    />
                    <span className="text-slate-600">{dept.department}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(dept.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
