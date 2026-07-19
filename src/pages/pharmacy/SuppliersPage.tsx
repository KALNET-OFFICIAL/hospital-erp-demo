import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit2,
  Archive,
  MoreVertical,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  ShoppingCart,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { suppliers as mockSuppliers, purchaseOrders } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { getIdentityColor, getCurrentThemeMode } from "@/lib/theme";
import type { Supplier } from "@/types";

// Get suppliers from localStorage or mock data
function getSuppliersFromStorage(): Supplier[] {
  const stored = localStorage.getItem("hos_suppliers");
  if (stored) {
    return JSON.parse(stored);
  }
  return mockSuppliers;
}

// Save suppliers to localStorage
function saveSuppliersToStorage(supplierList: Supplier[]) {
  localStorage.setItem("hos_suppliers", JSON.stringify(supplierList));
}

export default function SuppliersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [supplierList, setSupplierList] = useState<Supplier[]>(getSuppliersFromStorage);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const isCreateRoute = location.pathname.endsWith("/pharmacy/suppliers/new");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    gstNumber: "",
    paymentTerms: "Net 30",
  });

  const filteredSuppliers = supplierList.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone.includes(searchQuery);
    return matchesSearch;
  });

  const handleAddSupplier = () => {
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      gstNumber: "",
      paymentTerms: "Net 30",
    });
    setEditingSupplier(null);
    setShowAddModal(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email || "",
      address: supplier.address,
      gstNumber: supplier.gstNumber || "",
      paymentTerms: supplier.paymentTerms || "Net 30",
    });
    setEditingSupplier(supplier);
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    let updatedSuppliers: Supplier[];
    
    if (editingSupplier) {
      updatedSuppliers = supplierList.map((s) =>
        s.id === editingSupplier.id
          ? {
              ...s,
              ...formData,
            }
          : s
      );
    } else {
      const newSupplier: Supplier = {
        id: `SUP${Date.now()}`,
        name: formData.name,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address,
        gstNumber: formData.gstNumber || undefined,
        paymentTerms: formData.paymentTerms,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      updatedSuppliers = [...supplierList, newSupplier];
    }
    
    setSupplierList(updatedSuppliers);
    saveSuppliersToStorage(updatedSuppliers);
    setShowAddModal(false);
    if (isCreateRoute) {
      navigate("/pharmacy/suppliers");
    }
  };

  useEffect(() => {
    if (isCreateRoute) {
      setEditingSupplier(null);
      setFormData({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        gstNumber: "",
        paymentTerms: "Net 30",
      });
      setShowAddModal(true);
    }
  }, [isCreateRoute]);

  const toggleSupplierStatus = (supplierId: string) => {
    const updatedSuppliers = supplierList.map((s) =>
      s.id === supplierId ? { ...s, isActive: !s.isActive } : s
    );
    setSupplierList(updatedSuppliers);
    saveSuppliersToStorage(updatedSuppliers);
  };

  // Get order stats for supplier
  const getSupplierStats = (supplierId: string) => {
    const orders = purchaseOrders.filter((po) => po.supplierId === supplierId);
    const totalOrders = orders.length;
    const totalValue = orders.reduce((sum, po) => sum + po.total, 0);
    const pendingOrders = orders.filter((po) => po.status === "ordered" || po.status === "partial").length;
    return { totalOrders, totalValue, pendingOrders };
  };

  // Overall stats
  const totalSuppliers = supplierList.filter((s) => s.isActive).length;
  const totalPOs = purchaseOrders.length;
  const pendingPOs = purchaseOrders.filter((po) => po.status === "ordered").length;
  const totalPurchaseValue = purchaseOrders.reduce((sum, po) => sum + po.total, 0);

  const themeMode = getCurrentThemeMode();
  const totalSuppliersAccent = getIdentityColor("Total Suppliers", themeMode);
  const totalValueAccent = getIdentityColor("Total Value", themeMode);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {isCreateRoute ? "Add New Supplier" : "Suppliers"}
          </h1>
          <p className="text-ink-muted mt-1">
            {isCreateRoute
              ? "Create a supplier profile for medicine procurement and purchase orders"
              : "Manage medicine suppliers and vendors"}
          </p>
        </div>
        {!isCreateRoute ? (
          <Button onClick={handleAddSupplier}>
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        ) : (
          <Button variant="outline" onClick={() => navigate("/pharmacy/suppliers")}>
            Back to Suppliers
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted">Total Suppliers</p>
              <p className="text-2xl font-bold text-ink">{totalSuppliers}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${totalSuppliersAccent}1f` }}
            >
              <Building className="w-5 h-5" style={{ color: totalSuppliersAccent }} />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted">Total POs</p>
              <p className="text-2xl font-bold text-ink">{totalPOs}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-success-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted">Pending POs</p>
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
              <p className="text-sm text-ink-muted">Total Value</p>
              <p className="text-2xl font-bold text-ink">{formatCurrency(totalPurchaseValue)}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${totalValueAccent}1f` }}
            >
              <FileText className="w-5 h-5" style={{ color: totalValueAccent }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search suppliers by name, contact, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => {
          const stats = getSupplierStats(supplier.id);
          return (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              stats={stats}
              onEdit={handleEditSupplier}
              onView={() => setSelectedSupplier(supplier)}
            />
          );
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-ink-muted">No suppliers found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          if (isCreateRoute) {
            navigate("/pharmacy/suppliers");
          }
        }}
        title={editingSupplier ? "Edit Supplier" : "Add New Supplier"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Supplier Name *"
              placeholder="e.g., MedPharm Distributors"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Contact Person *"
              placeholder="e.g., John Doe"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone *"
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="contact@supplier.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <Input
            label="Address"
            placeholder="Full address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="GST Number"
              placeholder="27AABCS1234A1ZJ"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
            />
            <Select
              label="Payment Terms"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            >
              <option value="COD">Cash on Delivery</option>
              <option value="Net 15">Net 15 Days</option>
              <option value="Net 30">Net 30 Days</option>
              <option value="Net 45">Net 45 Days</option>
              <option value="Net 60">Net 60 Days</option>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                if (isCreateRoute) {
                  navigate("/pharmacy/suppliers");
                }
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingSupplier ? "Update Supplier" : "Add Supplier"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Supplier Details Modal */}
      <Modal
        isOpen={!!selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
        title={selectedSupplier?.name || "Supplier Details"}
      >
        {selectedSupplier && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-ink-muted">
                <Phone className="w-4 h-4" />
                <span>{selectedSupplier.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <Mail className="w-4 h-4" />
                <span>{selectedSupplier.email}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-ink-muted">
              <MapPin className="w-4 h-4 mt-0.5" />
              <span>{selectedSupplier.address}</span>
            </div>
            <div className="pt-4 border-t border-line">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-ink-muted">GST Number</p>
                  <p className="font-medium">{selectedSupplier.gstNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-ink-muted">Payment Terms</p>
                  <p className="font-medium">{selectedSupplier.paymentTerms}</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="pt-4 border-t border-line">
              <h3 className="font-medium mb-3">Recent Purchase Orders</h3>
              <div className="space-y-2">
                {purchaseOrders
                  .filter((po) => po.supplierId === selectedSupplier.id)
                  .slice(0, 3)
                  .map((po) => (
                    <div key={po.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">{po.id}</p>
                        <p className="text-xs text-ink-muted">{po.orderDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(po.total)}</p>
                        <Badge
                          variant={
                            po.status === "received"
                              ? "success"
                              : po.status === "ordered"
                              ? "warning"
                              : "primary"
                          }
                        >
                          {po.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <Button variant="outline" onClick={() => setSelectedSupplier(null)}>
                Close
              </Button>
              <Button>
                <ShoppingCart className="w-4 h-4 mr-2" />
                New Purchase Order
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Supplier Card Component
function SupplierCard({
  supplier,
  stats,
  onEdit,
  onView,
}: {
  supplier: Supplier;
  stats: { totalOrders: number; totalValue: number; pendingOrders: number };
  onEdit: (s: Supplier) => void;
  onView: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const supplierAccent = getIdentityColor(supplier.name, getCurrentThemeMode());

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <div className="flex items-start justify-between" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${supplierAccent}1f` }}
          >
            <Building className="w-6 h-6" style={{ color: supplierAccent }} />
          </div>
          <div>
            <h3 className="font-semibold text-ink">{supplier.name}</h3>
            <p className="text-sm text-ink-muted">{supplier.contactPerson}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-hover rounded"
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-paper rounded-lg shadow-lg border border-line py-1 z-10 min-w-32">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(supplier);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center gap-2 text-warning-600"
              >
                <Archive className="w-4 h-4" /> Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <Phone className="w-3 h-3" />
          <span>{supplier.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <Mail className="w-3 h-3" />
          <span className="truncate">{supplier.email}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-line grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-semibold text-ink">{stats.totalOrders}</p>
          <p className="text-xs text-ink-muted">Orders</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-warning-600">{stats.pendingOrders}</p>
          <p className="text-xs text-ink-muted">Pending</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-primary-600">{formatCurrency(stats.totalValue)}</p>
          <p className="text-xs text-ink-muted">Value</p>
        </div>
      </div>

      {/* Payment Terms Badge */}
      <div className="mt-3 flex items-center justify-between">
        <Badge variant="primary">{supplier.paymentTerms}</Badge>
        <div className="flex items-center gap-1 text-success-600 text-xs">
          <CheckCircle className="w-3 h-3" />
          Active
        </div>
      </div>
    </Card>
  );
}
