import { useMemo, useState } from "react";
import { BadgeCheck, Building2, GitPullRequest, Plus, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { patients, staff } from "@/lib/mock-data";
import { useAuthStore, useHospitalOpsStore, useNotificationStore } from "@/stores";
import type { ReferralStatus } from "@/types";
import { formatDate } from "@/lib/utils";

export function ReferralsPage() {
  const { user } = useAuthStore();
  const { referrals, createReferral, updateReferralStatus } = useHospitalOpsStore();
  const { addNotification } = useNotificationStore();

  const [patientId, setPatientId] = useState("");
  const [toType, setToType] = useState<"internal" | "external">("internal");
  const [toDoctorId, setToDoctorId] = useState("");
  const [toSpecialty, setToSpecialty] = useState("");
  const [toHospitalName, setToHospitalName] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState("");
  const [priority, setPriority] = useState<"routine" | "urgent" | "critical">("routine");

  const doctors = staff.filter((member) => member.role === "doctor");

  const visibleReferrals = useMemo(() => {
    if (user?.role === "doctor") {
      return referrals.filter(
        (referral) => referral.toDoctorId === user.id || referral.fromDoctorId === user.id
      );
    }
    return referrals;
  }, [referrals, user]);

  const submitReferral = () => {
    const patient = patients.find((entry) => entry.id === patientId);
    if (!patient || !user || !reason.trim()) {
      return;
    }

    const fromDoctor = doctors.find((doctor) => doctor.id === user.id);
    const targetDoctor = doctors.find((doctor) => doctor.id === toDoctorId);

    const referral = createReferral({
      patientId: patient.id,
      patientName: patient.name,
      fromDoctorId: user.role === "doctor" ? user.id : undefined,
      fromDoctorName: user.role === "doctor" ? user.name : "Front Desk",
      fromDepartment: fromDoctor?.department,
      toType,
      toDoctorId: toType === "internal" ? toDoctorId : undefined,
      toDoctorName: toType === "internal" ? targetDoctor?.name : undefined,
      toSpecialty: toSpecialty || undefined,
      toHospitalName: toType === "external" ? toHospitalName || undefined : undefined,
      reason: reason.trim(),
      notes: notes.trim() || undefined,
      attachments: attachments
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      priority,
      requestedByRole: user.role,
    });

    addNotification({
      title: "Referral Created",
      message: `${referral.patientName} referral request generated`,
      type: "info",
      recipientRoles: ["admin", "reception", "doctor"],
      module: "referrals",
      relatedId: referral.id,
    });

    if (referral.toDoctorId) {
      addNotification({
        title: "New Internal Referral",
        message: `${referral.patientName} referred to you for ${referral.reason}`,
        type: priority === "critical" ? "warning" : "info",
        recipientUserIds: [referral.toDoctorId],
        module: "referrals",
        relatedId: referral.id,
      });
    }

    setPatientId("");
    setToDoctorId("");
    setToSpecialty("");
    setToHospitalName("");
    setReason("");
    setNotes("");
    setAttachments("");
    setPriority("routine");
  };

  const statusVariant: Record<ReferralStatus, "primary" | "warning" | "success" | "danger" | "info" | "default"> = {
    requested: "warning",
    accepted: "info",
    "in-progress": "primary",
    completed: "success",
    declined: "danger",
  };

  const setStatus = (referralId: string, status: ReferralStatus) => {
    updateReferralStatus(referralId, status);
    addNotification({
      title: "Referral Updated",
      message: `Referral ${referralId} moved to ${status}`,
      type: status === "completed" ? "success" : "info",
      recipientRoles: ["admin", "reception", "doctor"],
      module: "referrals",
      relatedId: referralId,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Patient Referrals</h1>
        <p className="text-slate-500">Internal junior-to-senior and external specialist referrals</p>
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Plus className="h-4 w-4" />
          <p className="font-semibold">Create Referral</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Select
            label="Patient"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            options={[
              { value: "", label: "Select patient" },
              ...patients.map((patient) => ({ value: patient.id, label: `${patient.name} (${patient.id})` })),
            ]}
          />

          <Select
            label="Referral Type"
            value={toType}
            onChange={(e) => setToType(e.target.value as "internal" | "external")}
            options={[
              { value: "internal", label: "Internal (Doctor to Doctor)" },
              { value: "external", label: "External Specialist/Hospital" },
            ]}
          />

          {toType === "internal" ? (
            <Select
              label="Referred To Doctor"
              value={toDoctorId}
              onChange={(e) => setToDoctorId(e.target.value)}
              options={[
                { value: "", label: "Select doctor" },
                ...doctors.map((doctor) => ({
                  value: doctor.id,
                  label: `${doctor.name} - ${doctor.department}`,
                })),
              ]}
            />
          ) : (
            <Input
              label="Hospital / Specialist Name"
              value={toHospitalName}
              onChange={(e) => setToHospitalName(e.target.value)}
              placeholder="City Heart Centre / Dr. Specialist"
            />
          )}

          <Input
            label="Specialty"
            value={toSpecialty}
            onChange={(e) => setToSpecialty(e.target.value)}
            placeholder="Cardiology, Oncology, Neurology"
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as "routine" | "urgent" | "critical")}
            options={[
              { value: "routine", label: "Routine" },
              { value: "urgent", label: "Urgent" },
              { value: "critical", label: "Critical" },
            ]}
          />

          <Input
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Need senior opinion for persistent chest pain"
          />

          <Input
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Attach previous ECG and blood report"
          />
          <Input
            label="Attachments (comma separated)"
            value={attachments}
            onChange={(e) => setAttachments(e.target.value)}
            placeholder="ecg-report.pdf, discharge-summary.pdf"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={submitReferral}>
            <GitPullRequest className="mr-2 h-4 w-4" />
            Create Referral
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {visibleReferrals.map((referral) => (
          <Card key={referral.id} className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{referral.patientName}</p>
                  <Badge variant={statusVariant[referral.status]}>{referral.status}</Badge>
                  <Badge variant={referral.priority === "critical" ? "danger" : referral.priority === "urgent" ? "warning" : "default"}>
                    {referral.priority}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{referral.reason}</p>
                <p className="text-xs text-slate-500">
                  {referral.toType === "internal" ? (
                    <span className="inline-flex items-center gap-1"><Stethoscope className="h-3 w-3" /> To: {referral.toDoctorName}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> To: {referral.toHospitalName}</span>
                  )}
                  {" • "}
                  Requested {formatDate(referral.requestedAt)} by {referral.fromDoctorName}
                </p>
                {referral.attachments && referral.attachments.length > 0 && (
                  <p className="text-xs text-slate-500">
                    Attachments: {referral.attachments.join(", ")}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {user?.role === "doctor" && referral.status === "requested" && referral.toDoctorId === user.id && (
                  <Button size="sm" variant="outline" onClick={() => setStatus(referral.id, "accepted")}>
                    Accept
                  </Button>
                )}
                {referral.status === "accepted" && (
                  <Button size="sm" variant="outline" onClick={() => setStatus(referral.id, "in-progress")}>
                    Start
                  </Button>
                )}
                {referral.status === "in-progress" && (
                  <Button size="sm" onClick={() => setStatus(referral.id, "completed")}>
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {visibleReferrals.length === 0 && (
        <Card className="p-10 text-center text-slate-500">No referrals yet.</Card>
      )}
    </div>
  );
}
