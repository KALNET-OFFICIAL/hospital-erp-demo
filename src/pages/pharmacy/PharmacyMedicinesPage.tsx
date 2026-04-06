import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Pill,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Package,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { format, addMonths, isBefore } from "date-fns";

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  minStockLevel: number;
  unitPrice: number;
  sellingPrice: number;
  unit: string;
  location: string;
}

const mockMedicines: Medicine[] = [
  {
    id: "MED001",
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    category: "Analgesic",
    manufacturer: "Cipla",
    batchNumber: "PCM2024001",
    expiryDate: "2025-06-15",
    quantity: 500,
    minStockLevel: 100,
    unitPrice: 1.5,
    sellingPrice: 2.5,
    unit: "Tablet",
    location: "Rack A1",
  },
  {
    id: "MED002",
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    manufacturer: "Sun Pharma",
    batchNumber: "AMX2024002",
    expiryDate: "2024-12-01",
    quantity: 80,
    minStockLevel: 100,
    unitPrice: 3.0,
    sellingPrice: 5.0,
    unit: "Capsule",
    location: "Rack B2",
  },
  {
    id: "MED003",
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    category: "Antacid",
    manufacturer: "Dr. Reddy's",
    batchNumber: "OMP2024003",
    expiryDate: "2025-03-20",
    quantity: 200,
    minStockLevel: 50,
    unitPrice: 2.0,
    sellingPrice: 3.5,
    unit: "Capsule",
    location: "Rack A3",
  },
  {
    id: "MED004",
    name: "Metformin 500mg",
    genericName: "Metformin HCl",
    category: "Antidiabetic",
    manufacturer: "Lupin",
    batchNumber: "MTF2024004",
    expiryDate: "2025-08-10",
    quantity: 350,
    minStockLevel: 100,
    unitPrice: 1.2,
    sellingPrice: 2.0,
    unit: "Tablet",
    location: "Rack C1",
  },
  {
    id: "MED005",
    name: "Cetirizine 10mg",
    genericName: "Cetirizine HCl",
    category: "Antihistamine",
    manufacturer: "Cipla",
    batchNumber: "CTZ2024005",
    expiryDate: "2024-09-30",
    quantity: 45,
    minStockLevel: 50,
    unitPrice: 0.8,
    sellingPrice: 1.5,
    unit: "Tablet",
    location: "Rack B1",
  },
];

const categories = ["All", "Analgesic", "Antibiotic", "Antacid", "Antidiabetic", "Antihistamine", "Other"];

// Get medicines from localStorage or mock data
function getMedicinesFromStorage(): Medicine[] {
  const stored = localStorage.getItem("hos_medicines_inventory");
  if (stored) {
    return JSON.parse(stored);
  }
  return mockMedicines;
}

// Save medicines to localStorage
function saveMedicinesToStorage(meds: Medicine[]) {
  localStorage.setItem("hos_medicines_inventory", JSON.stringify(meds));
}

export function PharmacyMedicinesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [medicines, setMedicines] = useState<Medicine[]>(getMedicinesFromStorage);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const isCreateRoute = location.pathname.endsWith("/pharmacy/medicines/new");

  // Form state
  const [formData, setFormData] = useState<Partial<Medicine>>({});

  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || med.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = medicines.filter((m) => m.quantity <= m.minStockLevel).length;
  const expiringCount = medicines.filter((m) =>
    isBefore(new Date(m.expiryDate), addMonths(new Date(), 3))
  ).length;

  const isLowStock = (med: Medicine) => med.quantity <= med.minStockLevel;
  const isExpiringSoon = (med: Medicine) =>
    isBefore(new Date(med.expiryDate), addMonths(new Date(), 3));

  const openAddModal = () => {
    setFormData({});
    setEditingMedicine(null);
    setShowAddModal(true);
  };

  useEffect(() => {
    if (isCreateRoute) {
      setFormData({});
      setEditingMedicine(null);
      setShowAddModal(true);
    }
  }, [isCreateRoute]);

  const openEditModal = (med: Medicine) => {
    setFormData(med);
    setEditingMedicine(med);
    setShowAddModal(true);
  };

  const handleSave = () => {
    let updatedMedicines: Medicine[];
    if (editingMedicine) {
      updatedMedicines = medicines.map((m) => 
        (m.id === editingMedicine.id ? { ...m, ...formData } as Medicine : m)
      );
    } else {
      const newMedicine: Medicine = {
        id: `MED${Date.now()}`,
        name: formData.name || "",
        genericName: formData.genericName || "",
        category: formData.category || "Other",
        manufacturer: formData.manufacturer || "",
        batchNumber: formData.batchNumber || "",
        expiryDate: formData.expiryDate || "",
        quantity: formData.quantity || 0,
        minStockLevel: formData.minStockLevel || 50,
        unitPrice: formData.unitPrice || 0,
        sellingPrice: formData.sellingPrice || 0,
        unit: formData.unit || "Tablet",
        location: formData.location || "",
      };
      updatedMedicines = [...medicines, newMedicine];
    }
    setMedicines(updatedMedicines);
    saveMedicinesToStorage(updatedMedicines);
    setShowAddModal(false);
    setFormData({});
    if (isCreateRoute) {
      navigate("/pharmacy/medicines");
    }
  };

  const handleDelete = (id: string) => {
    const updatedMedicines = medicines.filter((m) => m.id !== id);
    setMedicines(updatedMedicines);
    saveMedicinesToStorage(updatedMedicines);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isCreateRoute ? "Add New Medicine" : "Medicines Inventory"}
          </h1>
          <p className="text-slate-500">
            {isCreateRoute
              ? "Create a new medicine record for stock tracking and ordering"
              : "Manage medicine stock and details"}
          </p>
        </div>
        {!isCreateRoute ? (
          <Button className="gap-2" onClick={openAddModal}>
            <Plus size={16} />
            Add Medicine
          </Button>
        ) : (
          <Button variant="outline" onClick={() => navigate("/pharmacy/medicines")}>
            Back to Medicines
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Pill className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Medicines</p>
              <p className="text-2xl font-bold text-slate-900">{medicines.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Stock Value</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{medicines.reduce((acc, m) => acc + m.quantity * m.unitPrice, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Low Stock Items</p>
              <p className="text-2xl font-bold text-amber-600">{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Expiring Soon</p>
              <p className="text-2xl font-bold text-red-600">{expiringCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search medicines..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Medicine</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Category</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Batch</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Stock</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Expiry</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Price</th>
                <th className="text-right text-sm font-medium text-slate-600 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMedicines.map((med) => (
                <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{med.name}</p>
                      <p className="text-sm text-slate-500">{med.genericName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="default">{med.category}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700">{med.batchNumber}</p>
                    <p className="text-xs text-slate-500">{med.manufacturer}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium",
                          isLowStock(med) ? "text-amber-600" : "text-slate-900"
                        )}
                      >
                        {med.quantity} {med.unit}s
                      </span>
                      {isLowStock(med) && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Min: {med.minStockLevel}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        isExpiringSoon(med) ? "text-red-600 font-medium" : "text-slate-700"
                      )}
                    >
                      {format(new Date(med.expiryDate), "dd MMM yyyy")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">₹{med.sellingPrice}</p>
                    <p className="text-xs text-slate-500">Cost: ₹{med.unitPrice}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEditModal(med)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => setShowDeleteConfirm(med.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          if (isCreateRoute) {
            navigate("/pharmacy/medicines");
          }
        }}
        title={editingMedicine ? "Edit Medicine" : "Add New Medicine"}
        className="max-w-2xl"
      >
        <ModalBody>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Medicine Name *
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Paracetamol 500mg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Generic Name
              </label>
              <Input
                value={formData.genericName || ""}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                placeholder="e.g., Acetaminophen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.category || "Other"}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Manufacturer
              </label>
              <Input
                value={formData.manufacturer || ""}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="e.g., Cipla"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Batch Number *
              </label>
              <Input
                value={formData.batchNumber || ""}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                placeholder="e.g., PCM2024001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Expiry Date *</label>
              <Input
                type="date"
                value={formData.expiryDate || ""}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit Type</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.unit || "Tablet"}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup (ml)</option>
                <option value="Injection">Injection</option>
                <option value="Cream">Cream</option>
                <option value="Drop">Drop</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity *</label>
              <Input
                type="number"
                value={formData.quantity || ""}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Min Stock Level
              </label>
              <Input
                type="number"
                value={formData.minStockLevel || ""}
                onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Cost Price (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.unitPrice || ""}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Selling Price (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.sellingPrice || ""}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Storage Location
              </label>
              <Input
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Rack A1"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name || !formData.batchNumber}>
            {editingMedicine ? "Save Changes" : "Add Medicine"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <ModalBody>
          <p className="text-slate-600">
            Are you sure you want to delete this medicine? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
