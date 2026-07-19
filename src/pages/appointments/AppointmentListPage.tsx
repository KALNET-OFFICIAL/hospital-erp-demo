import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Clock, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuthStore, useHospitalOpsStore } from "@/stores";
import { formatDate } from "@/lib/utils";
import { BookAppointmentModal } from "@/components/appointments/BookAppointmentModal";

export function AppointmentListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { appointments } = useHospitalOpsStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [showBookModal, setShowBookModal] = useState(false);

  const filtered = useMemo(() => {
    return appointments.filter((appointment) => {
      if (user?.role === "doctor" && appointment.doctorId !== user.id) {
        return false;
      }
      const matchesQuery =
        appointment.patientName.toLowerCase().includes(query.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(query.toLowerCase()) ||
        appointment.id.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || appointment.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, appointments, user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Appointment List</h1>
          <p className="text-ink-muted">Track all bookings and consultation states</p>
        </div>
        <Button onClick={() => setShowBookModal(true)} className="gap-2">
          <Plus size={16} />
          Book Appointment
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            icon={<Search size={16} />}
            placeholder="Search patient, doctor, appointment ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="h-10 rounded-lg border border-line px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="waiting">Waiting</option>
            <option value="in-consultation">In Consultation</option>
            <option value="completed">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.map((appointment) => (
          <Card key={appointment.id} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-ink">{appointment.patientName}</p>
                <p className="text-sm text-ink-muted">{appointment.id}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {appointment.doctorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(appointment.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {appointment.time}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Token #{appointment.tokenNumber}</Badge>
                <Badge
                  variant={
                    appointment.status === "completed"
                      ? "success"
                      : appointment.status === "in-consultation"
                      ? "warning"
                      : appointment.status === "cancelled"
                      ? "danger"
                      : "primary"
                  }
                >
                  {appointment.status}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
      />
    </div>
  );
}
