import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { staff } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useHospitalOpsStore, useNotificationStore } from "@/stores";
import { getPatientsFromStorage } from "@/lib/patient-storage";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  type: z.enum(["opd", "follow-up", "emergency"]),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

type DayName =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface DoctorSchedule {
  day: DayName;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

const doctorSchedules: Record<string, DoctorSchedule[]> = {
  DOC001: [
    { day: "monday", startTime: "09:00", endTime: "13:00", slotDuration: 15 },
    { day: "monday", startTime: "17:00", endTime: "20:00", slotDuration: 15 },
    { day: "tuesday", startTime: "09:00", endTime: "13:00", slotDuration: 15 },
    { day: "wednesday", startTime: "09:00", endTime: "13:00", slotDuration: 15 },
    { day: "thursday", startTime: "09:00", endTime: "13:00", slotDuration: 15 },
    { day: "friday", startTime: "09:00", endTime: "13:00", slotDuration: 15 },
    { day: "saturday", startTime: "10:00", endTime: "14:00", slotDuration: 20 },
  ],
  DOC002: [
    { day: "monday", startTime: "10:00", endTime: "14:00", slotDuration: 20 },
    { day: "tuesday", startTime: "10:00", endTime: "14:00", slotDuration: 20 },
    { day: "wednesday", startTime: "10:00", endTime: "14:00", slotDuration: 20 },
    { day: "thursday", startTime: "10:00", endTime: "14:00", slotDuration: 20 },
    { day: "friday", startTime: "10:00", endTime: "14:00", slotDuration: 20 },
  ],
  DOC003: [
    { day: "monday", startTime: "11:00", endTime: "16:00", slotDuration: 30 },
    { day: "wednesday", startTime: "11:00", endTime: "16:00", slotDuration: 30 },
    { day: "friday", startTime: "11:00", endTime: "16:00", slotDuration: 30 },
  ],
};

const weekMap: DayName[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function toMinutes(value: string): number {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function toTime(minutes: number): string {
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

export function AppointmentCreatePage() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { appointments, addAppointment } = useHospitalOpsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const patients = useMemo(() => getPatientsFromStorage(), []);

  const doctors = staff.filter((member) => member.role === "doctor");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      type: "opd",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const selectedDoctorId = watch("doctorId");
  const selectedDate = watch("date");
  const selectedTime = watch("time");

  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedDoctorId);

  const patientOptions = patients.map((patient) => ({
    value: patient.id,
    label: `${patient.name} (${patient.id})`,
  }));

  const doctorOptions = doctors.map((doctor) => ({
    value: doctor.id,
    label: `${doctor.name} - ${doctor.department}`,
  }));

  const typeOptions = [
    { value: "opd", label: "OPD Consultation" },
    { value: "follow-up", label: "Follow-up" },
    { value: "emergency", label: "Emergency" },
  ];

  const availableSlots = useMemo(() => {
    if (!selectedDoctorId || !selectedDate) {
      return [];
    }

    const doctorDaySchedules = doctorSchedules[selectedDoctorId] ?? [];
    const targetDate = new Date(`${selectedDate}T00:00:00`);
    const dayName = weekMap[targetDate.getDay()];
    const daySchedules = doctorDaySchedules.filter((schedule) => schedule.day === dayName);

    if (daySchedules.length === 0) {
      return [];
    }

    const bookedSlots = appointments
      .filter(
        (appointment) =>
          appointment.doctorId === selectedDoctorId &&
          appointment.date === selectedDate &&
          appointment.status !== "cancelled"
      )
      .map((appointment) => appointment.time);

    const slots: { value: string; label: string }[] = [];
    daySchedules.forEach((schedule) => {
      const start = toMinutes(schedule.startTime);
      const end = toMinutes(schedule.endTime);
      for (let cursor = start; cursor < end; cursor += schedule.slotDuration) {
        const time = toTime(cursor);
        if (!bookedSlots.includes(time)) {
          slots.push({ value: time, label: time });
        }
      }
    });

    return slots;
  }, [selectedDoctorId, selectedDate]);

  useEffect(() => {
    if (availableSlots.length === 0) {
      setValue("time", "");
      return;
    }

    const hasCurrentTime = availableSlots.some((slot) => slot.value === selectedTime);
    if (!hasCurrentTime) {
      setValue("time", availableSlots[0].value);
    }
  }, [availableSlots, selectedTime, setValue]);

  const onSubmit = async (data: AppointmentFormData) => {
    const selectedPatient = patients.find((patient) => patient.id === data.patientId);
    const selectedDoctorValue = doctors.find((doctor) => doctor.id === data.doctorId);
    if (!selectedPatient || !selectedDoctorValue) {
      return;
    }

    const created = addAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: selectedDoctorValue.id,
      doctorName: selectedDoctorValue.name,
      department: selectedDoctorValue.department,
      date: data.date,
      time: data.time,
      type: data.type,
      notes: data.notes,
    });

    setIsSubmitting(true);

    addNotification({
      title: "Appointment Booked",
      message: `${created.patientName} assigned to ${created.doctorName} on ${created.date} ${created.time}`,
      type: "success",
      recipientRoles: ["admin", "reception", "doctor"],
      module: "appointments",
      relatedId: created.id,
    });

    addNotification({
      title: "Doctor Assignment Update",
      message: `New patient ${created.patientName} has been assigned to your schedule`,
      type: "info",
      recipientUserIds: [created.doctorId],
      module: "appointments",
      relatedId: created.id,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/appointments");
    }, 500);
  };

  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-ink">Book Appointment</h1>
          <p className="text-ink-muted">Schedule a new appointment with availability-aware slots</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Patient *"
              options={patientOptions}
              placeholder="Select patient"
              error={errors.patientId?.message}
              {...register("patientId")}
            />

            <Select
              label="Doctor *"
              options={doctorOptions}
              placeholder="Select doctor"
              error={errors.doctorId?.message}
              {...register("doctorId")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Date *"
                type="date"
                min={todayDate}
                error={errors.date?.message}
                {...register("date")}
              />

              <Select
                label="Time *"
                options={availableSlots}
                placeholder={selectedDoctorId ? "Select available slot" : "Select doctor first"}
                error={errors.time?.message}
                disabled={!selectedDoctorId || availableSlots.length === 0}
                {...register("time")}
              />
            </div>

            {selectedDoctorId && (
              <Card className="bg-selected p-3 text-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium text-ink">{selectedDoctor?.name}</span>
                  <span className="text-ink-muted">{selectedDoctor?.department}</span>
                  {selectedDoctor?.consultationFee && (
                    <span className="text-ink-muted">
                      Fee default: {formatCurrency(selectedDoctor.consultationFee)}
                    </span>
                  )}
                  <Badge variant={availableSlots.length > 0 ? "success" : "warning"}>
                    {availableSlots.length} slots available
                  </Badge>
                </div>
              </Card>
            )}

            <Select
              label="Appointment Type *"
              options={typeOptions}
              error={errors.type?.message}
              {...register("type")}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-muted">Notes</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Any additional notes..."
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save size={16} />
            {isSubmitting ? "Booking..." : "Book Appointment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
