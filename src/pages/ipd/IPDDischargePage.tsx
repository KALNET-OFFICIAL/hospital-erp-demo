import { useMemo, useState } from "react";
import { CheckCircle2, Plus, Printer, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { admissions, patients } from "@/lib/mock-data";
import { useNotificationStore } from "@/stores";
import { usePrint } from "@/hooks";
import { PrintDischargeSummary } from "@/components/print";
import { calculateAge, formatDate } from "@/lib/utils";

interface DischargeMedicationRow {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface LocalAdmissionState {
  id: string;
  status: "admitted" | "discharged" | "transferred";
}

export function IPDDischargePage() {
  const { addNotification } = useNotificationStore();
  const { printRef, handlePrint } = usePrint();

  const [admissionState, setAdmissionState] = useState<LocalAdmissionState[]>(
    admissions.map((entry) => ({ id: entry.id, status: entry.status }))
  );
  const [selectedAdmissionId, setSelectedAdmissionId] = useState(admissions[0]?.id ?? "");

  const [diagnosisAtDischarge, setDiagnosisAtDischarge] = useState("");
  const [courseInHospital, setCourseInHospital] = useState("");
  const [conditionAtDischarge, setConditionAtDischarge] = useState<
    "stable" | "improved" | "unchanged" | "critical" | "against_advice"
  >("stable");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpInstructions, setFollowUpInstructions] = useState("");
  const [dietaryAdvice, setDietaryAdvice] = useState("");
  const [activityRestrictions, setActivityRestrictions] = useState("");

  const [medications, setMedications] = useState<DischargeMedicationRow[]>([
    {
      id: "med_1",
      name: "",
      dosage: "1 tablet",
      frequency: "1-0-1",
      duration: "5 days",
      instructions: "",
    },
  ]);

  const selectedAdmission = admissions.find((entry) => entry.id === selectedAdmissionId);
  const selectedPatient = patients.find((entry) => entry.id === selectedAdmission?.patientId);
  const selectedLocalState = admissionState.find((entry) => entry.id === selectedAdmissionId);

  const addMedication = () => {
    setMedications((prev) => [
      ...prev,
      {
        id: `med_${Date.now()}`,
        name: "",
        dosage: "1 tablet",
        frequency: "1-0-1",
        duration: "5 days",
        instructions: "",
      },
    ]);
  };

  const updateMedication = (id: string, field: keyof Omit<DischargeMedicationRow, "id">, value: string) => {
    setMedications((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeMedication = (id: string) => {
    setMedications((prev) => prev.filter((row) => row.id !== id));
  };

  const medicationPayload = medications.filter((row) => row.name.trim() !== "");

  const markDischarged = () => {
    if (!selectedAdmission) {
      return;
    }

    setAdmissionState((prev) =>
      prev.map((entry) =>
        entry.id === selectedAdmission.id ? { ...entry, status: "discharged" } : entry
      )
    );

    addNotification({
      title: "Patient Discharged",
      message: `${selectedAdmission.patientName} marked discharged`,
      type: "success",
    });
  };

  const dischargeSummaryData = useMemo(() => {
    if (!selectedAdmission || !selectedPatient) {
      return null;
    }

    return {
      id: `DS-${selectedAdmission.id}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientAge: calculateAge(selectedPatient.dob),
      patientGender: selectedPatient.gender,
      patientPhone: selectedPatient.phone,
      patientAddress: selectedPatient.address,
      admissionId: selectedAdmission.id,
      admissionDate: selectedAdmission.admissionDate,
      dischargeDate: new Date().toISOString(),
      ward: selectedAdmission.wardName,
      bed: selectedAdmission.bedNumber,
      attendingDoctor: selectedAdmission.doctorName,
      department: selectedAdmission.wardName,
      diagnosisAtAdmission: selectedAdmission.diagnosis,
      diagnosisAtDischarge: diagnosisAtDischarge || selectedAdmission.diagnosis,
      courseInHospital,
      conditionAtDischarge,
      dischargeMedications: medicationPayload.map((row) => ({
        name: row.name,
        dosage: row.dosage,
        frequency: row.frequency,
        duration: row.duration,
        instructions: row.instructions,
      })),
      dietaryAdvice: dietaryAdvice
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      activityRestrictions: activityRestrictions
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      followUpInstructions: followUpInstructions
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      followUpDate: followUpDate || undefined,
      emergencyContact: selectedPatient.emergencyPhone,
    } as const;
  }, [
    selectedAdmission,
    selectedPatient,
    diagnosisAtDischarge,
    courseInHospital,
    conditionAtDischarge,
    medicationPayload,
    dietaryAdvice,
    activityRestrictions,
    followUpInstructions,
    followUpDate,
  ]);

  if (!selectedAdmission || !selectedPatient || !selectedLocalState) {
    return <Card className="p-8 text-center text-slate-600">No admission data found.</Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">IPD Discharge</h1>
          <p className="text-slate-500">Prepare summary, medication plan and follow-up at discharge</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Summary
          </Button>
          <Button onClick={markDischarged}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark Discharged
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Admission"
            value={selectedAdmissionId}
            onChange={(e) => setSelectedAdmissionId(e.target.value)}
            options={admissions.map((entry) => ({
              value: entry.id,
              label: `${entry.patientName} • ${entry.bedNumber} • ${formatDate(entry.admissionDate)}`,
            }))}
          />
          <div className="flex items-end">
            <Badge variant={selectedLocalState.status === "discharged" ? "success" : "warning"}>
              {selectedLocalState.status}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card className="space-y-4 p-4">
            <Input
              label="Diagnosis at Discharge"
              value={diagnosisAtDischarge}
              onChange={(e) => setDiagnosisAtDischarge(e.target.value)}
              placeholder={selectedAdmission.diagnosis}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Course in Hospital</label>
              <textarea
                className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={courseInHospital}
                onChange={(e) => setCourseInHospital(e.target.value)}
                placeholder="Short clinical course summary"
              />
            </div>
            <Select
              label="Condition at Discharge"
              value={conditionAtDischarge}
              onChange={(e) =>
                setConditionAtDischarge(
                  e.target.value as "stable" | "improved" | "unchanged" | "critical" | "against_advice"
                )
              }
              options={[
                { value: "stable", label: "Stable" },
                { value: "improved", label: "Improved" },
                { value: "unchanged", label: "Unchanged" },
                { value: "critical", label: "Critical" },
                { value: "against_advice", label: "Against Medical Advice" },
              ]}
            />
          </Card>

          <Card className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Discharge Medication</h2>
              <Button size="sm" onClick={addMedication}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {medications.map((row) => (
                <div key={row.id} className="grid gap-2 rounded-lg border border-slate-200 p-3 lg:grid-cols-12">
                  <div className="lg:col-span-3">
                    <Input value={row.name} onChange={(e) => updateMedication(row.id, "name", e.target.value)} placeholder="Medicine" />
                  </div>
                  <div className="lg:col-span-2">
                    <Input value={row.dosage} onChange={(e) => updateMedication(row.id, "dosage", e.target.value)} placeholder="Dosage" />
                  </div>
                  <div className="lg:col-span-2">
                    <Input value={row.frequency} onChange={(e) => updateMedication(row.id, "frequency", e.target.value)} placeholder="Frequency" />
                  </div>
                  <div className="lg:col-span-2">
                    <Input value={row.duration} onChange={(e) => updateMedication(row.id, "duration", e.target.value)} placeholder="Duration" />
                  </div>
                  <div className="lg:col-span-2">
                    <Input value={row.instructions} onChange={(e) => updateMedication(row.id, "instructions", e.target.value)} placeholder="Instructions" />
                  </div>
                  <div className="flex items-center justify-end lg:col-span-1">
                    <Button variant="ghost" size="icon-sm" disabled={medications.length === 1} onClick={() => removeMedication(row.id)}>
                      <Trash2 className="h-4 w-4 text-danger-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 p-4">
            <Input
              label="Follow-up Date"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
            <Input
              label="Follow-up Instructions (comma separated)"
              value={followUpInstructions}
              onChange={(e) => setFollowUpInstructions(e.target.value)}
              placeholder="Review in OPD, repeat CBC"
            />
            <Input
              label="Dietary Advice (comma separated)"
              value={dietaryAdvice}
              onChange={(e) => setDietaryAdvice(e.target.value)}
              placeholder="Low salt diet, high fluid intake"
            />
            <Input
              label="Activity Restrictions (comma separated)"
              value={activityRestrictions}
              onChange={(e) => setActivityRestrictions(e.target.value)}
              placeholder="No heavy lifting, avoid stairs"
            />
          </Card>
        </div>

        <div>
          <Card className="space-y-2 p-4 text-sm">
            <p className="font-semibold text-slate-900">Patient Snapshot</p>
            <p className="text-slate-600">{selectedPatient.name}</p>
            <p className="text-slate-500">{selectedPatient.id} • {selectedPatient.phone}</p>
            <div className="my-3 border-t border-slate-200" />
            <p className="text-slate-600">Admission: {formatDate(selectedAdmission.admissionDate)}</p>
            <p className="text-slate-600">Ward: {selectedAdmission.wardName}</p>
            <p className="text-slate-600">Bed: {selectedAdmission.bedNumber}</p>
            <p className="text-slate-600">Doctor: {selectedAdmission.doctorName}</p>
          </Card>
        </div>
      </div>

      {dischargeSummaryData && (
        <div className="hidden">
          <div ref={printRef}>
            <PrintDischargeSummary data={dischargeSummaryData} />
          </div>
        </div>
      )}
    </div>
  );
}
