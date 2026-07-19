import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { AttenderDetails } from "@/components/ipd/AttenderDetails";
import { admissions } from "@/lib/mock-data";
import type { Attender } from "@/types";

const initialAttenders: Attender[] = [
  {
    id: "ATT001",
    admissionId: "ADM001",
    name: "Rina Patel",
    relationship: "spouse",
    phone: "9876543011",
    isPrimary: true,
  },
  {
    id: "ATT002",
    admissionId: "ADM002",
    name: "Naveen Kumar",
    relationship: "child",
    phone: "9876543012",
    isPrimary: true,
  },
];

export function IPDAttendersPage() {
  const [selectedAdmissionId, setSelectedAdmissionId] = useState(admissions[0]?.id ?? "");
  const [attenders, setAttenders] = useState<Attender[]>(initialAttenders);

  const selectedAdmission = useMemo(
    () => admissions.find((admission) => admission.id === selectedAdmissionId),
    [selectedAdmissionId]
  );

  const admissionAttenders = attenders.filter(
    (attender) => attender.admissionId === selectedAdmissionId
  );

  const addAttender = (attender: Attender) => {
    setAttenders((prev) => {
      const base = attender.isPrimary
        ? prev.map((existing) =>
            existing.admissionId === attender.admissionId
              ? { ...existing, isPrimary: false }
              : existing
          )
        : prev;
      return [...base, attender];
    });
  };

  const editAttender = (attender: Attender) => {
    setAttenders((prev) => {
      const base = attender.isPrimary
        ? prev.map((existing) =>
            existing.admissionId === attender.admissionId
              ? { ...existing, isPrimary: false }
              : existing
          )
        : prev;
      return base.map((existing) => (existing.id === attender.id ? attender : existing));
    });
  };

  const deleteAttender = (id: string) => {
    setAttenders((prev) => prev.filter((attender) => attender.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">IPD Attender Details</h1>
        <p className="text-ink-muted">Maintain family/emergency contacts for admitted patients</p>
      </div>

      <Card className="p-4">
        <Select
          label="Select Admission"
          value={selectedAdmissionId}
          onChange={(e) => setSelectedAdmissionId(e.target.value)}
          options={admissions.map((admission) => ({
            value: admission.id,
            label: `${admission.patientName} • ${admission.bedNumber} • ${admission.wardName}`,
          }))}
        />
      </Card>

      {selectedAdmission && (
        <AttenderDetails
          admissionId={selectedAdmission.id}
          attenders={admissionAttenders}
          onAdd={addAttender}
          onEdit={editAttender}
          onDelete={deleteAttender}
        />
      )}
    </div>
  );
}
