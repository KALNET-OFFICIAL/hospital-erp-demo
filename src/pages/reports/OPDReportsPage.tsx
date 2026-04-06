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
import { formatCurrency } from "@/lib/utils";

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
  { department: "General Medicine", patients: 245, revenue: 367500, color: "#3B82F6" },
  { department: "Cardiology", patients: 89, revenue: 267000, color: "#EF4444" },
  { department: "Orthopedics", patients: 76, revenue: 228000, color: "#10B981" },
  { department: "Pediatrics", patients: 124, revenue: 186000, color: "#F59E0B" },
  { department: "Dermatology", patients: 68, revenue: 102000, color: "#8B5CF6" },
];

const appointmentTypes = [
  { name: "New Consultation", value: 320, color: "#3B82F6" },
  { name: "Follow-up", value: 245, color: "#10B981" },
  { name: "Emergency", value: 87, color: "#EF4444" },
  { name: "Referral", value: 56, color: "#F59E0B" },
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

  const totalPatients = dailyOPDData.reduce((sum, d) => sum + d.patients, 0);
  const totalRevenue = dailyOPDData.reduce((sum, d) => sum + d.revenue, 0);
  const avgWaitTime = Math.round(dailyOPDData.reduce((sum, d) => sum + d.avgWait, 0) / dailyOPDData.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OPD Reports</h1>
          <p className="text-gray-500">Outpatient department analytics and insights</p>
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
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
                <p className="text-xs text-green-600">+12% from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-green-600">+8% from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Wait Time</p>
                <p className="text-2xl font-bold text-gray-900">{avgWaitTime} min</p>
                <p className="text-xs text-red-600">+2 min from target</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Stethoscope className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{doctorPerformance.length}</p>
                <p className="text-xs text-gray-500">All available today</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="patients"
                    stroke="#3B82F6"
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
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
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {appointmentTypes.map((type) => (
                <div key={type.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-gray-600">{type.name}</span>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="slot"
                    stroke="#9CA3AF"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value) => [value, "Patients"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                    }}
                  />
                  <Bar dataKey="patients" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
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
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Doctor
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Patients
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Revenue
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Avg/Patient
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doctorPerformance.map((doc) => (
                  <tr key={doc.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                          {doc.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <span className="font-medium text-gray-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{doc.patients}</td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {formatCurrency(doc.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {formatCurrency(Math.round(doc.revenue / doc.patients))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-amber-600">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="department" stroke="#9CA3AF" fontSize={12} />
                <YAxis
                  yAxisId="left"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                  }}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar yAxisId="right" dataKey="patients" fill="#10B981" radius={[4, 4, 0, 0]} name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
