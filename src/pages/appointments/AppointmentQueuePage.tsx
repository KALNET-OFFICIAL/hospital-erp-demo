import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Volume2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthStore, useHospitalOpsStore } from "@/stores";
import type { AppointmentStatus } from "@/types";

export function AppointmentQueuePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { appointments } = useHospitalOpsStore();
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | "all">("all");

  const todayAppointments =
    user?.role === "doctor"
      ? appointments.filter((appointment) => appointment.doctorId === user.id)
      : appointments;
  const filteredAppointments =
    selectedStatus === "all"
      ? todayAppointments
      : todayAppointments.filter((apt) => apt.status === selectedStatus);

  const statusCounts = {
    waiting: todayAppointments.filter((a) => a.status === "waiting").length,
    "in-consultation": todayAppointments.filter((a) => a.status === "in-consultation")
      .length,
    completed: todayAppointments.filter((a) => a.status === "completed").length,
  };

  const currentPatient = todayAppointments.find(
    (a) => a.status === "in-consultation"
  );
  const nextPatient = todayAppointments.find((a) => a.status === "waiting");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Queue Management</h1>
          <p className="text-slate-500">Today's OPD queue</p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      {/* Current & Next */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-primary-200 bg-primary-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary-600">
              NOW SERVING
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPatient ? (
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500 text-2xl font-bold text-white">
                  {currentPatient.tokenNumber}
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {currentPatient.patientName}
                  </p>
                  <p className="text-slate-600">{currentPatient.doctorName}</p>
                </div>
                <Button variant="outline" size="icon" className="ml-auto">
                  <Volume2 size={18} />
                </Button>
              </div>
            ) : (
              <p className="text-slate-500">No patient in consultation</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              UP NEXT
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextPatient ? (
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-2xl font-bold text-slate-700">
                  {nextPatient.tokenNumber}
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {nextPatient.patientName}
                  </p>
                  <p className="text-slate-600">{nextPatient.doctorName}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No patients waiting</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        <Button
          variant={selectedStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("all")}
        >
          All ({todayAppointments.length})
        </Button>
        <Button
          variant={selectedStatus === "waiting" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("waiting")}
        >
          Waiting ({statusCounts.waiting})
        </Button>
        <Button
          variant={selectedStatus === "in-consultation" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("in-consultation")}
        >
          In Consultation ({statusCounts["in-consultation"]})
        </Button>
        <Button
          variant={selectedStatus === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("completed")}
        >
          Completed ({statusCounts.completed})
        </Button>
      </div>

      {/* Queue List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className={cn(
                  "flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-slate-50",
                  apt.status === "in-consultation" && "bg-primary-50"
                )}
                onClick={() => navigate(`/opd/consultation/${apt.id}`)}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold",
                    apt.status === "in-consultation"
                      ? "bg-primary-500 text-white"
                      : apt.status === "completed"
                      ? "bg-success-100 text-success-600"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {apt.tokenNumber}
                </div>
                <Avatar name={apt.patientName} size="md" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{apt.patientName}</p>
                  <p className="text-sm text-slate-500">
                    {apt.doctorName} • {apt.time}
                  </p>
                </div>
                <Badge
                  variant={
                    apt.status === "completed"
                      ? "success"
                      : apt.status === "in-consultation"
                      ? "warning"
                      : apt.status === "waiting"
                      ? "info"
                      : "default"
                  }
                >
                  {apt.status.replace("-", " ")}
                </Badge>
                <ChevronRight size={20} className="text-slate-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
