import { useEffect, useMemo, useState } from "react";
import { Save, Calendar, Clock, User, Stethoscope } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { patients, staff } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useHospitalOpsStore, useNotificationStore } from "@/stores";

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

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDate?: string;
  preselectedDoctorId?: string;
  preselectedPatientId?: string;
}

export function BookAppointmentModal({
  isOpen,
  onClose,
  preselectedDate,
  preselectedDoctorId,
  preselectedPatientId,
}: BookAppointmentModalProps) {
  const { addNotification } = useNotificationStore();
  const { appointments, addAppointment } = useHospitalOpsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const doctors = staff.filter((member) => member.role === "doctor");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      type: "opd",
      date: preselectedDate || new Date().toISOString().split("T")[0],
      doctorId: preselectedDoctorId || "",
      patientId: preselectedPatientId || "",
    },
  });

  // Reset form when modal opens with new preselected values
  useEffect(() => {
    if (isOpen) {
      reset({
        type: "opd",
        date: preselectedDate || new Date().toISOString().split("T")[0],
        doctorId: preselectedDoctorId || "",
        patientId: preselectedPatientId || "",
        time: "",
        notes: "",
      });
    }
  }, [isOpen, preselectedDate, preselectedDoctorId, preselectedPatientId, reset]);

  const selectedDoctorId = watch("doctorId");
  const selectedDate = watch("date");
  const selectedTime = watch("time");

  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedDoctorId);

  const patientOptions = patients.map((patient) => ({
    value: patient.id,
    label: `${patient.name} (${patient.phone})`,
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
  }, [selectedDoctorId, selectedDate, appointments]);

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

    setIsSubmitting(true);

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

    addNotification({
      title: "Appointment Booked",
      message: `${created.patientName} assigned to ${created.doctorName} on ${created.date} ${created.time}`,
      type: "success",
      recipientRoles: ["admin", "reception", "doctor"],
      module: "appointments",
      relatedId: created.id,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Appointment" className="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <div className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <User size={16} />
                Patient *
              </label>
              <Select
                options={patientOptions}
                placeholder="Select patient"
                error={errors.patientId?.message}
                {...register("patientId")}
              />
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <Stethoscope size={16} />
                Doctor *
              </label>
              <Select
                options={doctorOptions}
                placeholder="Select doctor"
                error={errors.doctorId?.message}
                {...register("doctorId")}
              />
            </div>

            {/* Doctor Info */}
            {selectedDoctorId && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg text-sm">
                <div>
                  <span className="font-medium text-slate-900">{selectedDoctor?.name}</span>
                  <span className="text-slate-500 ml-2">{selectedDoctor?.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedDoctor?.consultationFee && (
                    <span className="text-slate-700">
                      Fee: {formatCurrency(selectedDoctor.consultationFee)}
                    </span>
                  )}
                  <Badge variant={availableSlots.length > 0 ? "success" : "warning"}>
                    {availableSlots.length} slots
                  </Badge>
                </div>
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                  <Calendar size={16} />
                  Date *
                </label>
                <Input
                  type="date"
                  min={todayDate}
                  error={errors.date?.message}
                  {...register("date")}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                  <Clock size={16} />
                  Time *
                </label>
                <Select
                  options={availableSlots}
                  placeholder={selectedDoctorId ? "Select slot" : "Select doctor first"}
                  error={errors.time?.message}
                  disabled={!selectedDoctorId || availableSlots.length === 0}
                  {...register("time")}
                />
              </div>
            </div>

            {/* Appointment Type */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Appointment Type *
              </label>
              <Select
                options={typeOptions}
                error={errors.type?.message}
                {...register("type")}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Notes (Optional)
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                placeholder="Any additional notes..."
                {...register("notes")}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save size={16} />
            {isSubmitting ? "Booking..." : "Book Appointment"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
