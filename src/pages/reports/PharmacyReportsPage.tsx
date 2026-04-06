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
  Package,
  TrendingUp,
  AlertTriangle,
  IndianRupee,
  Pill,
  ShoppingCart,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

// Mock data for Pharmacy reports
const salesTrend = [
  { date: "Mon", sales: 45000, prescriptions: 85 },
  { date: "Tue", sales: 52000, prescriptions: 98 },
  { date: "Wed", sales: 48000, prescriptions: 92 },
  { date: "Thu", sales: 61000, prescriptions: 115 },
  { date: "Fri", sales: 55000, prescriptions: 105 },
  { date: "Sat", sales: 72000, prescriptions: 135 },
  { date: "Sun", sales: 28000, prescriptions: 52 },
];

const monthlySales = [
  { month: "Jan", sales: 850000, cost: 620000, profit: 230000 },
  { month: "Feb", sales: 920000, cost: 680000, profit: 240000 },
  { month: "Mar", sales: 1050000, cost: 750000, profit: 300000 },
  { month: "Apr", sales: 980000, cost: 710000, profit: 270000 },
  { month: "May", sales: 1120000, cost: 820000, profit: 300000 },
  { month: "Jun", sales: 1200000, cost: 870000, profit: 330000 },
];

const categoryDistribution = [
  { category: "Antibiotics", sales: 285000, items: 1250, color: "#3B82F6" },
  { category: "Cardiac", sales: 220000, items: 680, color: "#EF4444" },
  { category: "Analgesics", sales: 195000, items: 2100, color: "#10B981" },
  { category: "Diabetes", sales: 175000, items: 920, color: "#F59E0B" },
  { category: "Vitamins", sales: 125000, items: 1450, color: "#8B5CF6" },
];

const topSellingMedicines = [
  { name: "Paracetamol 500mg", category: "Analgesics", sales: 1250, revenue: 43750, stock: 2500 },
  { name: "Amoxicillin 500mg", category: "Antibiotics", sales: 890, revenue: 89000, stock: 1200 },
  { name: "Omeprazole 20mg", category: "Gastro", sales: 756, revenue: 56700, stock: 800 },
  { name: "Metformin 500mg", category: "Diabetes", sales: 645, revenue: 32250, stock: 1500 },
  { name: "Amlodipine 5mg", category: "Cardiac", sales: 520, revenue: 36400, stock: 600 },
];

const stockAlerts = [
  { name: "Ciprofloxacin 500mg", type: "low", current: 45, reorder: 100, status: "critical" },
  { name: "Azithromycin 250mg", type: "low", current: 78, reorder: 150, status: "warning" },
  { name: "Insulin Glargine", type: "expiring", current: 120, expiry: "30 days", status: "warning" },
  { name: "Vitamin D3", type: "expiring", current: 85, expiry: "15 days", status: "critical" },
  { name: "Pantoprazole 40mg", type: "low", current: 55, reorder: 100, status: "warning" },
];

const supplierPerformance = [
  { name: "MedSupply Corp", orders: 45, onTime: 42, value: 850000, rating: 4.8 },
  { name: "PharmaDist Ltd", orders: 38, onTime: 35, value: 620000, rating: 4.5 },
  { name: "HealthCare Wholesale", orders: 32, onTime: 30, value: 480000, rating: 4.6 },
  { name: "MediCare Distributors", orders: 28, onTime: 25, value: 390000, rating: 4.2 },
];

const salesByChannel = [
  { channel: "OPD Prescriptions", value: 45, color: "#3B82F6" },
  { channel: "IPD Dispensing", value: 30, color: "#10B981" },
  { channel: "Walk-in Sales", value: 15, color: "#F59E0B" },
  { channel: "Online Orders", value: 10, color: "#8B5CF6" },
];

export function PharmacyReportsPage() {
  const [dateRange, setDateRange] = useState("This Month");

  const totalSales = salesTrend.reduce((sum, d) => sum + d.sales, 0);
  const totalPrescriptions = salesTrend.reduce((sum, d) => sum + d.prescriptions, 0);
  const monthlyProfit = monthlySales.reduce((sum, m) => sum + m.profit, 0);
  const inventoryValue = 2850000; // Mock value

  const statusColors: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    warning: "bg-amber-100 text-amber-800",
    normal: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Reports</h1>
          <p className="text-gray-500">Sales, inventory, and performance analytics</p>
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
                <IndianRupee className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Weekly Sales</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
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
                <p className="text-sm text-gray-500">Total Profit (6M)</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyProfit)}</p>
                <p className="text-xs text-green-600">+18% YoY</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{totalPrescriptions}</p>
                <p className="text-xs text-gray-500">This week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(inventoryValue)}</p>
                <p className="text-xs text-gray-500">1,245 items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Sales Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily Sales & Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis
                    yAxisId="left"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "sales" ? formatCurrency(Number(value)) : value,
                      name === "sales" ? "Sales" : "Prescriptions",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#salesGradient)"
                    name="Sales"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="prescriptions"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981" }}
                    name="Prescriptions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Profit Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Sales & Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value))]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                    }}
                  />
                  <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Sales" />
                  <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales by Channel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sales by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByChannel}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {salesByChannel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {salesByChannel.map((channel) => (
                <div key={channel.channel} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: channel.color }}
                    />
                    <span className="text-gray-600">{channel.channel}</span>
                  </div>
                  <span className="font-medium">{channel.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    type="number"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    stroke="#9CA3AF"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Sales"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                    }}
                  />
                  <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Stock Alerts</CardTitle>
            <Badge className="bg-red-100 text-red-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {stockAlerts.filter((a) => a.status === "critical").length} Critical
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Medicine
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Alert Type
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Current Stock
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Threshold/Expiry
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stockAlerts.map((alert) => (
                  <tr key={alert.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{alert.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{alert.type} stock</td>
                    <td className="px-4 py-3 text-right text-gray-900">{alert.current} units</td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {alert.type === "low" ? `${alert.reorder} (reorder)` : alert.expiry}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusColors[alert.status]}>{alert.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Medicines */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Selling Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Medicine
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Units Sold
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Revenue
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Current Stock
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topSellingMedicines.map((med, index) => (
                  <tr key={med.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{med.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{med.category}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{med.sales}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(med.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          med.stock < 700 ? "text-amber-600 font-medium" : "text-gray-900"
                        }
                      >
                        {med.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Supplier Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Supplier
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Total Orders
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    On-Time Delivery
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Total Value
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {supplierPerformance.map((supplier) => {
                  const onTimePercent = Math.round((supplier.onTime / supplier.orders) * 100);
                  return (
                    <tr key={supplier.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{supplier.name}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{supplier.orders}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={
                            onTimePercent >= 90 ? "text-green-600" : "text-amber-600"
                          }
                        >
                          {onTimePercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {formatCurrency(supplier.value)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          ⭐ {supplier.rating}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
