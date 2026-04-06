import { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Archive,
  MoreVertical,
  Building2,
  Stethoscope,
  FlaskConical,
  IndianRupee,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { departments, services, staff } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import type { Department } from "@/types";

export default function DepartmentConfigPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "clinical",
    consultationFee: "",
    headOfDepartment: "",
    description: "",
  });

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || dept.type === selectedType;
    return matchesSearch && matchesType && dept.isActive;
  });

  const handleAddDepartment = () => {
    setFormData({
      name: "",
      code: "",
      type: "clinical",
      consultationFee: "",
      headOfDepartment: "",
      description: "",
    });
    setEditingDepartment(null);
    setShowAddModal(true);
  };

  const handleEditDepartment = (dept: Department) => {
    setFormData({
      name: dept.name,
      code: dept.code,
      type: dept.type,
      consultationFee: dept.consultationFee.toString(),
      headOfDepartment: dept.headOfDepartment || "",
      description: dept.description || "",
    });
    setEditingDepartment(dept);
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    console.log("Saving department:", formData);
    setShowAddModal(false);
  };

  // Get stats for each department
  const getDeptStats = (deptId: string) => {
    const deptServices = services.filter((s) => s.departmentId === deptId);
    const deptDoctors = staff.filter((s) => s.role === "doctor" && s.department === departments.find(d => d.id === deptId)?.name);
    return {
      services: deptServices.length,
      doctors: deptDoctors.length,
    };
  };

  // Overall stats
  const totalClinical = departments.filter((d) => d.type === "clinical" && d.isActive).length;
  const totalSupport = departments.filter((d) => d.type === "support" && d.isActive).length;
  const totalDoctors = staff.filter((s) => s.role === "doctor").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1">Manage hospital departments and their settings</p>
        </div>
        <Button onClick={handleAddDepartment}>
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clinical Depts</p>
              <p className="text-2xl font-bold text-gray-900">{totalClinical}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-success-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Support Depts</p>
              <p className="text-2xl font-bold text-gray-900">{totalSupport}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-warning-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-900">{totalDoctors}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
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
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-40"
            >
              <option value="all">All Types</option>
              <option value="clinical">Clinical</option>
              <option value="support">Support</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Department Type Tabs */}
      <div className="flex gap-2">
        {["all", "clinical", "support"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === type
                ? "bg-primary-100 text-primary-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type === "all" ? "All" : type === "clinical" ? "Clinical" : "Support"}
            <span className="ml-2 text-xs">
              ({type === "all"
                ? filteredDepartments.length
                : filteredDepartments.filter((d) => d.type === type).length})
            </span>
          </button>
        ))}
      </div>

      {/* Departments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map((dept) => {
          const stats = getDeptStats(dept.id);
          return (
            <DepartmentCard
              key={dept.id}
              department={dept}
              stats={stats}
              onEdit={handleEditDepartment}
            />
          );
        })}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No departments found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingDepartment ? "Edit Department" : "Add New Department"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Department Name *"
              placeholder="e.g., Cardiology"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Code *"
              placeholder="e.g., CARD"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type *"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="clinical">Clinical</option>
              <option value="support">Support</option>
            </Select>
            <Input
              label="Consultation Fee (₹)"
              type="number"
              placeholder="500"
              value={formData.consultationFee}
              onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
            />
          </div>

          <Select
            label="Head of Department"
            value={formData.headOfDepartment}
            onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
          >
            <option value="">Select Doctor</option>
            {staff
              .filter((s) => s.role === "doctor")
              .map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
          </Select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Department description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingDepartment ? "Update Department" : "Add Department"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Department Card Component
function DepartmentCard({
  department,
  stats,
  onEdit,
}: {
  department: Department;
  stats: { services: number; doctors: number };
  onEdit: (d: Department) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              department.type === "clinical"
                ? "bg-primary-100 text-primary-600"
                : "bg-warning-100 text-warning-600"
            }`}
          >
            {department.type === "clinical" ? (
              <Stethoscope className="w-6 h-6" />
            ) : (
              <FlaskConical className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{department.name}</h3>
            <p className="text-xs text-gray-500">{department.code}</p>
            <Badge
              variant={department.type === "clinical" ? "primary" : "warning"}
              className="mt-1"
            >
              {department.type}
            </Badge>
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
                  onEdit(department);
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

      {/* Stats */}
      <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-semibold text-gray-900">{stats.doctors}</p>
          <p className="text-xs text-gray-500">Doctors</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{stats.services}</p>
          <p className="text-xs text-gray-500">Services</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-primary-600">
            {department.consultationFee > 0 ? formatCurrency(department.consultationFee) : "N/A"}
          </p>
          <p className="text-xs text-gray-500">Consult Fee</p>
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-success-600">
          <CheckCircle className="w-4 h-4" />
          <span>Active</span>
        </div>
        {department.headOfDepartment && (
          <span className="text-gray-500 text-xs">HOD: {department.headOfDepartment}</span>
        )}
      </div>
    </Card>
  );
}
