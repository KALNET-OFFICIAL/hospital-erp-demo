import { useState } from "react";
import {
  Calendar,
  AlertTriangle,
  Clock,
  Trash2,
  Package,
  Search,
  Pill,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { format, differenceInDays, addDays } from "date-fns";

interface ExpiringItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  location: string;
}

const mockExpiringItems: ExpiringItem[] = [
  {
    id: "MED002",
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    batchNumber: "AMX2024002",
    expiryDate: format(addDays(new Date(), 15), "yyyy-MM-dd"),
    quantity: 80,
    unit: "Capsule",
    unitPrice: 3.0,
    location: "Rack B2",
  },
  {
    id: "MED005",
    name: "Cetirizine 10mg",
    genericName: "Cetirizine HCl",
    category: "Antihistamine",
    batchNumber: "CTZ2024005",
    expiryDate: format(addDays(new Date(), 45), "yyyy-MM-dd"),
    quantity: 45,
    unit: "Tablet",
    unitPrice: 0.8,
    location: "Rack B1",
  },
  {
    id: "MED009",
    name: "Cough Syrup",
    genericName: "Dextromethorphan",
    category: "Cough & Cold",
    batchNumber: "CGH2024009",
    expiryDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    quantity: 25,
    unit: "Bottle",
    unitPrice: 45.0,
    location: "Rack C3",
  },
  {
    id: "MED011",
    name: "Eye Drops",
    genericName: "Sodium Chloride",
    category: "Ophthalmic",
    batchNumber: "EYE2024011",
    expiryDate: format(addDays(new Date(), 60), "yyyy-MM-dd"),
    quantity: 30,
    unit: "Bottle",
    unitPrice: 25.0,
    location: "Rack D1",
  },
  {
    id: "MED014",
    name: "Vitamin B Complex",
    genericName: "B Vitamins",
    category: "Supplements",
    batchNumber: "VIT2024014",
    expiryDate: format(addDays(new Date(), 90), "yyyy-MM-dd"),
    quantity: 100,
    unit: "Tablet",
    unitPrice: 1.5,
    location: "Rack A2",
  },
];

type SortField = "expiryDate" | "quantity" | "value";

export function PharmacyExpiryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("expiryDate");
  const [sortAsc, setSortAsc] = useState(true);
  const [showDisposeModal, setShowDisposeModal] = useState<ExpiringItem | null>(null);

  const filteredItems = [...mockExpiringItems]
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "expiryDate":
          comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
        case "value":
          comparison = a.quantity * a.unitPrice - b.quantity * b.unitPrice;
          break;
      }
      return sortAsc ? comparison : -comparison;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days <= 0) return { label: "Expired", color: "bg-red-100 text-red-700", urgency: "expired" };
    if (days <= 30) return { label: `${days} days`, color: "bg-red-100 text-red-700", urgency: "critical" };
    if (days <= 60) return { label: `${days} days`, color: "bg-amber-100 text-amber-700", urgency: "warning" };
    return { label: `${days} days`, color: "bg-yellow-100 text-yellow-700", urgency: "upcoming" };
  };

  const stats = {
    total: mockExpiringItems.length,
    expired: mockExpiringItems.filter((i) => differenceInDays(new Date(i.expiryDate), new Date()) <= 0).length,
    critical: mockExpiringItems.filter((i) => {
      const days = differenceInDays(new Date(i.expiryDate), new Date());
      return days > 0 && days <= 30;
    }).length,
    totalValue: mockExpiringItems.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expiry Alerts</h1>
          <p className="text-slate-500">Medicines expiring within 90 days</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Expiring</p>
              <p className="text-2xl font-bold text-amber-600">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Expired</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Critical ({"<"}30 days)</p>
              <p className="text-2xl font-bold text-orange-600">{stats.critical}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Value at Risk</p>
              <p className="text-2xl font-bold text-purple-600">₹{stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search medicines or batch..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortField === "expiryDate" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort("expiryDate")}
            className="gap-1"
          >
            Expiry Date <ArrowUpDown size={14} />
          </Button>
          <Button
            variant={sortField === "quantity" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort("quantity")}
            className="gap-1"
          >
            Quantity <ArrowUpDown size={14} />
          </Button>
          <Button
            variant={sortField === "value" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort("value")}
            className="gap-1"
          >
            Value <ArrowUpDown size={14} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Medicine</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Batch</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Expiry Date</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Time Left</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Quantity</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Value</th>
                <th className="text-right text-sm font-medium text-slate-600 px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => {
                const status = getExpiryStatus(item.expiryDate);
                return (
                  <tr key={`${item.id}-${item.batchNumber}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          status.urgency === "expired" || status.urgency === "critical"
                            ? "bg-red-100"
                            : "bg-amber-100"
                        )}>
                          <Pill className={cn(
                            "h-5 w-5",
                            status.urgency === "expired" || status.urgency === "critical"
                              ? "text-red-600"
                              : "text-amber-600"
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.genericName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700">{item.batchNumber}</p>
                      <p className="text-xs text-slate-500">{item.location}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {format(new Date(item.expiryDate), "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2 py-1 rounded text-xs font-medium", status.color)}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900">
                      {item.quantity} {item.unit}s
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">
                      ₹{(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setShowDisposeModal(item)}
                      >
                        <Trash2 size={14} /> Dispose
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispose Modal */}
      <Modal
        isOpen={!!showDisposeModal}
        onClose={() => setShowDisposeModal(null)}
        title="Dispose Medicine"
      >
        <ModalBody>
          {showDisposeModal && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800 font-medium">{showDisposeModal.name}</p>
                <p className="text-sm text-red-600">Batch: {showDisposeModal.batchNumber}</p>
              </div>
              <p className="text-slate-600">
                This will mark <strong>{showDisposeModal.quantity} {showDisposeModal.unit}s</strong> as
                disposed. This action cannot be undone.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Reason for Disposal
                </label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="expired">Expired</option>
                  <option value="damaged">Damaged</option>
                  <option value="recalled">Recalled by Manufacturer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDisposeModal(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => setShowDisposeModal(null)}>
            Confirm Disposal
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
