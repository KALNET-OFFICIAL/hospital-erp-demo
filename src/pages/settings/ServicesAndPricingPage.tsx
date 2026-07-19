import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Stethoscope,
  FlaskConical,
  Pill,
  BedDouble,
  Scissors,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { getIdentityColor, getCurrentThemeMode } from "@/lib/theme";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  tax: number;
  duration: number; // in minutes
  isActive: boolean;
}

const mockServices: Service[] = [
  {
    id: "SVC001",
    name: "General Consultation",
    category: "OPD",
    description: "Basic consultation with general physician",
    price: 500,
    tax: 0,
    duration: 15,
    isActive: true,
  },
  {
    id: "SVC002",
    name: "Specialist Consultation",
    category: "OPD",
    description: "Consultation with specialist doctor",
    price: 1000,
    tax: 0,
    duration: 20,
    isActive: true,
  },
  {
    id: "SVC003",
    name: "Complete Blood Count (CBC)",
    category: "Lab",
    description: "Full blood count analysis",
    price: 350,
    tax: 18,
    duration: 60,
    isActive: true,
  },
  {
    id: "SVC004",
    name: "X-Ray Chest",
    category: "Radiology",
    description: "Chest X-ray imaging",
    price: 600,
    tax: 18,
    duration: 30,
    isActive: true,
  },
  {
    id: "SVC005",
    name: "ECG",
    category: "Cardiology",
    description: "Electrocardiogram test",
    price: 400,
    tax: 18,
    duration: 15,
    isActive: true,
  },
  {
    id: "SVC006",
    name: "General Ward - Per Day",
    category: "IPD",
    description: "Daily charge for general ward bed",
    price: 1500,
    tax: 12,
    duration: 1440,
    isActive: true,
  },
  {
    id: "SVC007",
    name: "Private Room - Per Day",
    category: "IPD",
    description: "Daily charge for private room",
    price: 4000,
    tax: 12,
    duration: 1440,
    isActive: true,
  },
  {
    id: "SVC008",
    name: "ICU - Per Day",
    category: "IPD",
    description: "Daily charge for ICU bed",
    price: 8000,
    tax: 12,
    duration: 1440,
    isActive: true,
  },
  {
    id: "SVC009",
    name: "Minor Surgery",
    category: "Surgery",
    description: "Minor surgical procedures",
    price: 5000,
    tax: 18,
    duration: 60,
    isActive: true,
  },
  {
    id: "SVC010",
    name: "Dressing",
    category: "Nursing",
    description: "Wound dressing and care",
    price: 200,
    tax: 0,
    duration: 15,
    isActive: true,
  },
  {
    id: "SVC011",
    name: "IV Injection",
    category: "Nursing",
    description: "Intravenous injection administration",
    price: 150,
    tax: 0,
    duration: 10,
    isActive: true,
  },
  {
    id: "SVC012",
    name: "Ultrasound Abdomen",
    category: "Radiology",
    description: "Abdominal ultrasound scan",
    price: 800,
    tax: 18,
    duration: 30,
    isActive: true,
  },
];

const categories = ["All", "OPD", "IPD", "Lab", "Radiology", "Surgery", "Nursing", "Cardiology", "Pharmacy"];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "OPD":
      return <Stethoscope className="h-4 w-4" />;
    case "IPD":
      return <BedDouble className="h-4 w-4" />;
    case "Lab":
      return <FlaskConical className="h-4 w-4" />;
    case "Pharmacy":
      return <Pill className="h-4 w-4" />;
    case "Surgery":
      return <Scissors className="h-4 w-4" />;
    case "Cardiology":
      return <HeartPulse className="h-4 w-4" />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
};

export default function ServicesAndPricingPage() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Service>>({});
  const mode = getCurrentThemeMode();

  const filteredServices = services.filter((svc) => {
    const matchesSearch =
      svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || svc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: services.length,
    active: services.filter((s) => s.isActive).length,
    avgPrice: Math.round(services.reduce((acc, s) => acc + s.price, 0) / services.length),
    categories: [...new Set(services.map((s) => s.category))].length,
  };

  const openAddModal = () => {
    setFormData({ isActive: true, tax: 0, duration: 15 });
    setEditingService(null);
    setShowAddModal(true);
  };

  const openEditModal = (svc: Service) => {
    setFormData(svc);
    setEditingService(svc);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (editingService) {
      setServices((prev) =>
        prev.map((s) => (s.id === editingService.id ? { ...s, ...formData } as Service : s))
      );
    } else {
      const newService: Service = {
        id: `SVC${String(services.length + 1).padStart(3, "0")}`,
        name: formData.name || "",
        category: formData.category || "OPD",
        description: formData.description || "",
        price: formData.price || 0,
        tax: formData.tax || 0,
        duration: formData.duration || 15,
        isActive: formData.isActive ?? true,
      };
      setServices((prev) => [...prev, newService]);
    }
    setShowAddModal(false);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setShowDeleteConfirm(null);
  };

  const toggleActive = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Services & Pricing</h1>
          <p className="text-ink-muted">Manage hospital services and their pricing</p>
        </div>
        <Button className="gap-2" onClick={openAddModal}>
          <Plus size={16} />
          Add Service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-paper rounded-xl border border-line p-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                backgroundColor: `${getIdentityColor("Total Services", mode)}1f`,
                color: getIdentityColor("Total Services", mode),
              }}
            >
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Total Services</p>
              <p className="text-2xl font-bold text-ink">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-paper rounded-xl border border-line p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
              <Stethoscope className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Active Services</p>
              <p className="text-2xl font-bold text-success-600">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-paper rounded-xl border border-line p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
              <DollarSign className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Average Price</p>
              <p className="text-2xl font-bold text-ink">₹{stats.avgPrice}</p>
            </div>
          </div>
        </div>
        <div className="bg-paper rounded-xl border border-line p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
              <FlaskConical className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Categories</p>
              <p className="text-2xl font-bold text-ink">{stats.categories}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search services..."
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
      <div className="bg-paper rounded-xl border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg border-b border-line">
              <tr>
                <th className="text-left text-sm font-medium text-ink-muted px-6 py-4">Service</th>
                <th className="text-left text-sm font-medium text-ink-muted px-6 py-4">Category</th>
                <th className="text-left text-sm font-medium text-ink-muted px-6 py-4">Price</th>
                <th className="text-left text-sm font-medium text-ink-muted px-6 py-4">Tax</th>
                <th className="text-left text-sm font-medium text-ink-muted px-6 py-4">Duration</th>
                <th className="text-left text-sm font-medium text-ink-muted px-6 py-4">Status</th>
                <th className="text-right text-sm font-medium text-ink-muted px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredServices.map((svc) => (
                <tr key={svc.id} className="hover:bg-hover transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-ink">{svc.name}</p>
                      <p className="text-sm text-ink-muted max-w-[250px] truncate">{svc.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2" style={{ color: getIdentityColor(svc.category, mode) }}>
                      {getCategoryIcon(svc.category)}
                      <span>{svc.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-ink">₹{svc.price.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-ink-muted">{svc.tax}%</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-ink-muted">
                      {svc.duration >= 1440
                        ? `${Math.floor(svc.duration / 1440)} day(s)`
                        : `${svc.duration} min`}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleActive(svc.id)}>
                      <Badge
                        variant={svc.isActive ? "success" : "default"}
                        className="cursor-pointer"
                      >
                        {svc.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEditModal(svc)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-danger-500 hover:text-danger-700"
                        onClick={() => setShowDeleteConfirm(svc.id)}
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
        onClose={() => setShowAddModal(false)}
        title={editingService ? "Edit Service" : "Add New Service"}
        className="max-w-xl"
      >
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-1.5">
                Service Name *
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., General Consultation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-1.5">Category</label>
              <select
                className="w-full rounded-lg border border-line bg-paper text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={formData.category || "OPD"}
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
              <label className="block text-sm font-medium text-ink-muted mb-1.5">
                Description
              </label>
              <textarea
                className="w-full rounded-lg border border-line bg-paper text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                rows={2}
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the service"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-1.5">
                  Price (₹) *
                </label>
                <Input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-1.5">
                  Tax (%)
                </label>
                <Input
                  type="number"
                  value={formData.tax || ""}
                  onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-1.5">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={formData.duration || ""}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  placeholder="15"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-line accent-primary-600"
                  />
                  <span className="text-sm text-ink-muted">Active</span>
                </label>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name || !formData.price}>
            {editingService ? "Save Changes" : "Add Service"}
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
          <p className="text-ink-muted">
            Are you sure you want to delete this service? This action cannot be undone.
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
