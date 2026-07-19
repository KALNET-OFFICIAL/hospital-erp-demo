import { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Save,
  User,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { staff as mockStaff } from "@/lib/mock-data";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  slotDuration: number; // minutes
  maxPatients: number;
}

interface DaySchedule {
  day: string;
  isAvailable: boolean;
  slots: TimeSlot[];
}

interface LeaveEntry {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

// Mock data
const mockSchedules: Record<string, DaySchedule[]> = {
  DOC001: [
    { day: "monday", isAvailable: true, slots: [{ id: "s1", startTime: "09:00", endTime: "13:00", slotDuration: 15, maxPatients: 16 }, { id: "s2", startTime: "17:00", endTime: "20:00", slotDuration: 15, maxPatients: 12 }] },
    { day: "tuesday", isAvailable: true, slots: [{ id: "s3", startTime: "09:00", endTime: "13:00", slotDuration: 15, maxPatients: 16 }] },
    { day: "wednesday", isAvailable: true, slots: [{ id: "s4", startTime: "09:00", endTime: "13:00", slotDuration: 15, maxPatients: 16 }, { id: "s5", startTime: "17:00", endTime: "20:00", slotDuration: 15, maxPatients: 12 }] },
    { day: "thursday", isAvailable: true, slots: [{ id: "s6", startTime: "09:00", endTime: "13:00", slotDuration: 15, maxPatients: 16 }] },
    { day: "friday", isAvailable: true, slots: [{ id: "s7", startTime: "09:00", endTime: "13:00", slotDuration: 15, maxPatients: 16 }, { id: "s8", startTime: "17:00", endTime: "20:00", slotDuration: 15, maxPatients: 12 }] },
    { day: "saturday", isAvailable: true, slots: [{ id: "s9", startTime: "10:00", endTime: "14:00", slotDuration: 20, maxPatients: 12 }] },
    { day: "sunday", isAvailable: false, slots: [] },
  ],
};

const mockLeaves: LeaveEntry[] = [
  { id: "L001", startDate: "2024-02-10", endDate: "2024-02-12", reason: "Personal", status: "approved" },
  { id: "L002", startDate: "2024-03-01", endDate: "2024-03-05", reason: "Conference", status: "pending" },
];

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function DoctorAvailabilityPage() {
  const doctors = mockStaff.filter((s) => s.role === "doctor");
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]?.id || "");
  const [schedules, setSchedules] = useState<DaySchedule[]>(
    mockSchedules.DOC001 || days.map((d) => ({ day: d, isAvailable: false, slots: [] }))
  );
  const [leaves, setLeaves] = useState<LeaveEntry[]>(mockLeaves);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState<Partial<TimeSlot>>({
    startTime: "09:00",
    endTime: "13:00",
    slotDuration: 15,
    maxPatients: 16,
  });
  const [newLeave, setNewLeave] = useState<Partial<LeaveEntry>>({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleToggleDay = (day: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.day === day ? { ...s, isAvailable: !s.isAvailable } : s
      )
    );
  };

  const handleAddSlot = () => {
    if (!editingDay || !newSlot.startTime || !newSlot.endTime) return;

    const slot: TimeSlot = {
      id: `slot_${Date.now()}`,
      startTime: newSlot.startTime!,
      endTime: newSlot.endTime!,
      slotDuration: newSlot.slotDuration || 15,
      maxPatients: newSlot.maxPatients || 16,
    };

    setSchedules((prev) =>
      prev.map((s) =>
        s.day === editingDay
          ? { ...s, isAvailable: true, slots: [...s.slots, slot] }
          : s
      )
    );

    setIsSlotModalOpen(false);
    setNewSlot({ startTime: "09:00", endTime: "13:00", slotDuration: 15, maxPatients: 16 });
  };

  const handleDeleteSlot = (day: string, slotId: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.day === day ? { ...s, slots: s.slots.filter((sl) => sl.id !== slotId) } : s
      )
    );
  };

  const handleCopyToAll = (fromDay: string) => {
    const sourceSchedule = schedules.find((s) => s.day === fromDay);
    if (!sourceSchedule) return;

    setSchedules((prev) =>
      prev.map((s) =>
        s.day !== fromDay
          ? {
              ...s,
              isAvailable: sourceSchedule.isAvailable,
              slots: sourceSchedule.slots.map((sl) => ({ ...sl, id: `${s.day}_${sl.id}` })),
            }
          : s
      )
    );
  };

  const handleAddLeave = () => {
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) return;

    const leave: LeaveEntry = {
      id: `L${Date.now()}`,
      startDate: newLeave.startDate!,
      endDate: newLeave.endDate!,
      reason: newLeave.reason!,
      status: "pending",
    };

    setLeaves([...leaves, leave]);
    setIsLeaveModalOpen(false);
    setNewLeave({ startDate: "", endDate: "", reason: "" });
  };

  const handleCancelLeave = (id: string) => {
    setLeaves(leaves.filter((l) => l.id !== id));
  };

  const selectedDoctorInfo = doctors.find((d) => d.id === selectedDoctor);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Doctor Availability</h1>
          <p className="text-ink-muted">Configure working hours and leaves</p>
        </div>
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Doctor Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <Select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              options={doctors.map((d) => ({ value: d.id, label: `${d.name} - ${d.specialization || d.department}` }))}
            />
          </div>
          {selectedDoctorInfo && (
            <div className="text-right">
              <p className="text-sm text-ink-muted">{selectedDoctorInfo.department}</p>
              <p className="text-sm text-ink-muted">{selectedDoctorInfo.phone}</p>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Weekly Schedule</h2>

          {schedules.map((schedule) => (
            <Card key={schedule.day} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleDay(schedule.day)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      schedule.isAvailable
                        ? "bg-success-50 text-success-600"
                        : "bg-slate-100 text-ink-muted"
                    }`}
                  >
                    {schedule.isAvailable ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <p className="font-semibold capitalize">{schedule.day}</p>
                    <p className="text-sm text-ink-muted">
                      {schedule.isAvailable
                        ? `${schedule.slots.length} slot(s)`
                        : "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToAll(schedule.day)}
                    disabled={!schedule.isAvailable}
                    title="Copy to all days"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingDay(schedule.day);
                      setIsSlotModalOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {schedule.isAvailable && schedule.slots.length > 0 && (
                <div className="mt-4 space-y-2">
                  {schedule.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 bg-hover rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-ink-muted" />
                        <span className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <Badge variant="primary">{slot.slotDuration} min slots</Badge>
                        <Badge variant="default">{slot.maxPatients} patients</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSlot(schedule.day, slot.id)}
                        className="text-danger-500 hover:text-danger-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Leaves Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Leaves</h2>
            <Button size="sm" onClick={() => setIsLeaveModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Leave
            </Button>
          </div>

          <Card className="p-4">
            <div className="space-y-3">
              {leaves.length === 0 ? (
                <p className="text-ink-muted text-center py-4">No upcoming leaves</p>
              ) : (
                leaves.map((leave) => (
                  <div
                    key={leave.id}
                    className={`p-3 bg-hover rounded-lg border-l-4 ${
                      leave.status === "approved"
                        ? "border-l-success-400"
                        : leave.status === "rejected"
                        ? "border-l-danger-400"
                        : "border-l-warning-400"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {new Date(leave.startDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          -{" "}
                          {new Date(leave.endDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-ink-muted">{leave.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            leave.status === "approved"
                              ? "success"
                              : leave.status === "rejected"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {leave.status}
                        </Badge>
                        {leave.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelLeave(leave.id)}
                            className="text-danger-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-4">
            <h3 className="text-sm font-medium text-ink-muted mb-3">This Month</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">24</p>
                <p className="text-xs text-ink-muted">Working Days</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning-600">2</p>
                <p className="text-xs text-ink-muted">Leave Days</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success-600">156</p>
                <p className="text-xs text-ink-muted">Available Slots</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-ink">89</p>
                <p className="text-xs text-ink-muted">Booked</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title={`Add Slot - ${editingDay?.charAt(0).toUpperCase()}${editingDay?.slice(1)}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={newSlot.startTime || ""}
              onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
            />
            <Input
              label="End Time"
              type="time"
              value={newSlot.endTime || ""}
              onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Slot Duration"
              value={String(newSlot.slotDuration || 15)}
              onChange={(e) => setNewSlot({ ...newSlot, slotDuration: parseInt(e.target.value) })}
              options={[
                { value: "10", label: "10 minutes" },
                { value: "15", label: "15 minutes" },
                { value: "20", label: "20 minutes" },
                { value: "30", label: "30 minutes" },
                { value: "45", label: "45 minutes" },
                { value: "60", label: "60 minutes" },
              ]}
            />
            <Input
              label="Max Patients"
              type="number"
              value={String(newSlot.maxPatients || 16)}
              onChange={(e) => setNewSlot({ ...newSlot, maxPatients: parseInt(e.target.value) })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsSlotModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSlot}>Add Slot</Button>
          </div>
        </div>
      </Modal>

      {/* Add Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Request Leave"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={newLeave.startDate || ""}
              onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={newLeave.endDate || ""}
              onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
            />
          </div>
          <Input
            label="Reason"
            value={newLeave.reason || ""}
            onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
            placeholder="e.g., Personal, Conference, Vacation"
          />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsLeaveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLeave}>Submit Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
