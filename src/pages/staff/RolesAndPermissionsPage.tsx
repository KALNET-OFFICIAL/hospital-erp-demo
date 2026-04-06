import { useState } from "react";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Check,
  X,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

const allPermissions: Permission[] = [
  { id: "patients.view", name: "View Patients", description: "View patient list and profiles", category: "Patients" },
  { id: "patients.create", name: "Create Patients", description: "Add new patients", category: "Patients" },
  { id: "patients.edit", name: "Edit Patients", description: "Modify patient information", category: "Patients" },
  { id: "patients.delete", name: "Delete Patients", description: "Remove patient records", category: "Patients" },
  { id: "appointments.view", name: "View Appointments", description: "View appointment schedule", category: "Appointments" },
  { id: "appointments.create", name: "Create Appointments", description: "Schedule appointments", category: "Appointments" },
  { id: "appointments.edit", name: "Edit Appointments", description: "Modify appointments", category: "Appointments" },
  { id: "opd.view", name: "View OPD", description: "Access OPD queue", category: "OPD" },
  { id: "opd.consult", name: "OPD Consultation", description: "Conduct consultations", category: "OPD" },
  { id: "ipd.view", name: "View IPD", description: "View admissions", category: "IPD" },
  { id: "ipd.admit", name: "Admit Patients", description: "Create admissions", category: "IPD" },
  { id: "ipd.discharge", name: "Discharge Patients", description: "Process discharges", category: "IPD" },
  { id: "billing.view", name: "View Billing", description: "View invoices", category: "Billing" },
  { id: "billing.create", name: "Create Bills", description: "Generate invoices", category: "Billing" },
  { id: "billing.refund", name: "Process Refunds", description: "Issue refunds", category: "Billing" },
  { id: "pharmacy.view", name: "View Pharmacy", description: "View inventory", category: "Pharmacy" },
  { id: "pharmacy.sell", name: "Pharmacy Sales", description: "POS transactions", category: "Pharmacy" },
  { id: "pharmacy.manage", name: "Manage Stock", description: "Add/modify stock", category: "Pharmacy" },
  { id: "staff.view", name: "View Staff", description: "View staff list", category: "Staff" },
  { id: "staff.manage", name: "Manage Staff", description: "Add/edit staff", category: "Staff" },
  { id: "reports.view", name: "View Reports", description: "Access reports", category: "Reports" },
  { id: "settings.view", name: "View Settings", description: "View settings", category: "Settings" },
  { id: "settings.manage", name: "Manage Settings", description: "Modify settings", category: "Settings" },
];

const mockRoles: Role[] = [
  {
    id: "role-admin",
    name: "Administrator",
    description: "Full system access",
    permissions: allPermissions.map((p) => p.id),
    userCount: 2,
    isSystem: true,
  },
  {
    id: "role-doctor",
    name: "Doctor",
    description: "Medical staff with consultation access",
    permissions: [
      "patients.view", "patients.edit",
      "appointments.view", "appointments.create", "appointments.edit",
      "opd.view", "opd.consult",
      "ipd.view", "ipd.admit", "ipd.discharge",
      "reports.view",
    ],
    userCount: 8,
    isSystem: true,
  },
  {
    id: "role-nurse",
    name: "Nurse",
    description: "Nursing staff with patient care access",
    permissions: [
      "patients.view",
      "appointments.view",
      "opd.view",
      "ipd.view",
    ],
    userCount: 12,
    isSystem: true,
  },
  {
    id: "role-receptionist",
    name: "Receptionist",
    description: "Front desk operations",
    permissions: [
      "patients.view", "patients.create", "patients.edit",
      "appointments.view", "appointments.create", "appointments.edit",
      "billing.view", "billing.create",
    ],
    userCount: 4,
    isSystem: false,
  },
  {
    id: "role-pharmacist",
    name: "Pharmacist",
    description: "Pharmacy operations",
    permissions: [
      "pharmacy.view", "pharmacy.sell", "pharmacy.manage",
      "patients.view",
    ],
    userCount: 3,
    isSystem: false,
  },
];

const permissionCategories = [...new Set(allPermissions.map((p) => p.category))];

export function RolesAndPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Role>>({});

  const openRoleModal = (role?: Role) => {
    if (role) {
      setFormData(role);
      setEditingRole(role);
    } else {
      setFormData({ permissions: [], isSystem: false });
      setEditingRole(null);
    }
    setShowRoleModal(true);
  };

  const saveRole = () => {
    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) => (r.id === editingRole.id ? { ...r, ...formData } as Role : r))
      );
    } else {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: formData.name || "",
        description: formData.description || "",
        permissions: formData.permissions || [],
        userCount: 0,
        isSystem: false,
      };
      setRoles((prev) => [...prev, newRole]);
    }
    setShowRoleModal(false);
    setFormData({});
  };

  const deleteRole = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    setShowDeleteConfirm(null);
  };

  const togglePermission = (permId: string) => {
    const current = formData.permissions || [];
    setFormData({
      ...formData,
      permissions: current.includes(permId)
        ? current.filter((p) => p !== permId)
        : [...current, permId],
    });
  };

  const toggleCategoryPermissions = (category: string) => {
    const categoryPerms = allPermissions.filter((p) => p.category === category).map((p) => p.id);
    const current = formData.permissions || [];
    const allSelected = categoryPerms.every((p) => current.includes(p));
    
    setFormData({
      ...formData,
      permissions: allSelected
        ? current.filter((p) => !categoryPerms.includes(p))
        : [...new Set([...current, ...categoryPerms])],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
          <p className="text-slate-500">Manage user roles and access control</p>
        </div>
        <Button className="gap-2" onClick={() => openRoleModal()}>
          <Plus size={16} />
          Add Role
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Roles</p>
              <p className="text-2xl font-bold text-slate-900">{roles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Users</p>
              <p className="text-2xl font-bold text-green-600">
                {roles.reduce((acc, r) => acc + r.userCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Check className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Permissions</p>
              <p className="text-2xl font-bold text-purple-600">{allPermissions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{role.name}</h3>
                  {role.isSystem && (
                    <Badge variant="default" className="text-xs">System</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setViewingRole(role)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => openRoleModal(role)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {!role.isSystem && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    onClick={() => setShowDeleteConfirm(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-4">{role.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                <span className="font-medium">{role.permissions.length}</span> permissions
              </span>
              <span className="text-slate-600">
                <span className="font-medium">{role.userCount}</span> users
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={editingRole ? "Edit Role" : "Add New Role"}
        className="max-w-2xl"
      >
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Role Name *
                </label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Lab Technician"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <Input
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Role description"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Permissions
              </label>
              <div className="border border-gray-200 rounded-lg max-h-[400px] overflow-y-auto">
                {permissionCategories.map((category) => {
                  const categoryPerms = allPermissions.filter((p) => p.category === category);
                  const selectedCount = categoryPerms.filter((p) =>
                    (formData.permissions || []).includes(p.id)
                  ).length;
                  const allSelected = selectedCount === categoryPerms.length;

                  return (
                    <div key={category} className="border-b border-gray-100 last:border-0">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                        onClick={() => toggleCategoryPermissions(category)}
                      >
                        <span className="font-medium text-slate-900">{category}</span>
                        <span className={cn(
                          "text-sm",
                          allSelected ? "text-green-600" : "text-slate-500"
                        )}>
                          {selectedCount}/{categoryPerms.length}
                        </span>
                      </button>
                      <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                        {categoryPerms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={(formData.permissions || []).includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-slate-700">{perm.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button onClick={saveRole} disabled={!formData.name}>
            {editingRole ? "Save Changes" : "Create Role"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Role Modal */}
      <Modal
        isOpen={!!viewingRole}
        onClose={() => setViewingRole(null)}
        title={viewingRole?.name || "Role Details"}
        className="max-w-xl"
      >
        <ModalBody>
          {viewingRole && (
            <div className="space-y-4">
              <p className="text-slate-600">{viewingRole.description}</p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {viewingRole.permissions.map((permId) => {
                    const perm = allPermissions.find((p) => p.id === permId);
                    return perm ? (
                      <Badge key={permId} variant="default">
                        {perm.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setViewingRole(null)}>Close</Button>
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
            Are you sure you want to delete this role? Users with this role will need to be reassigned.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => showDeleteConfirm && deleteRole(showDeleteConfirm)}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
