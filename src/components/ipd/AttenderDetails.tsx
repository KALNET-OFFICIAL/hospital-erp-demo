import { useState } from "react";
import { UserPlus, Trash2, Phone, User, Heart, Edit2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import type { Attender } from "@/types";

type RelationshipType = "spouse" | "parent" | "child" | "sibling" | "relative" | "friend" | "other";

interface AttenderFormData {
  name: string;
  relationship: RelationshipType | "";
  phone: string;
  alternatePhone: string;
  address: string;
  idProofType: string;
  idProofNumber: string;
  isPrimary: boolean;
}

interface AttenderDetailsProps {
  attenders: Attender[];
  admissionId: string;
  onAdd: (attender: Attender) => void;
  onEdit: (attender: Attender) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

const relationshipOptions = [
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "relative", label: "Relative" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other" },
];

const emptyForm: AttenderFormData = {
  name: "",
  relationship: "",
  phone: "",
  alternatePhone: "",
  address: "",
  idProofType: "",
  idProofNumber: "",
  isPrimary: false,
};

export function AttenderDetails({
  attenders,
  admissionId,
  onAdd,
  onEdit,
  onDelete,
  readOnly = false,
}: AttenderDetailsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttender, setEditingAttender] = useState<Attender | null>(null);
  const [formData, setFormData] = useState<AttenderFormData>(emptyForm);

  const handleOpenModal = (attender?: Attender) => {
    if (attender) {
      setEditingAttender(attender);
      setFormData({
        name: attender.name,
        relationship: attender.relationship,
        phone: attender.phone,
        alternatePhone: attender.alternatePhone || "",
        address: attender.address || "",
        idProofType: attender.idProofType || "",
        idProofNumber: attender.idProofNumber || "",
        isPrimary: attender.isPrimary,
      });
    } else {
      setEditingAttender(null);
      setFormData({
        ...emptyForm,
        isPrimary: attenders.length === 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.relationship || !formData.phone) {
      return;
    }

    const attender: Attender = {
      id: editingAttender?.id || `ATT${Date.now()}`,
      admissionId: admissionId,
      name: formData.name,
      relationship: formData.relationship as RelationshipType,
      phone: formData.phone,
      alternatePhone: formData.alternatePhone || undefined,
      address: formData.address || undefined,
      idProofType: formData.idProofType || undefined,
      idProofNumber: formData.idProofNumber || undefined,
      isPrimary: formData.isPrimary,
    };

    if (editingAttender) {
      onEdit(attender);
    } else {
      onAdd(attender);
    }

    setIsModalOpen(false);
    setEditingAttender(null);
  };

  const handleSetPrimary = (id: string) => {
    attenders.forEach((att) => {
      if (att.id === id) {
        onEdit({ ...att, isPrimary: true });
      } else if (att.isPrimary) {
        onEdit({ ...att, isPrimary: false });
      }
    });
  };

  const primaryAttender = attenders.find((a) => a.isPrimary);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink">
          Attender / Family Details
        </h3>
        {!readOnly && (
          <Button size="sm" onClick={() => handleOpenModal()}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Attender
          </Button>
        )}
      </div>

      {/* Primary Contact Card */}
      {primaryAttender && (
        <Card className="p-4 bg-primary-50 border-primary-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-ink">
                    {primaryAttender.name}
                  </h4>
                  <Badge variant="primary">Primary Contact</Badge>
                </div>
                <p className="text-sm text-ink-muted">
                  {primaryAttender.relationship}
                </p>
                <div className="flex items-center gap-4 mt-1 text-sm text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {primaryAttender.phone}
                  </span>
                  {primaryAttender.alternatePhone && (
                    <span>Alt: {primaryAttender.alternatePhone}</span>
                  )}
                </div>
              </div>
            </div>
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenModal(primaryAttender)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Other Attenders */}
      {attenders.filter((a) => !a.isPrimary).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {attenders
            .filter((a) => !a.isPrimary)
            .map((attender) => (
              <Card key={attender.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-ink-muted" />
                    </div>
                    <div>
                      <h4 className="font-medium text-ink">
                        {attender.name}
                      </h4>
                      <p className="text-xs text-ink-muted">
                        {attender.relationship}
                      </p>
                      <p className="text-sm text-ink-muted">{attender.phone}</p>
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetPrimary(attender.id)}
                        title="Set as primary"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(attender)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(attender.id)}
                        className="text-danger-500 hover:text-danger-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
        </div>
      )}

      {attenders.length === 0 && (
        <Card className="p-8 text-center">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-ink-muted mb-3">No attender details added</p>
          {!readOnly && (
            <Button size="sm" onClick={() => handleOpenModal()}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add First Attender
            </Button>
          )}
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAttender ? "Edit Attender" : "Add Attender"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter name"
            />
            <Select
              label="Relationship *"
              value={formData.relationship || ""}
              onChange={(e) =>
                setFormData({ ...formData, relationship: e.target.value as RelationshipType | "" })
              }
              options={relationshipOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number *"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="10-digit mobile"
            />
            <Input
              label="Alternate Phone"
              value={formData.alternatePhone || ""}
              onChange={(e) =>
                setFormData({ ...formData, alternatePhone: e.target.value })
              }
              placeholder="Optional"
            />
          </div>

          <Input
            label="Address"
            value={formData.address || ""}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Full address"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="ID Proof Type"
              value={formData.idProofType || ""}
              onChange={(e) =>
                setFormData({ ...formData, idProofType: e.target.value })
              }
              options={[
                { value: "", label: "Select ID type" },
                { value: "aadhar", label: "Aadhar Card" },
                { value: "pan", label: "PAN Card" },
                { value: "voter", label: "Voter ID" },
                { value: "driving", label: "Driving License" },
                { value: "passport", label: "Passport" },
              ]}
            />
            <Input
              label="ID Number"
              value={formData.idProofNumber || ""}
              onChange={(e) =>
                setFormData({ ...formData, idProofNumber: e.target.value })
              }
              placeholder="ID number"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPrimary || false}
              onChange={(e) =>
                setFormData({ ...formData, isPrimary: e.target.checked })
              }
              className="rounded border-line text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-ink-muted">
              Set as primary contact (Emergency)
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.relationship || !formData.phone}
            >
              {editingAttender ? "Update" : "Add"} Attender
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
