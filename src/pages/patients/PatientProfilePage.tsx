import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplet,
  Edit,
  FileText,
  Receipt,
  Stethoscope,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appointments, invoices } from "@/lib/mock-data";
import { formatDate, calculateAge, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getPatientsFromStorage } from "@/lib/patient-storage";

type Tab = "overview" | "visits" | "emr" | "billing" | "documents";

export function PatientProfilePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const patients = useMemo(() => getPatientsFromStorage(), []);

  const patient = patients.find((p) => p.id === patientId);
  const patientAppointments = appointments.filter((a) => a.patientId === patientId);
  const patientInvoices = invoices.filter((i) => i.patientId === patientId);

  if (!patient) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-ink-muted">Patient not found</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <FileText size={16} /> },
    { id: "visits", label: "Visits", icon: <Calendar size={16} /> },
    { id: "emr", label: "EMR", icon: <Stethoscope size={16} /> },
    { id: "billing", label: "Billing", icon: <Receipt size={16} /> },
    { id: "documents", label: "Documents", icon: <FileText size={16} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-ink">Patient Profile</h1>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => navigate(`/patients/${patientId}/edit`)}>
          <Edit size={16} />
          Edit
        </Button>
      </div>

      {/* Patient Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar name={patient.name} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-ink">{patient.name}</h2>
                <Badge variant="primary">{patient.id}</Badge>
                {patient.bloodGroup && (
                  <Badge variant="danger">{patient.bloodGroup}</Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink-muted">
                <span className="flex items-center gap-1">
                  <Calendar size={14} className="text-slate-400" />
                  {calculateAge(patient.dob)} years • {patient.gender}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={14} className="text-slate-400" />
                  {patient.phone}
                </span>
                {patient.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={14} className="text-slate-400" />
                    {patient.email}
                  </span>
                )}
              </div>
              {patient.address && (
                <p className="mt-2 flex items-center gap-1 text-sm text-ink-muted">
                  <MapPin size={14} className="text-slate-400" />
                  {patient.address}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/appointments/new")}>
                Book Appointment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-line">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-ink-muted hover:text-ink"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-bg p-4">
                <p className="text-sm text-ink-muted">Total Visits</p>
                <p className="text-2xl font-bold text-ink">
                  {patientAppointments.length}
                </p>
              </div>
              <div className="rounded-lg bg-bg p-4">
                <p className="text-sm text-ink-muted">Total Billed</p>
                <p className="text-2xl font-bold text-ink">
                  {formatCurrency(
                    patientInvoices.reduce((sum, inv) => sum + inv.total, 0)
                  )}
                </p>
              </div>
              <div className="rounded-lg bg-bg p-4">
                <p className="text-sm text-ink-muted">Pending Amount</p>
                <p className="text-2xl font-bold text-warning-600">
                  {formatCurrency(
                    patientInvoices.reduce(
                      (sum, inv) => sum + (inv.total - inv.paidAmount),
                      0
                    )
                  )}
                </p>
              </div>
              <div className="rounded-lg bg-bg p-4">
                <p className="text-sm text-ink-muted">Last Visit</p>
                <p className="text-lg font-bold text-ink">
                  {patientAppointments.length > 0
                    ? formatDate(patientAppointments[0].date)
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-3 rounded-lg border border-line p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                      <Stethoscope size={18} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-ink">{apt.doctorName}</p>
                      <p className="text-sm text-ink-muted">{apt.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-ink-muted">{formatDate(apt.date)}</p>
                      <Badge
                        variant={apt.status === "completed" ? "success" : "default"}
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "visits" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientAppointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      {formatDate(apt.date)} at {apt.time}
                    </div>
                  </TableCell>
                  <TableCell>{apt.doctorName}</TableCell>
                  <TableCell>{apt.department}</TableCell>
                  <TableCell>
                    <Badge variant="primary">{apt.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        apt.status === "completed"
                          ? "success"
                          : apt.status === "cancelled"
                          ? "danger"
                          : "default"
                      }
                    >
                      {apt.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === "billing" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <Badge variant="default">{inv.id}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(inv.createdAt)}</TableCell>
                  <TableCell className="uppercase">{inv.type}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(inv.total)}
                  </TableCell>
                  <TableCell>{formatCurrency(inv.paidAmount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inv.paymentStatus === "paid"
                          ? "success"
                          : inv.paymentStatus === "partial"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {inv.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === "emr" && (
        <Card>
          <CardContent className="py-12 text-center">
            <Stethoscope className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-ink-muted">No EMR records found</p>
            <Button className="mt-4">Create EMR Record</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "documents" && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-ink-muted">No documents uploaded</p>
            <Button className="mt-4">Upload Document</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
