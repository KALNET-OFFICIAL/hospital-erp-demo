import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  Calendar,
  FileText,
  Building2,
  Hash,
  IndianRupee,
  Check,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { format } from "date-fns";
import { medicines as mockMedicines, suppliers as mockSuppliers } from "@/lib/mock-data";
import type { Supplier } from "@/types";

interface GRNItem {
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  expiryDate: string;
  mrp: number;
}

interface GRN {
  id: string;
  grnNumber: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  receivedDate: string;
  items: GRNItem[];
  totalAmount: number;
  status: "draft" | "received" | "verified";
  notes: string;
}

const mockGRNs: GRN[] = [
  {
    id: "GRN001",
    grnNumber: "GRN-2024-001",
    supplierId: "SUP001",
    supplierName: "MedSupply Corp",
    invoiceNumber: "INV-4521",
    invoiceDate: "2024-01-15",
    receivedDate: "2024-01-16",
    items: [
      {
        medicineId: "M001",
        medicineName: "Paracetamol 500mg",
        batchNumber: "BAT2024001",
        quantity: 500,
        unitPrice: 2.5,
        expiryDate: "2025-06-15",
        mrp: 3.5,
      },
      {
        medicineId: "M002",
        medicineName: "Amoxicillin 250mg",
        batchNumber: "BAT2024002",
        quantity: 200,
        unitPrice: 8.0,
        expiryDate: "2025-03-20",
        mrp: 12.0,
      },
    ],
    totalAmount: 2850,
    status: "verified",
    notes: "Regular monthly stock",
  },
  {
    id: "GRN002",
    grnNumber: "GRN-2024-002",
    supplierId: "SUP002",
    supplierName: "PharmaDist Ltd",
    invoiceNumber: "PD-8872",
    invoiceDate: "2024-01-18",
    receivedDate: "2024-01-19",
    items: [
      {
        medicineId: "M003",
        medicineName: "Omeprazole 20mg",
        batchNumber: "BAT2024003",
        quantity: 300,
        unitPrice: 5.0,
        expiryDate: "2025-08-10",
        mrp: 7.5,
      },
    ],
    totalAmount: 1500,
    status: "received",
    notes: "",
  },
];

function getSuppliersFromStorage(): Supplier[] {
  const stored = localStorage.getItem("hos_suppliers");
  if (stored) {
    return JSON.parse(stored);
  }
  return mockSuppliers;
}

function getMedicinesFromStorage() {
  const stored = localStorage.getItem("hos_medicines_inventory");
  if (stored) {
    const meds = JSON.parse(stored) as Array<{ id: string; name: string }>;
    return meds.map((med) => ({ id: med.id, name: med.name }));
  }
  return mockMedicines.map((med) => ({ id: med.id, name: med.name }));
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  received: "bg-blue-100 text-blue-800",
  verified: "bg-green-100 text-green-800",
};

export function StockIntakePage() {
  const suppliers = useMemo(() => getSuppliersFromStorage(), []);
  const medicines = useMemo(() => getMedicinesFromStorage(), []);
  const [grns, setGrns] = useState<GRN[]>(mockGRNs);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);

  const [newGRN, setNewGRN] = useState<{
    supplierId: string;
    invoiceNumber: string;
    invoiceDate: string;
    items: GRNItem[];
    notes: string;
  }>({
    supplierId: "",
    invoiceNumber: "",
    invoiceDate: "",
    items: [],
    notes: "",
  });

  const [newItem, setNewItem] = useState<Partial<GRNItem>>({
    medicineId: "",
    batchNumber: "",
    quantity: 0,
    unitPrice: 0,
    expiryDate: "",
    mrp: 0,
  });
  const [formError, setFormError] = useState("");

  const stats = {
    total: grns.length,
    draft: grns.filter((g) => g.status === "draft").length,
    received: grns.filter((g) => g.status === "received").length,
    verified: grns.filter((g) => g.status === "verified").length,
    totalValue: grns.reduce((sum, g) => sum + g.totalAmount, 0),
  };

  const filteredGRNs = grns.filter(
    (grn) =>
      grn.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItemToGRN = () => {
    const trimmedBatchNumber = (newItem.batchNumber ?? "").trim();
    if (!newItem.medicineId || !trimmedBatchNumber || !newItem.quantity) {
      setFormError("Select medicine, batch number, and quantity before adding item.");
      return;
    }
    if ((newItem.quantity || 0) <= 0) {
      setFormError("Quantity must be greater than 0.");
      return;
    }

    const medicine = medicines.find((m) => m.id === newItem.medicineId);
    if (!medicine) {
      setFormError("Selected medicine is invalid. Please reselect.");
      return;
    }
    const item: GRNItem = {
      medicineId: newItem.medicineId!,
      medicineName: medicine?.name || "",
      batchNumber: trimmedBatchNumber,
      quantity: newItem.quantity!,
      unitPrice: newItem.unitPrice || 0,
      expiryDate: newItem.expiryDate || "",
      mrp: newItem.mrp || 0,
    };

    setNewGRN((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));
    setFormError("");

    setNewItem({
      medicineId: "",
      batchNumber: "",
      quantity: 0,
      unitPrice: 0,
      expiryDate: "",
      mrp: 0,
    });
  };

  const removeItemFromGRN = (index: number) => {
    setNewGRN((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleCreateGRN = () => {
    if (!newGRN.supplierId || !newGRN.invoiceNumber.trim() || newGRN.items.length === 0) {
      setFormError("Supplier, invoice number, and at least one item are required.");
      return;
    }

    const supplier = suppliers.find((s) => s.id === newGRN.supplierId);
    const totalAmount = newGRN.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const grn: GRN = {
      id: `GRN${String(grns.length + 1).padStart(3, "0")}`,
      grnNumber: `GRN-2024-${String(grns.length + 1).padStart(3, "0")}`,
      supplierId: newGRN.supplierId,
      supplierName: supplier?.name || "",
      invoiceNumber: newGRN.invoiceNumber,
      invoiceDate: newGRN.invoiceDate,
      receivedDate: format(new Date(), "yyyy-MM-dd"),
      items: newGRN.items,
      totalAmount,
      status: "draft",
      notes: newGRN.notes,
    };

    setGrns((prev) => [grn, ...prev]);
    setShowAddModal(false);
    setFormError("");
    setNewGRN({
      supplierId: "",
      invoiceNumber: "",
      invoiceDate: "",
      items: [],
      notes: "",
    });
  };

  const handleVerify = (grn: GRN) => {
    setGrns((prev) =>
      prev.map((g) => (g.id === grn.id ? { ...g, status: "verified" as const } : g))
    );
  };

  const handleMarkReceived = (grn: GRN) => {
    setGrns((prev) =>
      prev.map((g) => (g.id === grn.id ? { ...g, status: "received" as const } : g))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Intake (GRN)</h1>
          <p className="text-gray-500 mt-1">
            Use this page only after supplier dispatch/arrival. Raise orders from Purchase Orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/pharmacy/purchases?new=true">
            <Button variant="outline">Create Purchase Order</Button>
          </Link>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New GRN
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total GRNs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              <p className="text-sm text-gray-500">Draft</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.received}</p>
              <p className="text-sm text-gray-500">Received</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              <p className="text-sm text-gray-500">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <IndianRupee className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats.totalValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by GRN number, supplier, or invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* GRN Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  GRN Number
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Received Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredGRNs.map((grn) => (
                <tr key={grn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{grn.grnNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{grn.supplierName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-900">{grn.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(grn.invoiceDate), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {format(new Date(grn.receivedDate), "MMM d, yyyy")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{grn.items.length} items</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">
                      ₹{grn.totalAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={statusColors[grn.status]}>{grn.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedGRN(grn);
                          setShowViewModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {grn.status === "draft" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkReceived(grn)}
                        >
                          Mark Received
                        </Button>
                      )}
                      {grn.status === "received" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                          onClick={() => handleVerify(grn)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add GRN Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewGRN({
            supplierId: "",
            invoiceNumber: "",
            invoiceDate: "",
            items: [],
            notes: "",
          });
        }}
        title="Create New GRN"
      >
        <ModalBody>
          <div className="space-y-6">
            {/* Supplier & Invoice Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <select
                  value={newGRN.supplierId}
                  onChange={(e) => setNewGRN({ ...newGRN, supplierId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={newGRN.invoiceNumber}
                  onChange={(e) => setNewGRN({ ...newGRN, invoiceNumber: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter invoice number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
              <input
                type="date"
                value={newGRN.invoiceDate}
                onChange={(e) => setNewGRN({ ...newGRN, invoiceDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Add Items Section */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Add Items</h4>
              <p className="mb-3 text-xs text-slate-500">
                Add each received batch item, then click <span className="font-medium">Add Item</span>.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <select
                    value={newItem.medicineId}
                    onChange={(e) => setNewItem({ ...newItem, medicineId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select medicine...</option>
                    {medicines.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Batch No."
                    value={newItem.batchNumber}
                    onChange={(e) => setNewItem({ ...newItem, batchNumber: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Qty"
                    value={newItem.quantity || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <input
                    type="number"
                    placeholder="Unit Price"
                    value={newItem.unitPrice || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="MRP"
                    value={newItem.mrp || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, mrp: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    placeholder="Expiry Date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addItemToGRN}
                disabled={!newItem.medicineId || !newItem.batchNumber || !newItem.quantity}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {/* Items List */}
            {newGRN.items.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Items ({newGRN.items.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {newGRN.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{item.medicineName}</p>
                        <p className="text-xs text-gray-500">
                          Batch: {item.batchNumber} | Qty: {item.quantity} | ₹{item.unitPrice}/unit
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">
                          ₹{(item.quantity * item.unitPrice).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => removeItemFromGRN(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">
                    ₹
                    {newGRN.items
                      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={newGRN.notes}
                onChange={(e) => setNewGRN({ ...newGRN, notes: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes..."
              />
            </div>
            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowAddModal(false);
              setNewGRN({
                supplierId: "",
                invoiceNumber: "",
                invoiceDate: "",
                items: [],
                notes: "",
              });
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGRN}
            disabled={
              !newGRN.supplierId || !newGRN.invoiceNumber || newGRN.items.length === 0
            }
          >
            Create GRN
          </Button>
        </ModalFooter>
      </Modal>

      {/* View GRN Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedGRN(null);
        }}
        title={`GRN Details - ${selectedGRN?.grnNumber}`}
      >
        <ModalBody>
          {selectedGRN && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="font-medium text-gray-900">{selectedGRN.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Invoice</p>
                  <p className="font-medium text-gray-900">{selectedGRN.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Invoice Date</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(selectedGRN.invoiceDate), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Received Date</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(selectedGRN.receivedDate), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={statusColors[selectedGRN.status]}>{selectedGRN.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-bold text-gray-900">
                    ₹{selectedGRN.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                <div className="space-y-2">
                  {selectedGRN.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{item.medicineName}</p>
                        <p className="text-xs text-gray-500">
                          Batch: {item.batchNumber} | Expiry:{" "}
                          {format(new Date(item.expiryDate), "MMM yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {item.quantity} × ₹{item.unitPrice}
                        </p>
                        <p className="text-sm text-gray-500">
                          = ₹{(item.quantity * item.unitPrice).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedGRN.notes && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-900">{selectedGRN.notes}</p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowViewModal(false);
              setSelectedGRN(null);
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
