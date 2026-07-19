import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Printer, Save, CheckCircle2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PrintPrescription } from "@/components/print";
import { usePrint } from "@/hooks";
import { patients, medicines } from "@/lib/mock-data";
import { useHospitalOpsStore, useNotificationStore } from "@/stores";
import type { EMRRecord, PrescriptionItem } from "@/types";
import { calculateAge, formatDate } from "@/lib/utils";

const STORAGE_KEY = "hos_emr_records";

interface PrescriptionRow extends PrescriptionItem {
  id: string;
}

interface EMRExtendedState {
  symptoms: string;
  diagnosis: string;
  notes: string;
  attachments: string;
  labTests: string;
  advice: string;
  followUp: string;
}

function readEMRRecords(): EMRRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as EMRRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEMRRecords(records: EMRRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function parseCSV(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function OPDConsultationPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { appointments, updateAppointmentStatus } = useHospitalOpsStore();
  const { printRef, handlePrint } = usePrint();

  const appointment = appointments.find((entry) => entry.id === visitId);
  const patient = patients.find((entry) => entry.id === appointment?.patientId);

  const [emrState, setEmrState] = useState<EMRExtendedState>({
    symptoms: "",
    diagnosis: "",
    notes: "",
    attachments: "",
    labTests: "",
    advice: "",
    followUp: "",
  });

  const [prescriptionRows, setPrescriptionRows] = useState<PrescriptionRow[]>([
    {
      id: "row_1",
      medicineId: "",
      medicineName: "",
      dosage: "1 tablet",
      frequency: "1-0-1",
      duration: "5 days",
      instructions: "",
    },
  ]);

  useEffect(() => {
    if (!visitId) {
      return;
    }

    const existingRecord = readEMRRecords().find((record) => record.visitId === visitId);
    if (!existingRecord) {
      return;
    }

    setEmrState({
      symptoms: existingRecord.symptoms.join(", "),
      diagnosis: existingRecord.diagnosis,
      notes: existingRecord.notes ?? "",
      attachments: existingRecord.attachments?.join(", ") ?? "",
      labTests: existingRecord.labTests?.join(", ") ?? "",
      advice: existingRecord.advice?.join(", ") ?? "",
      followUp: existingRecord.followUp ?? "",
    });

    setPrescriptionRows(
      existingRecord.prescription.length > 0
        ? existingRecord.prescription.map((item, index) => ({
            id: `row_${index + 1}`,
            ...item,
          }))
        : [
            {
              id: "row_1",
              medicineId: "",
              medicineName: "",
              dosage: "1 tablet",
              frequency: "1-0-1",
              duration: "5 days",
              instructions: "",
            },
          ]
    );
  }, [visitId]);

  const validPrescription = prescriptionRows.filter((row) => row.medicineName.trim() !== "");

  const saveEMR = (markComplete: boolean) => {
    if (!appointment || !patient) {
      return;
    }

    const record: EMRRecord = {
      id: `EMR_${appointment.id}`,
      patientId: patient.id,
      visitId: appointment.id,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      date: new Date().toISOString(),
      symptoms: parseCSV(emrState.symptoms),
      diagnosis: emrState.diagnosis,
      prescription: validPrescription,
      notes: emrState.notes,
      attachments: parseCSV(emrState.attachments),
      labTests: parseCSV(emrState.labTests),
      advice: parseCSV(emrState.advice),
      followUp: emrState.followUp,
    };

    const records = readEMRRecords();
    const updated = records.some((entry) => entry.visitId === appointment.id)
      ? records.map((entry) => (entry.visitId === appointment.id ? record : entry))
      : [record, ...records];

    writeEMRRecords(updated);

    addNotification({
      title: markComplete ? "Consultation Completed" : "EMR Saved",
      message: `${patient.name} (${appointment.id}) updated successfully`,
      type: "success",
      recipientRoles: ["admin", "doctor", "reception"],
      module: "opd",
      relatedId: appointment.id,
    });

    if (markComplete) {
      updateAppointmentStatus(appointment.id, "completed");
      addNotification({
        title: "Billing Handover Created",
        message: `Billing task generated for ${patient.name}`,
        type: "info",
        recipientRoles: ["reception", "admin"],
        module: "billing",
        relatedId: appointment.id,
      });
      addNotification({
        title: "Pharmacy Handover Created",
        message: `Pharmacy follow-up task generated for ${patient.name}`,
        type: "info",
        recipientRoles: ["pharmacist", "admin"],
        module: "pharmacy",
        relatedId: appointment.id,
      });
      navigate("/opd");
    }
  };

  const addPrescriptionRow = () => {
    setPrescriptionRows((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}`,
        medicineId: "",
        medicineName: "",
        dosage: "1 tablet",
        frequency: "1-0-1",
        duration: "5 days",
        instructions: "",
      },
    ]);
  };

  const updatePrescriptionRow = (rowId: string, field: keyof PrescriptionItem, value: string) => {
    setPrescriptionRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        if (field === "medicineId") {
          const match = medicines.find((medicine) => medicine.id === value);
          return {
            ...row,
            medicineId: value,
            medicineName: match?.name ?? row.medicineName,
          };
        }

        return {
          ...row,
          [field]: value,
        };
      })
    );
  };

  const removePrescriptionRow = (rowId: string) => {
    setPrescriptionRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const printData = useMemo(() => {
    return {
      id: `RX-${appointment?.id ?? "NA"}`,
      patientId: patient?.id ?? "",
      patientName: patient?.name ?? "",
      patientAge: patient ? calculateAge(patient.dob) : undefined,
      patientGender: patient?.gender,
      patientPhone: patient?.phone,
      patientAddress: patient?.address,
      doctorName: appointment?.doctorName ?? "",
      department: appointment?.department,
      diagnosis: emrState.diagnosis,
      symptoms: parseCSV(emrState.symptoms),
      medicines: validPrescription.map((row) => ({
        name: row.medicineName,
        dosage: row.dosage,
        frequency: row.frequency,
        duration: row.duration,
        instructions: row.instructions,
      })),
      labTests: parseCSV(emrState.labTests),
      advice: parseCSV(emrState.advice),
      followUp: emrState.followUp,
      date: new Date().toISOString(),
    };
  }, [appointment, patient, emrState, validPrescription]);

  if (!appointment || !patient) {
    return (
      <Card className="p-8 text-center">
        <p className="text-ink-muted">Consultation visit not found.</p>
        <Button className="mt-4" onClick={() => navigate("/opd")}>Back to OPD</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/opd")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Queue
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-ink">OPD Consultation</h1>
            <p className="text-ink-muted">Visit #{appointment.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Prescription
          </Button>
          <Button variant="outline" onClick={() => saveEMR(false)}>
            <Save className="mr-2 h-4 w-4" />
            Save EMR
          </Button>
          <Button onClick={() => saveEMR(true)}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Complete
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="primary">{patient.id}</Badge>
          <span className="font-semibold text-ink">{patient.name}</span>
          <span className="text-sm text-ink-muted">{calculateAge(patient.dob)} yrs • {patient.gender}</span>
          <span className="text-sm text-ink-muted">{patient.phone}</span>
          <span className="text-sm text-ink-muted">{appointment.doctorName}</span>
          <span className="text-sm text-ink-muted">{formatDate(appointment.date)} {appointment.time}</span>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card className="space-y-4 p-4">
            <Input
              label="Symptoms (comma separated)"
              value={emrState.symptoms}
              onChange={(e) => setEmrState((prev) => ({ ...prev, symptoms: e.target.value }))}
              placeholder="Fever, cough, headache"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-muted">Diagnosis</label>
              <textarea
                className="min-h-20 w-full rounded-lg border border-line px-3 py-2 text-sm"
                value={emrState.diagnosis}
                onChange={(e) => setEmrState((prev) => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Primary diagnosis"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-muted">Clinical Notes</label>
              <textarea
                className="min-h-24 w-full rounded-lg border border-line px-3 py-2 text-sm"
                value={emrState.notes}
                onChange={(e) => setEmrState((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Examination findings, plan"
              />
            </div>
            <Input
              label="Attachments (comma separated file names)"
              value={emrState.attachments}
              onChange={(e) => setEmrState((prev) => ({ ...prev, attachments: e.target.value }))}
              placeholder="cbc-report.pdf, xray-chest.jpg"
            />
          </Card>

          <Card className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Prescription</h2>
              <Button size="sm" onClick={addPrescriptionRow}>
                <Plus className="mr-2 h-4 w-4" />
                Add Medicine
              </Button>
            </div>

            <div className="space-y-3">
              {prescriptionRows.map((row) => (
                <div key={row.id} className="grid gap-2 rounded-lg border border-line p-3 lg:grid-cols-12">
                  <div className="lg:col-span-3">
                    <Select
                      value={row.medicineId}
                      onChange={(e) => updatePrescriptionRow(row.id, "medicineId", e.target.value)}
                      options={[
                        { value: "", label: "Select medicine" },
                        ...medicines.map((medicine) => ({ value: medicine.id, label: medicine.name })),
                      ]}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Input
                      value={row.dosage}
                      onChange={(e) => updatePrescriptionRow(row.id, "dosage", e.target.value)}
                      placeholder="Dosage"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Input
                      value={row.frequency}
                      onChange={(e) => updatePrescriptionRow(row.id, "frequency", e.target.value)}
                      placeholder="Frequency"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Input
                      value={row.duration}
                      onChange={(e) => updatePrescriptionRow(row.id, "duration", e.target.value)}
                      placeholder="Duration"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Input
                      value={row.instructions ?? ""}
                      onChange={(e) => updatePrescriptionRow(row.id, "instructions", e.target.value)}
                      placeholder="Instructions"
                    />
                  </div>
                  <div className="flex items-center justify-end lg:col-span-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removePrescriptionRow(row.id)}
                      disabled={prescriptionRows.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-danger-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-3 p-4">
            <Input
              label="Lab Tests (comma separated)"
              value={emrState.labTests}
              onChange={(e) => setEmrState((prev) => ({ ...prev, labTests: e.target.value }))}
              placeholder="CBC, ESR"
            />
            <Input
              label="Advice (comma separated)"
              value={emrState.advice}
              onChange={(e) => setEmrState((prev) => ({ ...prev, advice: e.target.value }))}
              placeholder="Hydration, rest"
            />
            <Input
              label="Follow-up"
              value={emrState.followUp}
              onChange={(e) => setEmrState((prev) => ({ ...prev, followUp: e.target.value }))}
              placeholder="After 5 days"
            />
          </Card>

          <Card className="space-y-2 p-4 text-sm">
            <p className="font-semibold text-ink">Visit Snapshot</p>
            <p className="text-ink-muted">Token: #{appointment.tokenNumber}</p>
            <p className="text-ink-muted">Department: {appointment.department}</p>
            <p className="text-ink-muted">Status: {appointment.status}</p>
          </Card>
        </div>
      </div>

      <div className="hidden">
        <div ref={printRef}>
          <PrintPrescription data={printData} />
        </div>
      </div>
    </div>
  );
}
