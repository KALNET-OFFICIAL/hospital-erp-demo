import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Stethoscope,
  FileText,
  Pill,
  CreditCard,
  BedDouble,
  FlaskConical,
  ClipboardList,
  Download,
  Printer,
  Filter,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { patients } from "@/lib/mock-data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { getIdentityColor, getCurrentThemeMode } from "@/lib/theme";
import type { EMRRecord } from "@/types";

const STORAGE_KEY = "hos_emr_records";

function readEMRRecords(): EMRRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as EMRRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface TimelineEvent {
  id: string;
  date: string;
  type: string;
  title: string;
  description: string;
  doctor?: string;
  department?: string;
  details?: any;
}

// Mock timeline events
const staticTimelineEvents: TimelineEvent[] = [
  {
    id: "EVT001",
    date: "2024-01-20T10:30:00Z",
    type: "consultation",
    title: "OPD Consultation",
    description: "General checkup with Dr. Anil Mehta",
    doctor: "Dr. Anil Mehta",
    department: "General Medicine",
    details: {
      diagnosis: "Viral Fever",
      symptoms: ["Fever", "Body ache", "Fatigue"],
    },
  },
  {
    id: "EVT002",
    date: "2024-01-20T10:45:00Z",
    type: "prescription",
    title: "Prescription Issued",
    description: "3 medicines prescribed for 5 days",
    doctor: "Dr. Anil Mehta",
    details: {
      medicines: ["Paracetamol 500mg", "Azithromycin 250mg", "Vitamin C"],
    },
  },
  {
    id: "EVT003",
    date: "2024-01-20T11:00:00Z",
    type: "lab",
    title: "Lab Tests Ordered",
    description: "CBC and Typhoid test ordered",
    details: {
      tests: ["Complete Blood Count", "Typhoid Antibody Test"],
    },
  },
  {
    id: "EVT004",
    date: "2024-01-20T11:30:00Z",
    type: "billing",
    title: "Invoice Generated",
    description: "Invoice #INV001 for ₹1,500",
    details: {
      invoiceId: "INV001",
      amount: 1500,
      status: "paid",
    },
  },
  {
    id: "EVT005",
    date: "2024-01-15T09:00:00Z",
    type: "admission",
    title: "IPD Admission",
    description: "Admitted to Ward A, Bed 12",
    doctor: "Dr. Vikram Singh",
    department: "Orthopedics",
    details: {
      ward: "Ward A",
      bed: "12",
      reason: "Knee Surgery",
    },
  },
  {
    id: "EVT006",
    date: "2024-01-16T14:00:00Z",
    type: "procedure",
    title: "Surgery Performed",
    description: "Knee Arthroscopy completed successfully",
    doctor: "Dr. Vikram Singh",
    details: {
      procedure: "Knee Arthroscopy",
      duration: "2 hours",
      outcome: "Successful",
    },
  },
  {
    id: "EVT007",
    date: "2024-01-18T10:00:00Z",
    type: "discharge",
    title: "Discharged",
    description: "Patient discharged in stable condition",
    doctor: "Dr. Vikram Singh",
    details: {
      condition: "Stable",
      followUp: "2024-01-25",
    },
  },
  {
    id: "EVT008",
    date: "2024-01-10T09:30:00Z",
    type: "consultation",
    title: "OPD Consultation",
    description: "Follow-up visit with Dr. Sunita Rao",
    doctor: "Dr. Sunita Rao",
    department: "Gynecology",
  },
  {
    id: "EVT009",
    date: "2024-01-05T11:00:00Z",
    type: "document",
    title: "Report Uploaded",
    description: "Previous hospital records uploaded",
    details: {
      fileName: "Previous_Medical_Records.pdf",
      type: "External Report",
    },
  },
];

const eventIcons: Record<string, React.ReactNode> = {
  consultation: <Stethoscope className="w-4 h-4" />,
  prescription: <Pill className="w-4 h-4" />,
  lab: <FlaskConical className="w-4 h-4" />,
  billing: <CreditCard className="w-4 h-4" />,
  admission: <BedDouble className="w-4 h-4" />,
  discharge: <ClipboardList className="w-4 h-4" />,
  procedure: <FileText className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
};

// Event type is a category, not a state — colored via the identity palette
// (getIdentityColor) so each type keeps a stable hue everywhere it appears
// (timeline dot, icon chip, card rail, type badge) instead of a hand-picked
// hex per type.

export default function PatientTimelinePage() {
  const { patientId } = useParams();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const mode = getCurrentThemeMode();

  const patient = patients.find((p) => p.id === patientId) || patients[0];
  const emrRecords = readEMRRecords().filter((record) => record.patientId === patient.id);

  const dynamicTimelineEvents: TimelineEvent[] = emrRecords.flatMap((record) => {
    const events: TimelineEvent[] = [
      {
        id: `${record.id}-consultation`,
        date: record.date,
        type: "consultation",
        title: "Consultation Record",
        description: record.diagnosis || "Consultation completed",
        doctor: record.doctorName,
        details: {
          diagnosis: record.diagnosis,
          symptoms: record.symptoms,
        },
      },
    ];

    if (record.prescription.length > 0) {
      events.push({
        id: `${record.id}-prescription`,
        date: record.date,
        type: "prescription",
        title: "Prescription Issued",
        description: `${record.prescription.length} medicine(s) prescribed`,
        doctor: record.doctorName,
        details: {
          medicines: record.prescription.map((item) => item.medicineName),
        },
      });
    }

    if (record.labTests && record.labTests.length > 0) {
      events.push({
        id: `${record.id}-lab`,
        date: record.date,
        type: "lab",
        title: "Lab Tests Ordered",
        description: `${record.labTests.length} test(s) advised`,
        details: {
          tests: record.labTests,
        },
      });
    }

    if (record.followUp) {
      events.push({
        id: `${record.id}-followup`,
        date: record.date,
        type: "discharge",
        title: "Follow-up Planned",
        description: `Follow-up: ${record.followUp}`,
        details: {
          condition: "Planned",
          followUp: record.followUp,
        },
      });
    }

    return events;
  });

  const timelineEvents = [...dynamicTimelineEvents, ...staticTimelineEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredEvents =
    selectedFilter === "all"
      ? timelineEvents
      : timelineEvents.filter((e) => e.type === selectedFilter);

  // Group events by date
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const date = new Date(event.date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/patients/${patientId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink">Patient Timeline</h1>
            <p className="text-ink-muted">{patient.name} ({patient.id})</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Patient Summary Card */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{patient.name}</h2>
            <p className="text-ink-muted">
              {patient.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs` : 'N/A'} / {patient.gender} | {patient.phone}
            </p>
            <p className="text-sm text-ink-muted">Blood Group: {patient.bloodGroup}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600">12</p>
              <p className="text-xs text-ink-muted">Total Visits</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: getIdentityColor("prescriptions", mode) }}>8</p>
              <p className="text-xs text-ink-muted">Prescriptions</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: getIdentityColor("admissions", mode) }}>2</p>
              <p className="text-xs text-ink-muted">Admissions</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Filter className="w-4 h-4 text-slate-400" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "consultation", "prescription", "lab", "billing", "admission", "procedure"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === filter
                    ? "bg-primary-100 text-primary-700"
                    : "bg-slate-100 text-ink-muted hover:bg-slate-200"
                }`}
              >
                {filter === "all" ? "All Events" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedEvents).map(([date, events]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-ink-muted" />
              </div>
              <div>
                <p className="font-semibold text-ink">{date}</p>
                <p className="text-xs text-ink-muted">{events.length} event(s)</p>
              </div>
            </div>

            {/* Events */}
            <div className="ml-5 pl-5 border-l-2 border-line space-y-4">
              {events.map((event) => {
                const accent = getIdentityColor(event.type, mode);
                return (
                <div key={event.id} className="relative">
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-[29px] w-4 h-4 rounded-full border-2"
                    style={{ backgroundColor: `${accent}1f`, borderColor: accent }}
                  />

                  {/* Event Card */}
                  <Card
                    className="p-4 hover:shadow-md transition-shadow border-l-4"
                    style={{ borderLeftColor: accent }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${accent}1f`, color: accent }}
                        >
                          {eventIcons[event.type]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-ink">{event.title}</h3>
                            <Badge
                              className="text-xs"
                              style={{ backgroundColor: `${accent}1f`, color: accent }}
                            >
                              {event.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-ink-muted mt-1">{event.description}</p>
                          {event.doctor && (
                            <p className="text-xs text-ink-muted mt-1">
                              👨‍⚕️ {event.doctor}
                              {event.department && ` • ${event.department}`}
                            </p>
                          )}

                          {/* Event Details */}
                          {event.details && (
                            <div className="mt-3 p-3 bg-bg rounded-lg text-sm">
                              {event.type === "consultation" && event.details.diagnosis && (
                                <div>
                                  <p className="text-ink-muted">
                                    <span className="font-medium">Diagnosis:</span>{" "}
                                    {event.details.diagnosis}
                                  </p>
                                  {event.details.symptoms && (
                                    <p className="text-ink-muted text-xs mt-1">
                                      Symptoms: {event.details.symptoms.join(", ")}
                                    </p>
                                  )}
                                </div>
                              )}
                              {event.type === "prescription" && event.details.medicines && (
                                <div>
                                  <p className="font-medium text-ink-muted mb-1">Medicines:</p>
                                  <ul className="list-disc list-inside text-ink-muted text-xs">
                                    {event.details.medicines.map((med: string, i: number) => (
                                      <li key={i}>{med}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {event.type === "lab" && event.details.tests && (
                                <div>
                                  <p className="font-medium text-ink-muted mb-1">Tests:</p>
                                  <ul className="list-disc list-inside text-ink-muted text-xs">
                                    {event.details.tests.map((test: string, i: number) => (
                                      <li key={i}>{test}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {event.type === "billing" && (
                                <div className="flex items-center gap-4">
                                  <span>Invoice: {event.details.invoiceId}</span>
                                  <span className="font-semibold">
                                    {formatCurrency(Number(event.details.amount ?? 0))}
                                  </span>
                                  <Badge variant={event.details.status === "paid" ? "success" : "warning"}>
                                    {event.details.status}
                                  </Badge>
                                </div>
                              )}
                              {event.type === "admission" && (
                                <div>
                                  <p>
                                    Ward: <span className="font-medium">{event.details.ward}</span>,
                                    Bed: <span className="font-medium">{event.details.bed}</span>
                                  </p>
                                  <p className="text-ink-muted text-xs mt-1">
                                    Reason: {event.details.reason}
                                  </p>
                                </div>
                              )}
                              {event.type === "procedure" && (
                                <div>
                                  <p>
                                    <span className="font-medium">{event.details.procedure}</span>
                                  </p>
                                  <p className="text-ink-muted text-xs mt-1">
                                    Duration: {event.details.duration} • Outcome:{" "}
                                    <span className="text-success-600">{event.details.outcome}</span>
                                  </p>
                                </div>
                              )}
                              {event.type === "discharge" && (
                                <div>
                                  <p>
                                    Condition:{" "}
                                    <span className="text-success-600 font-medium">
                                      {event.details.condition}
                                    </span>
                                  </p>
                                  <p className="text-ink-muted text-xs mt-1">
                                    Follow-up: {formatDate(String(event.details.followUp ?? event.date))}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-ink-muted">
                        {new Date(event.date).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </Card>
                </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-ink-muted">No timeline events found</p>
        </div>
      )}
    </div>
  );
}
