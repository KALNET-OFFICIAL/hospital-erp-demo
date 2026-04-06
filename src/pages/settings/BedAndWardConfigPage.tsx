import { useState } from "react";
import {
  BedDouble,
  Plus,
  Edit,
  Trash2,
  Building2,
  Settings,
  AlertTriangle,
  CheckCircle,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

interface Ward {
  id: string;
  name: string;
  type: "general" | "private" | "icu" | "pediatric" | "maternity";
  floor: string;
  totalBeds: number;
  availableBeds: number;
  chargePerDay: number;
  description: string;
}

interface Bed {
  id: string;
  wardId: string;
  bedNumber: string;
  status: "available" | "occupied" | "maintenance" | "reserved";
  features: string[];
}

const mockWards: Ward[] = [
  {
    id: "W001",
    name: "General Ward A",
    type: "general",
    floor: "Ground Floor",
    totalBeds: 20,
    availableBeds: 8,
    chargePerDay: 1500,
    description: "Standard general ward with basic amenities",
  },
  {
    id: "W002",
    name: "General Ward B",
    type: "general",
    floor: "First Floor",
    totalBeds: 15,
    availableBeds: 5,
    chargePerDay: 1500,
    description: "General ward with AC facility",
  },
  {
    id: "W003",
    name: "Private Rooms",
    type: "private",
    floor: "Second Floor",
    totalBeds: 10,
    availableBeds: 3,
    chargePerDay: 4000,
    description: "Single occupancy rooms with attached bathroom",
  },
  {
    id: "W004",
    name: "ICU",
    type: "icu",
    floor: "Ground Floor",
    totalBeds: 8,
    availableBeds: 2,
    chargePerDay: 8000,
    description: "Intensive Care Unit with 24/7 monitoring",
  },
  {
    id: "W005",
    name: "Pediatric Ward",
    type: "pediatric",
    floor: "First Floor",
    totalBeds: 12,
    availableBeds: 4,
    chargePerDay: 2000,
    description: "Specialized ward for children",
  },
  {
    id: "W006",
    name: "Maternity Ward",
    type: "maternity",
    floor: "Second Floor",
    totalBeds: 10,
    availableBeds: 3,
    chargePerDay: 3000,
    description: "Ward for prenatal and postnatal care",
  },
];

const mockBeds: Bed[] = [
  { id: "B001", wardId: "W001", bedNumber: "GA-01", status: "available", features: ["Window Side"] },
  { id: "B002", wardId: "W001", bedNumber: "GA-02", status: "occupied", features: [] },
  { id: "B003", wardId: "W001", bedNumber: "GA-03", status: "available", features: ["Near Nursing Station"] },
  { id: "B004", wardId: "W001", bedNumber: "GA-04", status: "maintenance", features: [] },
  { id: "B005", wardId: "W004", bedNumber: "ICU-01", status: "occupied", features: ["Ventilator Ready", "Cardiac Monitor"] },
  { id: "B006", wardId: "W004", bedNumber: "ICU-02", status: "available", features: ["Ventilator Ready", "Cardiac Monitor"] },
  { id: "B007", wardId: "W003", bedNumber: "PVT-01", status: "occupied", features: ["TV", "AC", "Attached Bath"] },
  { id: "B008", wardId: "W003", bedNumber: "PVT-02", status: "available", features: ["TV", "AC", "Attached Bath", "Balcony"] },
];

const wardTypes = ["general", "private", "icu", "pediatric", "maternity"] as const;

export default function BedAndWardConfigPage() {
  const [wards, setWards] = useState<Ward[]>(mockWards);
  const [beds, setBeds] = useState<Bed[]>(mockBeds);
  const [activeTab, setActiveTab] = useState<"wards" | "beds">("wards");
  const [showWardModal, setShowWardModal] = useState(false);
  const [showBedModal, setShowBedModal] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: "ward" | "bed"; id: string } | null>(null);

  // Form states
  const [wardForm, setWardForm] = useState<Partial<Ward>>({});
  const [bedForm, setBedForm] = useState<Partial<Bed>>({});
  const [newFeature, setNewFeature] = useState("");

  const stats = {
    totalWards: wards.length,
    totalBeds: wards.reduce((acc, w) => acc + w.totalBeds, 0),
    availableBeds: wards.reduce((acc, w) => acc + w.availableBeds, 0),
    maintenanceBeds: beds.filter((b) => b.status === "maintenance").length,
  };

  const getWardTypeColor = (type: Ward["type"]) => {
    switch (type) {
      case "general":
        return "bg-blue-100 text-blue-700";
      case "private":
        return "bg-purple-100 text-purple-700";
      case "icu":
        return "bg-red-100 text-red-700";
      case "pediatric":
        return "bg-green-100 text-green-700";
      case "maternity":
        return "bg-pink-100 text-pink-700";
    }
  };

  const getBedStatusColor = (status: Bed["status"]) => {
    switch (status) {
      case "available":
        return "success";
      case "occupied":
        return "danger";
      case "maintenance":
        return "warning";
      case "reserved":
        return "primary";
    }
  };

  // Ward operations
  const openWardModal = (ward?: Ward) => {
    if (ward) {
      setWardForm(ward);
      setEditingWard(ward);
    } else {
      setWardForm({ type: "general" });
      setEditingWard(null);
    }
    setShowWardModal(true);
  };

  const saveWard = () => {
    if (editingWard) {
      setWards((prev) =>
        prev.map((w) => (w.id === editingWard.id ? { ...w, ...wardForm } as Ward : w))
      );
    } else {
      const newWard: Ward = {
        id: `W${String(wards.length + 1).padStart(3, "0")}`,
        name: wardForm.name || "",
        type: wardForm.type || "general",
        floor: wardForm.floor || "",
        totalBeds: wardForm.totalBeds || 0,
        availableBeds: wardForm.totalBeds || 0,
        chargePerDay: wardForm.chargePerDay || 0,
        description: wardForm.description || "",
      };
      setWards((prev) => [...prev, newWard]);
    }
    setShowWardModal(false);
    setWardForm({});
  };

  // Bed operations
  const openBedModal = (bed?: Bed) => {
    if (bed) {
      setBedForm(bed);
      setEditingBed(bed);
    } else {
      setBedForm({ status: "available", features: [] });
      setEditingBed(null);
    }
    setShowBedModal(true);
  };

  const saveBed = () => {
    if (editingBed) {
      setBeds((prev) =>
        prev.map((b) => (b.id === editingBed.id ? { ...b, ...bedForm } as Bed : b))
      );
    } else {
      const newBed: Bed = {
        id: `B${String(beds.length + 1).padStart(3, "0")}`,
        wardId: bedForm.wardId || "",
        bedNumber: bedForm.bedNumber || "",
        status: bedForm.status || "available",
        features: bedForm.features || [],
      };
      setBeds((prev) => [...prev, newBed]);
    }
    setShowBedModal(false);
    setBedForm({});
  };

  const handleDelete = () => {
    if (!showDeleteConfirm) return;
    if (showDeleteConfirm.type === "ward") {
      setWards((prev) => prev.filter((w) => w.id !== showDeleteConfirm.id));
      setBeds((prev) => prev.filter((b) => b.wardId !== showDeleteConfirm.id));
    } else {
      setBeds((prev) => prev.filter((b) => b.id !== showDeleteConfirm.id));
    }
    setShowDeleteConfirm(null);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setBedForm({
        ...bedForm,
        features: [...(bedForm.features || []), newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    setBedForm({
      ...bedForm,
      features: (bedForm.features || []).filter((f) => f !== feature),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bed & Ward Configuration</h1>
          <p className="text-slate-500">Manage hospital wards and bed allocation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => openBedModal()}>
            <Plus size={16} />
            Add Bed
          </Button>
          <Button className="gap-2" onClick={() => openWardModal()}>
            <Plus size={16} />
            Add Ward
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Wards</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalWards}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <BedDouble className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Beds</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalBeds}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Available Beds</p>
              <p className="text-2xl font-bold text-green-600">{stats.availableBeds}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Wrench className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Under Maintenance</p>
              <p className="text-2xl font-bold text-amber-600">{stats.maintenanceBeds}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "wards"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
          onClick={() => setActiveTab("wards")}
        >
          Wards ({wards.length})
        </button>
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "beds"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
          onClick={() => setActiveTab("beds")}
        >
          Beds ({beds.length})
        </button>
      </div>

      {/* Wards Table */}
      {activeTab === "wards" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Ward</th>
                  <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Type</th>
                  <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Floor</th>
                  <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Beds</th>
                  <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Charge/Day</th>
                  <th className="text-right text-sm font-medium text-slate-600 px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {wards.map((ward) => (
                  <tr key={ward.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{ward.name}</p>
                        <p className="text-sm text-slate-500">{ward.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2 py-1 rounded text-xs font-medium uppercase", getWardTypeColor(ward.type))}>
                        {ward.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{ward.floor}</td>
                    <td className="px-6 py-4">
                      <span className="text-green-600 font-medium">{ward.availableBeds}</span>
                      <span className="text-slate-400"> / {ward.totalBeds}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">₹{ward.chargePerDay.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openWardModal(ward)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => setShowDeleteConfirm({ type: "ward", id: ward.id })}
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
      )}

      {/* Beds Table */}
      {activeTab === "beds" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Bed Number</th>
                  <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Ward</th>
                  <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Status</th>
                  <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Features</th>
                  <th className="text-right text-sm font-medium text-slate-600 px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {beds.map((bed) => {
                  const ward = wards.find((w) => w.id === bed.wardId);
                  return (
                    <tr key={bed.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BedDouble className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-900">{bed.bedNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{ward?.name || "Unknown"}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getBedStatusColor(bed.status) as any}>{bed.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {bed.features.length > 0 ? (
                            bed.features.map((f) => (
                              <span key={f} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                {f}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-sm">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openBedModal(bed)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => setShowDeleteConfirm({ type: "bed", id: bed.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ward Modal */}
      <Modal isOpen={showWardModal} onClose={() => setShowWardModal(false)} title={editingWard ? "Edit Ward" : "Add New Ward"} className="max-w-xl">
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ward Name *</label>
              <Input value={wardForm.name || ""} onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })} placeholder="e.g., General Ward A" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={wardForm.type || "general"}
                  onChange={(e) => setWardForm({ ...wardForm, type: e.target.value as Ward["type"] })}
                >
                  {wardTypes.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Floor</label>
                <Input value={wardForm.floor || ""} onChange={(e) => setWardForm({ ...wardForm, floor: e.target.value })} placeholder="e.g., Ground Floor" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Beds</label>
                <Input type="number" value={wardForm.totalBeds || ""} onChange={(e) => setWardForm({ ...wardForm, totalBeds: Number(e.target.value) })} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Charge/Day (₹)</label>
                <Input type="number" value={wardForm.chargePerDay || ""} onChange={(e) => setWardForm({ ...wardForm, chargePerDay: Number(e.target.value) })} placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                value={wardForm.description || ""}
                onChange={(e) => setWardForm({ ...wardForm, description: e.target.value })}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowWardModal(false)}>Cancel</Button>
          <Button onClick={saveWard} disabled={!wardForm.name}>{editingWard ? "Save Changes" : "Add Ward"}</Button>
        </ModalFooter>
      </Modal>

      {/* Bed Modal */}
      <Modal isOpen={showBedModal} onClose={() => setShowBedModal(false)} title={editingBed ? "Edit Bed" : "Add New Bed"} className="max-w-xl">
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ward *</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={bedForm.wardId || ""}
                  onChange={(e) => setBedForm({ ...bedForm, wardId: e.target.value })}
                >
                  <option value="">Select ward...</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bed Number *</label>
                <Input value={bedForm.bedNumber || ""} onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })} placeholder="e.g., GA-01" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={bedForm.status || "available"}
                onChange={(e) => setBedForm({ ...bedForm, status: e.target.value as Bed["status"] })}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Features</label>
              <div className="flex gap-2 mb-2">
                <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Add feature..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} />
                <Button type="button" onClick={addFeature}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(bedForm.features || []).map((f) => (
                  <span key={f} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">
                    {f}
                    <button onClick={() => removeFeature(f)} className="hover:text-blue-900">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowBedModal(false)}>Cancel</Button>
          <Button onClick={saveBed} disabled={!bedForm.wardId || !bedForm.bedNumber}>{editingBed ? "Save Changes" : "Add Bed"}</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Confirm Delete">
        <ModalBody>
          <p className="text-slate-600">
            {showDeleteConfirm?.type === "ward"
              ? "Are you sure you want to delete this ward? All beds in this ward will also be deleted."
              : "Are you sure you want to delete this bed?"}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
