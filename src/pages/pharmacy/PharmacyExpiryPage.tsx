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
import type { BadgeProps } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
type ExpiryUrgency = "expired" | "critical" | "warning" | "upcoming";

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

  const getExpiryStatus = (
    expiryDate: string
  ): { label: string; variant: BadgeProps["variant"]; urgency: ExpiryUrgency } => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days <= 0) return { label: "Expired", variant: "danger", urgency: "expired" };
    if (days <= 30) return { label: `${days} days`, variant: "danger", urgency: "critical" };
    if (days <= 60) return { label: `${days} days`, variant: "serious", urgency: "warning" };
    return { label: `${days} days`, variant: "warning", urgency: "upcoming" };
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
          <h1 className="text-2xl font-bold text-ink">Expiry Alerts</h1>
          <p className="text-ink-muted">Medicines expiring within 90 days</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-paper rounded-xl border border-line p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Calendar className="h-5 w-5 text-ink-muted" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Total Expiring</p>
              <p className="text-2xl font-bold text-ink">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-paper rounded-xl border border-line p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-50">
              <AlertTriangle className="h-5 w-5 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Expired</p>
              <p className="text-2xl font-bold text-danger-600">{stats.expired}</p>
            </div>
          </div>
        </div>
        <div className="bg-paper rounded-xl border border-line p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-serious-50">
              <Clock className="h-5 w-5 text-serious-600" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Critical ({"<"}30 days)</p>
              <p className="text-2xl font-bold text-serious-600">{stats.critical}</p>
            </div>
          </div>
        </div>
        <div className="bg-paper rounded-xl border border-line p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50">
              <Package className="h-5 w-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Total Value at Risk</p>
              <p className="text-2xl font-bold text-warning-600">₹{stats.totalValue.toLocaleString()}</p>
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
      <div className="bg-paper rounded-xl border border-line overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Time Left</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              const status = getExpiryStatus(item.expiryDate);
              const isSevere = status.urgency === "expired" || status.urgency === "critical";
              return (
                <TableRow key={`${item.id}-${item.batchNumber}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          isSevere ? "bg-danger-50" : "bg-serious-50"
                        )}
                      >
                        <Pill
                          className={cn(
                            "h-5 w-5",
                            isSevere ? "text-danger-600" : "text-serious-600"
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-ink">{item.name}</p>
                        <p className="text-sm text-ink-muted">{item.genericName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-ink-muted">{item.batchNumber}</p>
                    <p className="text-xs text-ink-muted">{item.location}</p>
                  </TableCell>
                  <TableCell className="text-ink-muted">
                    {format(new Date(item.expiryDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-ink">
                    {item.quantity} {item.unit}s
                  </TableCell>
                  <TableCell className="text-ink font-medium">
                    ₹{(item.quantity * item.unitPrice).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                      onClick={() => setShowDisposeModal(item)}
                    >
                      <Trash2 size={14} /> Dispose
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
              <div className="p-4 bg-danger-50 rounded-lg border border-danger-200">
                <p className="text-danger-800 font-medium">{showDisposeModal.name}</p>
                <p className="text-sm text-danger-600">Batch: {showDisposeModal.batchNumber}</p>
              </div>
              <p className="text-ink-muted">
                This will mark <strong>{showDisposeModal.quantity} {showDisposeModal.unit}s</strong> as
                disposed. This action cannot be undone.
              </p>
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-1.5">
                  Reason for Disposal
                </label>
                <select className="w-full rounded-lg border border-line bg-paper text-ink px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                  <option value="expired">Expired</option>
                  <option value="damaged">Damaged</option>
                  <option value="recalled">Recalled by Manufacturer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-1.5">
                  Notes
                </label>
                <textarea
                  className="w-full rounded-lg border border-line bg-paper text-ink px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
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
