import { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Archive,
  MoreVertical,
  Stethoscope,
  FlaskConical,
  Radio,
  Scissors,
  BedDouble,
  IndianRupee,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { services, departments } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types";

const categoryIcons: Record<string, React.ReactNode> = {
  consultation: <Stethoscope className="w-4 h-4" />,
  lab: <FlaskConical className="w-4 h-4" />,
  radiology: <Radio className="w-4 h-4" />,
  procedure: <Scissors className="w-4 h-4" />,
  room: <BedDouble className="w-4 h-4" />,
};

const categoryLabels: Record<string, string> = {
  consultation: "Consultation",
  lab: "Lab/Diagnostics",
  radiology: "Radiology",
  procedure: "Procedures",
  room: "Room Charges",
};

const categoryColors: Record<string, "primary" | "success" | "warning" | "danger"> = {
  consultation: "primary",
  lab: "success",
  radiology: "warning",
  procedure: "danger",
  room: "primary",
};

export default function ServiceCatalogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "consultation",
    departmentId: "",
    basePrice: "",
    tax: "0",
    duration: "",
    description: "",
  });

  const categories = ["all", "consultation", "lab", "radiology", "procedure", "room"];

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesDepartment = selectedDepartment === "all" || service.departmentId === selectedDepartment;
    return matchesSearch && matchesCategory && matchesDepartment && service.isActive;
  });

  const servicesByCategory = categories
    .filter((c) => c !== "all")
    .map((category) => ({
      category,
      services: filteredServices.filter((s) => s.category === category),
    }))
    .filter((g) => g.services.length > 0);

  const handleAddService = () => {
    setFormData({
      name: "",
      code: "",
      category: "consultation",
      departmentId: "",
      basePrice: "",
      tax: "0",
      duration: "",
      description: "",
    });
    setEditingService(null);
    setShowAddModal(true);
  };

  const handleEditService = (service: Service) => {
    setFormData({
      name: service.name,
      code: service.code,
      category: service.category,
      departmentId: service.departmentId,
      basePrice: service.basePrice.toString(),
      tax: service.tax.toString(),
      duration: service.duration?.toString() || "",
      description: service.description || "",
    });
    setEditingService(service);
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    // In real app, this would call API
    console.log("Saving service:", formData);
    setShowAddModal(false);
  };

  // Stats
  const totalServices = services.filter((s) => s.isActive).length;
  const avgPrice = services.reduce((sum, s) => sum + s.basePrice, 0) / services.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Catalog</h1>
          <p className="text-gray-500 mt-1">Manage hospital services, procedures, and pricing</p>
        </div>
        <Button onClick={handleAddService}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lab Tests</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter((s) => s.category === "lab").length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-success-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Procedures</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter((s) => s.category === "procedure").length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-warning-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgPrice)}</p>
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
                placeholder="Search services by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-40"
            >
              <option value="all">All Categories</option>
              <option value="consultation">Consultation</option>
              <option value="lab">Lab/Diagnostics</option>
              <option value="radiology">Radiology</option>
              <option value="procedure">Procedures</option>
              <option value="room">Room Charges</option>
            </Select>
            <Select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-48"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Category Tabs (Quick Filter) */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? "bg-primary-100 text-primary-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {category === "all" ? "All Services" : categoryLabels[category]}
            <span className="ml-2 text-xs">
              ({category === "all" ? filteredServices.length : filteredServices.filter((s) => s.category === category).length})
            </span>
          </button>
        ))}
      </div>

      {/* Services Grid by Category */}
      {selectedCategory === "all" ? (
        servicesByCategory.map(({ category, services: categoryServices }) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-${categoryColors[category]}-100 flex items-center justify-center`}>
                {categoryIcons[category]}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{categoryLabels[category]}</h2>
              <Badge variant="primary">{categoryServices.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryServices.map((service) => (
                <ServiceCard key={service.id} service={service} onEdit={handleEditService} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} onEdit={handleEditService} />
          ))}
        </div>
      )}

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No services found matching your criteria</p>
        </div>
      )}

      {/* Add/Edit Service Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingService ? "Edit Service" : "Add New Service"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Service Name *"
              placeholder="e.g., General Consultation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Service Code *"
              placeholder="e.g., CONS-GEN"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="consultation">Consultation</option>
              <option value="lab">Lab/Diagnostics</option>
              <option value="radiology">Radiology</option>
              <option value="procedure">Procedures</option>
              <option value="room">Room Charges</option>
            </Select>
            <Select
              label="Department *"
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Base Price (₹) *"
              type="number"
              placeholder="500"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
            />
            <Input
              label="Tax (%)"
              type="number"
              placeholder="0"
              value={formData.tax}
              onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
            />
            <Input
              label="Duration (mins)"
              type="number"
              placeholder="15"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Service description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingService ? "Update Service" : "Add Service"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service, onEdit }: { service: Service; onEdit: (s: Service) => void }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg bg-${categoryColors[service.category]}-100 flex items-center justify-center flex-shrink-0`}>
            {categoryIcons[service.category]}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{service.name}</h3>
            <p className="text-xs text-gray-500">{service.code}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-32">
              <button
                onClick={() => {
                  onEdit(service);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => setShowMenu(false)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-warning-600"
              >
                <Archive className="w-4 h-4" /> Archive
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{service.departmentName}</p>
          {service.duration && (
            <p className="text-xs text-gray-400">{service.duration} mins</p>
          )}
        </div>
        <p className="text-lg font-semibold text-primary-600">
          {formatCurrency(service.basePrice)}
        </p>
      </div>
    </Card>
  );
}
