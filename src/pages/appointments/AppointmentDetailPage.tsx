import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Save,
  X,
  PlayCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { useHospitalOpsStore, useAuthStore } from "@/stores";
import { patients, staff } from "@/lib/mock-data";
import { formatDate, cn } from "@/lib/utils";
import { getIdentityColor, getCurrentThemeMode } from "@/lib/theme";
import type { AppointmentStatus } from "@/types";

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "waiting", label: "Waiting" },
  { value: "in-consultation", label: "In Consultation" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const typeOptions = [
  { value: "opd", label: "OPD" },
  { value: "follow-up", label: "Follow-up" },
  { value: "emergency", label: "Emergency" },
];

export function AppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { appointments, updateAppointmentStatus } = useHospitalOpsStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [editData, setEditData] = useState({
    date: "",
    time: "",
    type: "opd" as "opd" | "follow-up" | "emergency",
    notes: "",
  });

  const appointment = useMemo(
    () => appointments.find((a) => a.id === appointmentId),
    [appointments, appointmentId]
  );

  const patient = useMemo(
    () => patients.find((p) => p.id === appointment?.patientId),
    [appointment]
  );

  const doctor = useMemo(
    () => staff.find((s) => s.id === appointment?.doctorId),
    [appointment]
  );

  if (!appointment) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-ink-muted" />
          <p className="mt-4 text-ink-muted">Appointment not found</p>
          <Button className="mt-4" onClick={() => navigate("/appointments")}>
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditData({
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      notes: appointment.notes || "",
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    // In a real app, would call API to update appointment
    // For now, we can only update status via the store
    console.log("Saving appointment changes:", editData);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    updateAppointmentStatus(appointment.id, newStatus);
  };

  const handleCancel = () => {
    if (cancelReason.trim()) {
      updateAppointmentStatus(appointment.id, "cancelled");
      console.log("Cancelled with reason:", cancelReason);
      setShowCancelModal(false);
      setCancelReason("");
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const variants: Record<AppointmentStatus, "success" | "warning" | "danger" | "primary" | "default"> = {
      scheduled: "primary",
      waiting: "warning",
      "in-consultation": "primary",
      completed: "success",
      cancelled: "danger",
    };
    return <Badge variant={variants[status]}>{status.replace("-", " ")}</Badge>;
  };

  const canEdit = user?.role === "admin" || user?.role === "reception";
  const canStartConsultation = user?.role === "doctor" && appointment.status === "waiting";
  const canComplete = user?.role === "doctor" && appointment.status === "in-consultation";
  // Appointment type is a category, not a state — colored via the identity
  // palette so each type keeps a stable, consistent hue everywhere it appears.
  const typeAccent = getIdentityColor(appointment.type, getCurrentThemeMode());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-ink">Appointment Details</h1>
            <p className="text-ink-muted">{appointment.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(appointment.status)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Info Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Appointment Information</CardTitle>
              {canEdit && !isEditing && appointment.status !== "cancelled" && appointment.status !== "completed" && (
                <Button variant="outline" size="sm" onClick={handleStartEdit}>
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Date"
                      type="date"
                      value={editData.date}
                      onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    />
                    <Input
                      label="Time"
                      type="time"
                      value={editData.time}
                      onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                    />
                    <Select
                      label="Type"
                      options={typeOptions}
                      value={editData.type}
                      onChange={(e) => setEditData({ ...editData, type: e.target.value as typeof editData.type })}
                    />
                  </div>
                  <Input
                    label="Notes"
                    placeholder="Additional notes..."
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} className="gap-2">
                      <Save size={16} />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                      <Calendar size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-ink-muted">Date</p>
                      <p className="font-medium text-ink">{formatDate(appointment.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                      <Clock size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-ink-muted">Time</p>
                      <p className="font-medium text-ink">{appointment.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-100">
                      <span className="text-lg font-bold text-warning-600">#{appointment.tokenNumber}</span>
                    </div>
                    <div>
                      <p className="text-sm text-ink-muted">Token Number</p>
                      <p className="font-medium text-ink">{appointment.tokenNumber || "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-ink-muted">Type</p>
                    <span
                      className="mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: `${typeAccent}1f`, color: typeAccent }}
                    >
                      {appointment.type.toUpperCase()}
                    </span>
                  </div>
                  {appointment.notes && (
                    <div className="sm:col-span-2">
                      <p className="text-sm text-ink-muted">Notes</p>
                      <p className="mt-1 text-ink-muted">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-selected text-xl font-bold text-ink-muted">
                  {appointment.patientName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-ink">{appointment.patientName}</h3>
                  <p className="text-sm text-ink-muted">{appointment.patientId}</p>
                  {patient && (
                    <p className="text-sm text-ink-muted">
                      {patient.phone} • {patient.gender} • {patient.bloodGroup || "Blood group N/A"}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/patients/${appointment.patientId}`)}
                >
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope size={18} />
                Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-600">
                  {appointment.doctorName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-ink">{appointment.doctorName}</h3>
                  <p className="text-sm text-ink-muted">{appointment.department}</p>
                  {doctor && (
                    <p className="text-sm text-ink-muted">
                      {doctor.specialization} • {doctor.qualification}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canStartConsultation && (
                <Button
                  className="w-full gap-2"
                  onClick={() => handleStatusChange("in-consultation")}
                >
                  <PlayCircle size={16} />
                  Start Consultation
                </Button>
              )}
              {canComplete && (
                <Button
                  className="w-full gap-2"
                  variant="outline"
                  onClick={() => navigate(`/opd/consultation/${appointment.id}`)}
                >
                  <Stethoscope size={16} />
                  Open EMR
                </Button>
              )}
              {canComplete && (
                <Button
                  className="w-full gap-2 bg-success-500 hover:bg-success-600"
                  onClick={() => handleStatusChange("completed")}
                >
                  <CheckCircle size={16} />
                  Complete Consultation
                </Button>
              )}
              {canEdit && appointment.status !== "cancelled" && appointment.status !== "completed" && (
                <Button
                  variant="danger"
                  className="w-full gap-2"
                  onClick={() => setShowCancelModal(true)}
                >
                  <X size={16} />
                  Cancel Appointment
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/billing/new")}
              >
                Create Invoice
              </Button>
            </CardContent>
          </Card>

          {/* Status Update */}
          {(user?.role === "admin" || user?.role === "reception") && 
           appointment.status !== "cancelled" && 
           appointment.status !== "completed" && (
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  options={statusOptions.filter(
                    (s) => s.value !== "cancelled" && s.value !== "completed"
                  )}
                  value={appointment.status}
                  onChange={(e) => handleStatusChange(e.target.value as AppointmentStatus)}
                />
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                    <Calendar size={14} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Appointment Created</p>
                    <p className="text-xs text-ink-muted">{formatDate(appointment.createdAt)}</p>
                  </div>
                </div>
                {appointment.status === "completed" && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100">
                      <CheckCircle size={14} className="text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Consultation Completed</p>
                      <p className="text-xs text-ink-muted">Today</p>
                    </div>
                  </div>
                )}
                {appointment.status === "cancelled" && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-danger-100">
                      <X size={14} className="text-danger-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Appointment Cancelled</p>
                      <p className="text-xs text-ink-muted">Today</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Appointment"
      >
        <ModalBody>
          <p className="text-ink-muted mb-4">
            Are you sure you want to cancel this appointment? Please provide a reason.
          </p>
          <Input
            label="Cancellation Reason *"
            placeholder="Enter reason for cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCancelModal(false)}>
            Keep Appointment
          </Button>
          <Button variant="danger" onClick={handleCancel} disabled={!cancelReason.trim()}>
            Confirm Cancellation
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
