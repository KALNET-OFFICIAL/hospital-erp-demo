import { useState } from "react";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from "date-fns";
import { staff } from "@/lib/mock-data";
import { getIdentityColor, getCurrentThemeMode } from "@/lib/theme";

interface Schedule {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0-6 (Sun-Sat)
  startTime: string;
  endTime: string;
  type: "opd" | "surgery" | "rounds" | "on-call";
  location?: string;
}

const mockSchedules: Schedule[] = [
  { id: "SCH001", doctorId: "DOC001", dayOfWeek: 1, startTime: "09:00", endTime: "13:00", type: "opd", location: "OPD Room 1" },
  { id: "SCH002", doctorId: "DOC001", dayOfWeek: 1, startTime: "14:00", endTime: "17:00", type: "surgery", location: "OT 2" },
  { id: "SCH003", doctorId: "DOC001", dayOfWeek: 2, startTime: "09:00", endTime: "13:00", type: "opd", location: "OPD Room 1" },
  { id: "SCH004", doctorId: "DOC001", dayOfWeek: 3, startTime: "08:00", endTime: "12:00", type: "rounds" },
  { id: "SCH005", doctorId: "DOC001", dayOfWeek: 4, startTime: "09:00", endTime: "17:00", type: "opd", location: "OPD Room 1" },
  { id: "SCH006", doctorId: "DOC001", dayOfWeek: 5, startTime: "09:00", endTime: "13:00", type: "surgery", location: "OT 1" },
  { id: "SCH007", doctorId: "DOC002", dayOfWeek: 1, startTime: "10:00", endTime: "14:00", type: "opd", location: "OPD Room 2" },
  { id: "SCH008", doctorId: "DOC002", dayOfWeek: 2, startTime: "09:00", endTime: "17:00", type: "opd", location: "OPD Room 2" },
  { id: "SCH009", doctorId: "DOC002", dayOfWeek: 3, startTime: "14:00", endTime: "18:00", type: "surgery", location: "OT 1" },
  { id: "SCH010", doctorId: "DOC002", dayOfWeek: 6, startTime: "09:00", endTime: "13:00", type: "on-call" },
  { id: "SCH011", doctorId: "DOC003", dayOfWeek: 1, startTime: "09:00", endTime: "13:00", type: "opd", location: "OPD Room 3" },
  { id: "SCH012", doctorId: "DOC003", dayOfWeek: 2, startTime: "14:00", endTime: "18:00", type: "surgery", location: "OT 2" },
  { id: "SCH013", doctorId: "DOC003", dayOfWeek: 4, startTime: "09:00", endTime: "15:00", type: "opd", location: "OPD Room 3" },
  { id: "SCH014", doctorId: "DOC004", dayOfWeek: 1, startTime: "10:00", endTime: "16:00", type: "opd", location: "Pediatrics" },
  { id: "SCH015", doctorId: "DOC004", dayOfWeek: 3, startTime: "09:00", endTime: "14:00", type: "opd", location: "Pediatrics" },
  { id: "SCH016", doctorId: "DOC004", dayOfWeek: 5, startTime: "10:00", endTime: "16:00", type: "opd", location: "Pediatrics" },
  { id: "SCH017", doctorId: "DOC005", dayOfWeek: 1, startTime: "08:00", endTime: "12:00", type: "rounds", location: "Cardiac Ward" },
  { id: "SCH018", doctorId: "DOC005", dayOfWeek: 2, startTime: "09:00", endTime: "17:00", type: "opd", location: "Cardiology OPD" },
  { id: "SCH019", doctorId: "DOC005", dayOfWeek: 4, startTime: "09:00", endTime: "13:00", type: "surgery", location: "Cath Lab" },
  { id: "SCH020", doctorId: "DOC005", dayOfWeek: 0, startTime: "10:00", endTime: "14:00", type: "on-call" },
];

// Schedule type is a category, not a state — colored via the identity
// palette (getIdentityColor) below so each type keeps a stable, consistent
// hue everywhere it appears instead of a hand-picked hex per type.
const scheduleTypes = [
  { value: "opd", label: "OPD" },
  { value: "surgery", label: "Surgery" },
  { value: "rounds", label: "Rounds" },
  { value: "on-call", label: "On-Call" },
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const timeSlots = Array.from({ length: 12 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

export function DoctorSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Schedule>>({});

  const doctors = staff.filter((s) => s.role === "doctor");
  const filteredSchedules = selectedDoctor
    ? schedules.filter((s) => s.doctorId === selectedDoctor)
    : schedules;

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const openScheduleModal = (schedule?: Schedule, dayOfWeek?: number) => {
    if (schedule) {
      setFormData(schedule);
      setEditingSchedule(schedule);
    } else {
      setFormData({
        dayOfWeek: dayOfWeek ?? 1,
        startTime: "09:00",
        endTime: "17:00",
        type: "opd",
        doctorId: selectedDoctor || doctors[0]?.id,
      });
      setEditingSchedule(null);
    }
    setShowScheduleModal(true);
  };

  const saveSchedule = () => {
    if (editingSchedule) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === editingSchedule.id ? { ...s, ...formData } as Schedule : s))
      );
    } else {
      const newSchedule: Schedule = {
        id: `SCH${String(schedules.length + 1).padStart(3, "0")}`,
        doctorId: formData.doctorId || "",
        dayOfWeek: formData.dayOfWeek ?? 1,
        startTime: formData.startTime || "09:00",
        endTime: formData.endTime || "17:00",
        type: formData.type || "opd",
        location: formData.location,
      };
      setSchedules((prev) => [...prev, newSchedule]);
    }
    setShowScheduleModal(false);
    setFormData({});
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setShowDeleteConfirm(null);
  };

  const getSchedulesForDayAndTime = (dayOfWeek: number) => {
    return filteredSchedules
      .filter((s) => s.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getTypeAccent = (type: Schedule["type"]) => {
    return getIdentityColor(type, getCurrentThemeMode());
  };

  const getDoctorName = (doctorId: string) => {
    return doctors.find((d) => d.id === doctorId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Doctor Schedules</h1>
          <p className="text-ink-muted">Manage doctor work schedules and shifts</p>
        </div>
        <Button className="gap-2" onClick={() => openScheduleModal()}>
          <Plus size={16} />
          Add Schedule
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <select
            className="rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">All Doctors</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} - {doc.specialization}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
            <ChevronLeft size={16} />
          </Button>
          <span className="px-4 text-sm font-medium text-ink-muted">
            {format(currentWeek, "MMM d")} - {format(addDays(currentWeek, 6), "MMM d, yyyy")}
          </span>
          <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
            <ChevronRight size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            Today
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {scheduleTypes.map((type) => {
          const accent = getTypeAccent(type.value as Schedule["type"]);
          return (
            <div key={type.value} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: `${accent}1f`, borderColor: accent }}
              />
              <span className="text-sm text-ink-muted">{type.label}</span>
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div className="bg-paper rounded-xl border border-line overflow-hidden">
        <div className="grid grid-cols-8 border-b border-line">
          <div className="p-3 text-center text-sm font-medium text-ink-muted bg-slate-50">
            Time
          </div>
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={cn(
                "p-3 text-center border-l border-line",
                isSameDay(day, new Date()) ? "bg-selected" : "bg-slate-50"
              )}
            >
              <p className="text-xs text-ink-muted">{dayNames[day.getDay()]}</p>
              <p className={cn(
                "text-lg font-semibold",
                isSameDay(day, new Date()) ? "text-primary-600" : "text-ink"
              )}>
                {format(day, "d")}
              </p>
            </div>
          ))}
        </div>

        <div className="divide-y divide-line">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 min-h-[60px]">
              <div className="p-2 text-xs text-ink-muted bg-slate-50 border-r border-line">
                {time}
              </div>
              {weekDays.map((day, dayIndex) => {
                const daySchedules = getSchedulesForDayAndTime(day.getDay()).filter(
                  (s) => s.startTime <= time && s.endTime > time
                );
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "p-1 border-l border-line relative cursor-pointer hover:bg-hover",
                      isSameDay(day, new Date()) && "bg-selected"
                    )}
                    onClick={() => openScheduleModal(undefined, day.getDay())}
                  >
                    {daySchedules.map((schedule) => {
                      const accent = getTypeAccent(schedule.type);
                      return schedule.startTime === time && (
                        <div
                          key={schedule.id}
                          className="p-1.5 rounded text-xs border cursor-pointer"
                          style={{
                            backgroundColor: `${accent}1f`,
                            borderColor: accent,
                            color: accent,
                            position: "absolute",
                            top: "2px",
                            left: "2px",
                            right: "2px",
                            zIndex: 10,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openScheduleModal(schedule);
                          }}
                        >
                          <p className="font-medium truncate">
                            {!selectedDoctor && getDoctorName(schedule.doctorId)}
                          </p>
                          <p className="truncate">
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                          {schedule.location && (
                            <p className="truncate opacity-75">{schedule.location}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title={editingSchedule ? "Edit Schedule" : "Add Schedule"}
        className="max-w-lg"
      >
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-1.5">Doctor</label>
              <select
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.doctorId || ""}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              >
                <option value="">Select doctor...</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-muted mb-1.5">Day of Week</label>
              <select
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.dayOfWeek ?? 1}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
              >
                {dayNames.map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-1.5">Start Time</label>
                <input
                  type="time"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.startTime || "09:00"}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-1.5">End Time</label>
                <input
                  type="time"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.endTime || "17:00"}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-muted mb-1.5">Schedule Type</label>
              <select
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.type || "opd"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Schedule["type"] })}
              >
                {scheduleTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-muted mb-1.5">Location</label>
              <input
                type="text"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., OPD Room 1, OT 2"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          {editingSchedule && (
            <Button
              variant="danger"
              onClick={() => {
                setShowScheduleModal(false);
                setShowDeleteConfirm(editingSchedule.id);
              }}
              className="mr-auto"
            >
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
            Cancel
          </Button>
          <Button onClick={saveSchedule} disabled={!formData.doctorId}>
            {editingSchedule ? "Save Changes" : "Add Schedule"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <ModalBody>
          <p className="text-ink-muted">
            Are you sure you want to delete this schedule?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => showDeleteConfirm && deleteSchedule(showDeleteConfirm)}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
