import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { staff, appointments as mockAppointments } from "@/lib/mock-data";
import { useAuthStore, useHospitalOpsStore } from "@/stores";
import { BookAppointmentModal } from "@/components/appointments/BookAppointmentModal";

type ViewMode = "day" | "week";

export function AppointmentCalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { appointments } = useHospitalOpsStore();
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(
    user?.role === "doctor" ? user.id : null
  );
  const [showBookModal, setShowBookModal] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState<string | undefined>();

  const doctors = staff.filter((s) => s.role === "doctor");

  const effectiveAppointments = useMemo(
    () => (appointments.length > 0 ? appointments : mockAppointments),
    [appointments]
  );

  const filteredAppointments = effectiveAppointments.filter((apt) => {
    const aptDate = new Date(`${apt.date}T00:00:00`);
    const matchesDoctor = !selectedDoctor || apt.doctorId === selectedDoctor;
    
    if (viewMode === "day") {
      return isSameDay(aptDate, selectedDate) && matchesDoctor;
    }
    return matchesDoctor;
  });

  const hasVisibleSchedule = filteredAppointments.length > 0;

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i)
  );

  const navigateDate = (direction: "prev" | "next") => {
    const days = viewMode === "day" ? 1 : 7;
    setSelectedDate((d) =>
      direction === "next" ? addDays(d, days) : addDays(d, -days)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-100 border-success-300 text-success-700";
      case "in-consultation":
        return "bg-warning-100 border-warning-300 text-warning-700";
      case "waiting":
        return "bg-primary-100 border-primary-300 text-primary-700";
      case "cancelled":
        return "bg-danger-100 border-danger-300 text-danger-700";
      default:
        return "bg-slate-100 border-slate-300 text-slate-700";
    }
  };

  const openBookModal = (date?: Date) => {
    setPreselectedDate(date ? format(date, "yyyy-MM-dd") : format(selectedDate, "yyyy-MM-dd"));
    setShowBookModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-500">Manage appointments and schedules</p>
        </div>
        <Button onClick={() => openBookModal()} className="gap-2">
          <Plus size={16} />
          New Appointment
        </Button>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
                <ChevronLeft size={16} />
              </Button>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2">
                <CalendarIcon size={16} className="text-slate-400" />
                <span className="font-medium">
                  {viewMode === "day"
                    ? format(selectedDate, "EEEE, MMMM d, yyyy")
                    : `${format(weekDays[0], "MMM d")} - ${format(weekDays[6], "MMM d, yyyy")}`}
                </span>
              </div>
              <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
                <ChevronRight size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
                Today
              </Button>
            </div>

            {/* View Toggle & Doctor Filter */}
            <div className="flex items-center gap-4">
              {/* Doctor Filter */}
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={selectedDoctor || ""}
                onChange={(e) => setSelectedDoctor(e.target.value || null)}
              >
                <option value="">All Doctors</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode("day")}
                  className={cn(
                    "px-3 py-1.5 text-sm",
                    viewMode === "day" ? "bg-slate-100 text-slate-900" : "text-slate-500"
                  )}
                >
                  Day
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={cn(
                    "px-3 py-1.5 text-sm",
                    viewMode === "week" ? "bg-slate-100 text-slate-900" : "text-slate-500"
                  )}
                >
                  Week
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {!hasVisibleSchedule && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium text-slate-700">No appointments for selected filters</p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing date/doctor filter or add a new follow-up appointment.
            </p>
          </CardContent>
        </Card>
      )}

      {hasVisibleSchedule &&
        (viewMode === "day" ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {timeSlots.map((time) => {
                const slotAppointments = filteredAppointments.filter(
                  (apt) => apt.time === time
                );
                return (
                  <div key={time} className="flex min-h-[80px]">
                    <div className="flex w-20 shrink-0 items-start justify-center border-r border-slate-100 bg-slate-50 py-3 text-sm font-medium text-slate-500">
                      {time}
                    </div>
                    <div className="flex-1 p-2">
                      <div className="flex flex-wrap gap-2">
                        {slotAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md",
                              getStatusColor(apt.status)
                            )}
                            onClick={() => navigate(`/appointments/${apt.id}`)}
                          >
                            <Avatar name={apt.patientName} size="sm" />
                            <div>
                              <p className="font-medium">{apt.patientName}</p>
                              <p className="text-xs opacity-75">{apt.doctorName}</p>
                            </div>
                            <Badge variant="default" className="ml-auto">
                              #{apt.tokenNumber}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="w-20 p-3 text-left text-sm font-medium text-slate-500">
                    Time
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.toISOString()}
                      className={cn(
                        "p-3 text-center text-sm font-medium cursor-pointer hover:bg-slate-100",
                        isSameDay(day, new Date())
                          ? "bg-primary-50 text-primary-600"
                          : "text-slate-500"
                      )}
                      onClick={() => openBookModal(day)}
                    >
                      <div>{format(day, "EEE")}</div>
                      <div className="text-lg font-bold">{format(day, "d")}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="border-b border-slate-100">
                    <td className="p-3 text-sm text-slate-500 bg-slate-50">{time}</td>
                    {weekDays.map((day) => {
                      const dayAppointments = filteredAppointments.filter(
                        (apt) =>
                          apt.time === time && isSameDay(new Date(apt.date), day)
                      );
                      return (
                        <td
                          key={day.toISOString()}
                          className="p-1 align-top min-h-[60px] cursor-pointer hover:bg-slate-50"
                          onClick={() => openBookModal(day)}
                        >
                          {dayAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              className={cn(
                                "mb-1 cursor-pointer rounded p-2 text-xs",
                                getStatusColor(apt.status)
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/appointments/${apt.id}`);
                              }}
                            >
                              <p className="font-medium truncate">{apt.patientName}</p>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-slate-300" />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary-500" />
          <span>Waiting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-warning-500" />
          <span>In Consultation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-danger-500" />
          <span>Cancelled</span>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        preselectedDate={preselectedDate}
        preselectedDoctorId={selectedDoctor || undefined}
      />
    </div>
  );
}
