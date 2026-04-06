import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Package,
  TrendingDown,
  ShoppingCart,
  Search,
  Pill,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LowStockItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  lastRestocked: string;
  supplier: string;
  reorderQuantity: number;
}

const mockLowStockItems: LowStockItem[] = [
  {
    id: "MED002",
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    currentStock: 80,
    minStockLevel: 100,
    unit: "Capsule",
    lastRestocked: "2024-01-15",
    supplier: "Sun Pharma Distributors",
    reorderQuantity: 200,
  },
  {
    id: "MED005",
    name: "Cetirizine 10mg",
    genericName: "Cetirizine HCl",
    category: "Antihistamine",
    currentStock: 45,
    minStockLevel: 50,
    unit: "Tablet",
    lastRestocked: "2024-02-01",
    supplier: "Cipla Healthcare",
    reorderQuantity: 150,
  },
  {
    id: "MED008",
    name: "Insulin Glargine",
    genericName: "Insulin",
    category: "Antidiabetic",
    currentStock: 12,
    minStockLevel: 30,
    unit: "Vial",
    lastRestocked: "2024-01-20",
    supplier: "Sanofi India",
    reorderQuantity: 50,
  },
  {
    id: "MED012",
    name: "Amlodipine 5mg",
    genericName: "Amlodipine Besylate",
    category: "Antihypertensive",
    currentStock: 25,
    minStockLevel: 75,
    unit: "Tablet",
    lastRestocked: "2024-01-25",
    supplier: "Lupin Pharmaceuticals",
    reorderQuantity: 200,
  },
  {
    id: "MED015",
    name: "Diclofenac Gel",
    genericName: "Diclofenac",
    category: "Analgesic",
    currentStock: 8,
    minStockLevel: 20,
    unit: "Tube",
    lastRestocked: "2024-02-05",
    supplier: "Novartis India",
    reorderQuantity: 30,
  },
];

export function PharmacyLowStockPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredItems = mockLowStockItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalCount = mockLowStockItems.filter(
    (item) => item.currentStock < item.minStockLevel * 0.5
  ).length;

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((i) => i.id));
    }
  };

  const getStockLevel = (current: number, min: number) => {
    const percentage = (current / min) * 100;
    if (percentage < 50) return "critical";
    if (percentage < 80) return "low";
    return "warning";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Low Stock Alerts</h1>
          <p className="text-slate-500">Items below minimum stock level</p>
        </div>
        <div className="flex gap-2">
          <Link to="/pharmacy/purchases/new">
            <Button variant="outline" className="gap-2">
              <ShoppingCart size={16} />
              Create Purchase Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Low Stock</p>
              <p className="text-2xl font-bold text-amber-600">{mockLowStockItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Critical Level</p>
              <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Selected for Order</p>
              <p className="text-2xl font-bold text-blue-600">{selectedItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search items..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {selectedItems.length > 0 && (
          <Button
            className="gap-2"
            onClick={() =>
              navigate(
                `/pharmacy/purchases?new=true&items=${encodeURIComponent(selectedItems.join(","))}`
              )
            }
          >
            <ShoppingCart size={16} />
            Order Selected ({selectedItems.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={selectAll}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Medicine</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Category</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Stock Status</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Supplier</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Reorder Qty</th>
                <th className="text-right text-sm font-medium text-slate-600 px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => {
                const level = getStockLevel(item.currentStock, item.minStockLevel);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          level === "critical" ? "bg-red-100" : "bg-amber-100"
                        )}>
                          <Pill className={cn(
                            "h-5 w-5",
                            level === "critical" ? "text-red-600" : "text-amber-600"
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.genericName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">{item.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium",
                            level === "critical" ? "text-red-600" : "text-amber-600"
                          )}>
                            {item.currentStock}
                          </span>
                          <span className="text-slate-400">/ {item.minStockLevel} {item.unit}s</span>
                        </div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              level === "critical" ? "bg-red-500" : "bg-amber-500"
                            )}
                            style={{ width: `${Math.min((item.currentStock / item.minStockLevel) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{item.supplier}</td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{item.reorderQuantity}</td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() =>
                          navigate(
                            `/pharmacy/purchases?new=true&items=${encodeURIComponent(item.id)}`
                          )
                        }
                      >
                        Order <ArrowRight size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
