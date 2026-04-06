import { useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  CheckCircle,
  Clock,
  Package,
  Truck,
  AlertCircle,
  Filter,
  Calendar,
  IndianRupee,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { purchaseOrders, suppliers, medicines } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PurchaseOrder, PurchaseOrderItem } from "@/types";

const statusConfig: Record<string, { label: string; variant: "primary" | "success" | "warning" | "danger"; icon: React.ReactNode }> = {
  draft: { label: "Draft", variant: "primary", icon: <Edit2 className="w-3 h-3" /> },
  ordered: { label: "Ordered", variant: "warning", icon: <Clock className="w-3 h-3" /> },
  partial: { label: "Partial", variant: "warning", icon: <Package className="w-3 h-3" /> },
  received: { label: "Received", variant: "success", icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: "Cancelled", variant: "danger", icon: <AlertCircle className="w-3 h-3" /> },
};

export default function PurchaseOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  // Form state for new PO
  const [formData, setFormData] = useState({
    supplierId: "",
    expectedDate: "",
    notes: "",
    items: [] as { medicineId: string; medicineName: string; quantity: number; unitPrice: number }[],
  });

  // New item form
  const [newItem, setNewItem] = useState({
    medicineId: "",
    quantity: "",
    unitPrice: "",
  });

  useEffect(() => {
    if (searchParams.get("new") !== "true") {
      return;
    }

    const itemIdsParam = searchParams.get("items");
    const itemIds = itemIdsParam
      ? itemIdsParam.split(",").map((id) => decodeURIComponent(id).trim()).filter(Boolean)
      : [];

    const presetItems = medicines
      .filter((med) => itemIds.includes(med.id))
      .map((med) => ({
        medicineId: med.id,
        medicineName: med.name,
        quantity: 1,
        unitPrice: med.unitPrice,
      }));

    setFormData((prev) => ({
      ...prev,
      items: presetItems,
    }));
    setShowCreateModal(true);
    setSearchParams({});
  }, [searchParams, setSearchParams]);

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || po.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePO = () => {
    setFormData({
      supplierId: "",
      expectedDate: "",
      notes: "",
      items: [],
    });
    setShowCreateModal(true);
  };

  const handleAddItem = () => {
    if (!newItem.medicineId || !newItem.quantity || !newItem.unitPrice) return;

    const medicine = medicines.find((m) => m.id === newItem.medicineId);
    if (!medicine) return;

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          medicineId: newItem.medicineId,
          medicineName: medicine.name,
          quantity: parseInt(newItem.quantity),
          unitPrice: parseFloat(newItem.unitPrice),
        },
      ],
    });

    setNewItem({ medicineId: "", quantity: "", unitPrice: "" });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmitPO = () => {
    console.log("Creating PO:", formData);
    setShowCreateModal(false);
  };

  const handleReceiveStock = () => {
    console.log("Receiving stock for:", selectedPO?.id);
    setShowReceiveModal(false);
    setSelectedPO(null);
  };

  // Calculate totals
  const calculateSubtotal = (items: { quantity: number; unitPrice: number }[]) => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  // Stats
  const totalPOs = purchaseOrders.length;
  const pendingPOs = purchaseOrders.filter((po) => po.status === "ordered").length;
  const receivedPOs = purchaseOrders.filter((po) => po.status === "received").length;
  const totalValue = purchaseOrders.reduce((sum, po) => sum + po.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 mt-1">
            Step 1: Create purchase order. Step 2: Receive goods in Add Stock (GRN).
          </p>
        </div>
        <Button onClick={handleCreatePO}>
          <Plus className="w-4 h-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalPOs}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-warning-600">{pendingPOs}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Received</p>
              <p className="text-2xl font-bold text-success-600">{receivedPOs}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by PO number or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-40"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="ordered">Ordered</option>
            <option value="partial">Partial</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </Card>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "ordered", "partial", "received"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedStatus === status
                ? "bg-primary-100 text-primary-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status === "all" ? "All" : statusConfig[status]?.label || status}
            <span className="ml-2 text-xs">
              ({status === "all" ? filteredPOs.length : filteredPOs.filter((po) => po.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Purchase Orders List */}
      <div className="space-y-4">
        {filteredPOs.map((po) => (
          <Card key={po.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{po.id}</h3>
                    <Badge
                      variant={statusConfig[po.status]?.variant || "primary"}
                      className="flex items-center gap-1"
                    >
                      {statusConfig[po.status]?.icon}
                      {statusConfig[po.status]?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{po.supplierName}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Ordered: {formatDate(po.orderDate)}
                    </span>
                    {po.expectedDate && (
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Expected: {formatDate(po.expectedDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(po.total)}</p>
                  <p className="text-xs text-gray-500">{po.items.length} items</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPO(po)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {po.status === "ordered" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedPO(po);
                        setShowReceiveModal(true);
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Receive
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredPOs.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No purchase orders found</p>
        </div>
      )}

      {/* Create PO Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Purchase Order"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Supplier *"
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            >
              <option value="">Select Supplier</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </Select>
            <Input
              label="Expected Date"
              type="date"
              value={formData.expectedDate}
              onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
            />
          </div>

          {/* Add Item */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Add Items</h4>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <Select
                  value={newItem.medicineId}
                  onChange={(e) => setNewItem({ ...newItem, medicineId: e.target.value })}
                >
                  <option value="">Select Medicine</option>
                  {medicines.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  placeholder="Price"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                />
              </div>
              <div className="col-span-1">
                <Button onClick={handleAddItem} className="w-full">
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Items List */}
          {formData.items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2">Medicine</th>
                    <th className="text-right px-4 py-2">Qty</th>
                    <th className="text-right px-4 py-2">Price</th>
                    <th className="text-right px-4 py-2">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{item.medicineName}</td>
                      <td className="text-right px-4 py-2">{item.quantity}</td>
                      <td className="text-right px-4 py-2">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right px-4 py-2 font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                      <td className="px-2">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-danger-500 hover:text-danger-700"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-50">
                    <td colSpan={3} className="px-4 py-2 font-medium text-right">
                      Subtotal:
                    </td>
                    <td className="px-4 py-2 font-semibold text-right">
                      {formatCurrency(calculateSubtotal(formData.items))}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPO} disabled={formData.items.length === 0}>
              Create Purchase Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* View PO Modal */}
      <Modal
        isOpen={!!selectedPO && !showReceiveModal}
        onClose={() => setSelectedPO(null)}
        title={`Purchase Order: ${selectedPO?.id}`}
      >
        {selectedPO && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium">{selectedPO.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={statusConfig[selectedPO.status]?.variant || "primary"}>
                  {statusConfig[selectedPO.status]?.label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">{formatDate(selectedPO.orderDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expected Date</p>
                <p className="font-medium">{selectedPO.expectedDate ? formatDate(selectedPO.expectedDate) : "N/A"}</p>
              </div>
            </div>

            {/* Items */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2">Medicine</th>
                    <th className="text-right px-4 py-2">Ordered</th>
                    <th className="text-right px-4 py-2">Received</th>
                    <th className="text-right px-4 py-2">Price</th>
                    <th className="text-right px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPO.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{item.medicineName}</td>
                      <td className="text-right px-4 py-2">{item.quantity}</td>
                      <td className="text-right px-4 py-2">
                        <span className={item.receivedQuantity === item.quantity ? "text-success-600" : "text-warning-600"}>
                          {item.receivedQuantity || 0}
                        </span>
                      </td>
                      <td className="text-right px-4 py-2">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right px-4 py-2 font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-50">
                    <td colSpan={4} className="px-4 py-2 font-medium text-right">
                      Total:
                    </td>
                    <td className="px-4 py-2 font-semibold text-right">
                      {formatCurrency(selectedPO.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedPO(null)}>
                Close
              </Button>
              {selectedPO.status === "ordered" && (
                <Button onClick={() => setShowReceiveModal(true)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Receive Stock
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Receive Stock Modal */}
      <Modal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        title={`Receive Stock: ${selectedPO?.id}`}
      >
        {selectedPO && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Mark received quantities for each item. Leave as-is if fully received.
            </p>

            <div className="space-y-3">
              {selectedPO.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.medicineName}</p>
                    <p className="text-sm text-gray-500">Ordered: {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-24"
                      defaultValue={item.quantity}
                      min={0}
                      max={item.quantity}
                    />
                    <span className="text-sm text-gray-500">received</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowReceiveModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleReceiveStock}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
