import { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  User,
  Clock,
  Edit2,
  Eye,
  BedDouble,
  Stethoscope,
  ClipboardList,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { format } from "date-fns";

interface TreatmentNote {
  id: string;
  patientId: string;
  patientName: string;
  admissionId: string;
  ward: string;
  bedNumber: string;
  doctorId: string;
  doctorName: string;
  noteType: "progress" | "nursing" | "medication" | "procedure" | "rounds";
  date: string;
  time: string;
  vitals?: {
    bp: string;
    pulse: string;
    temp: string;
    spo2: string;
  };
  notes: string;
  assessment: string;
  plan: string;
  createdAt: string;
}

const noteTypeColors: Record<string, string> = {
  progress: "bg-blue-100 text-blue-800",
  nursing: "bg-teal-100 text-teal-800",
  medication: "bg-purple-100 text-purple-800",
  procedure: "bg-amber-100 text-amber-800",
  rounds: "bg-green-100 text-green-800",
};

const mockNotes: TreatmentNote[] = [
  {
    id: "TN001",
    patientId: "P001",
    patientName: "Rajesh Kumar",
    admissionId: "ADM001",
    ward: "General Ward",
    bedNumber: "GW-101",
    doctorId: "D001",
    doctorName: "Dr. Sarah Johnson",
    noteType: "rounds",
    date: "2024-01-20",
    time: "09:30",
    vitals: { bp: "120/80", pulse: "72", temp: "98.4°F", spo2: "98%" },
    notes: "Patient is stable and responding well to treatment. No complaints of pain.",
    assessment: "Post-operative day 2. Wound healing well. No signs of infection.",
    plan: "Continue current medications. Start physiotherapy from tomorrow. Plan discharge on Day 4 if stable.",
    createdAt: "2024-01-20T09:30:00",
  },
  {
    id: "TN002",
    patientId: "P001",
    patientName: "Rajesh Kumar",
    admissionId: "ADM001",
    ward: "General Ward",
    bedNumber: "GW-101",
    doctorId: "N001",
    doctorName: "Nurse Priya",
    noteType: "nursing",
    date: "2024-01-20",
    time: "14:00",
    vitals: { bp: "118/78", pulse: "70", temp: "98.2°F", spo2: "99%" },
    notes: "Patient had lunch. Ambulated with assistance. Wound dressing changed. Drain output 20ml.",
    assessment: "Comfortable, no distress",
    plan: "Continue monitoring. Next vitals at 18:00",
    createdAt: "2024-01-20T14:00:00",
  },
  {
    id: "TN003",
    patientId: "P002",
    patientName: "Priya Sharma",
    admissionId: "ADM002",
    ward: "ICU",
    bedNumber: "ICU-05",
    doctorId: "D002",
    doctorName: "Dr. Michael Chen",
    noteType: "progress",
    date: "2024-01-20",
    time: "08:00",
    vitals: { bp: "140/90", pulse: "88", temp: "99.1°F", spo2: "94%" },
    notes: "Patient had mild respiratory distress overnight. O2 support increased to 4L/min.",
    assessment: "Pneumonia with improving consolidation. Mild hypoxia.",
    plan: "Continue IV antibiotics. Repeat chest X-ray tomorrow. Pulmonology consult.",
    createdAt: "2024-01-20T08:00:00",
  },
  {
    id: "TN004",
    patientId: "P003",
    patientName: "Amit Singh",
    admissionId: "ADM003",
    ward: "Surgical Ward",
    bedNumber: "SW-12",
    doctorId: "D001",
    doctorName: "Dr. Sarah Johnson",
    noteType: "procedure",
    date: "2024-01-19",
    time: "11:30",
    notes: "Central line inserted successfully. No complications. Proper placement confirmed by X-ray.",
    assessment: "Procedure completed without complications",
    plan: "Monitor for signs of infection. Start TPN via central line.",
    createdAt: "2024-01-19T11:30:00",
  },
  {
    id: "TN005",
    patientId: "P002",
    patientName: "Priya Sharma",
    admissionId: "ADM002",
    ward: "ICU",
    bedNumber: "ICU-05",
    doctorId: "D002",
    doctorName: "Dr. Michael Chen",
    noteType: "medication",
    date: "2024-01-20",
    time: "10:00",
    notes: "Changed antibiotic from Ceftriaxone to Piperacillin-Tazobactam based on culture sensitivity.",
    assessment: "Antibiotic escalation due to resistance pattern",
    plan: "Monitor response. Repeat cultures after 48 hours.",
    createdAt: "2024-01-20T10:00:00",
  },
];

const doctors = [
  { id: "D001", name: "Dr. Sarah Johnson" },
  { id: "D002", name: "Dr. Michael Chen" },
  { id: "D003", name: "Dr. Emily Parker" },
];

const currentPatients = [
  { id: "P001", name: "Rajesh Kumar", ward: "General Ward", bed: "GW-101", admissionId: "ADM001" },
  { id: "P002", name: "Priya Sharma", ward: "ICU", bed: "ICU-05", admissionId: "ADM002" },
  { id: "P003", name: "Amit Singh", ward: "Surgical Ward", bed: "SW-12", admissionId: "ADM003" },
  { id: "P004", name: "Sunita Devi", ward: "Maternity", bed: "MW-08", admissionId: "ADM004" },
];

export function TreatmentNotesPage() {
  const [notes, setNotes] = useState<TreatmentNote[]>(mockNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<TreatmentNote | null>(null);

  const [newNote, setNewNote] = useState({
    patientId: "",
    doctorId: "",
    noteType: "progress" as TreatmentNote["noteType"],
    vitals: { bp: "", pulse: "", temp: "", spo2: "" },
    notes: "",
    assessment: "",
    plan: "",
  });

  const stats = {
    total: notes.length,
    today: notes.filter((n) => n.date === format(new Date(), "yyyy-MM-dd")).length,
    progress: notes.filter((n) => n.noteType === "progress").length,
    nursing: notes.filter((n) => n.noteType === "nursing").length,
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || note.noteType === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddNote = () => {
    const patient = currentPatients.find((p) => p.id === newNote.patientId);
    const doctor = doctors.find((d) => d.id === newNote.doctorId);
    if (!patient || !doctor) return;

    const note: TreatmentNote = {
      id: `TN${String(notes.length + 1).padStart(3, "0")}`,
      patientId: patient.id,
      patientName: patient.name,
      admissionId: patient.admissionId,
      ward: patient.ward,
      bedNumber: patient.bed,
      doctorId: doctor.id,
      doctorName: doctor.name,
      noteType: newNote.noteType,
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      vitals: newNote.vitals.bp ? newNote.vitals : undefined,
      notes: newNote.notes,
      assessment: newNote.assessment,
      plan: newNote.plan,
      createdAt: new Date().toISOString(),
    };

    setNotes((prev) => [note, ...prev]);
    setShowAddModal(false);
    setNewNote({
      patientId: "",
      doctorId: "",
      noteType: "progress",
      vitals: { bp: "", pulse: "", temp: "", spo2: "" },
      notes: "",
      assessment: "",
      plan: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treatment Notes</h1>
          <p className="text-gray-500 mt-1">IPD patient progress and treatment documentation</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Notes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Calendar className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              <p className="text-sm text-gray-500">Today's Notes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ClipboardList className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.progress}</p>
              <p className="text-sm text-gray-500">Progress Notes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.nursing}</p>
              <p className="text-sm text-gray-500">Nursing Notes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient, doctor, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "progress", "nursing", "medication", "procedure", "rounds"].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Patient & Location Info */}
              <div className="flex-shrink-0 lg:w-48">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{note.patientName}</span>
                </div>
                <div className="space-y-1 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <BedDouble className="h-3 w-3" />
                    <span>
                      {note.ward} - {note.bedNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-3 w-3" />
                    <span>{note.doctorName}</span>
                  </div>
                </div>
              </div>

              {/* Note Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={noteTypeColors[note.noteType]}>{note.noteType}</Badge>
                  <span className="text-sm text-gray-500">
                    {format(new Date(note.date), "MMM d, yyyy")} at {note.time}
                  </span>
                </div>

                {note.vitals && (
                  <div className="grid grid-cols-4 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-xs text-gray-500">BP</span>
                      <p className="font-medium text-gray-900">{note.vitals.bp}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Pulse</span>
                      <p className="font-medium text-gray-900">{note.vitals.pulse}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Temp</span>
                      <p className="font-medium text-gray-900">{note.vitals.temp}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">SpO2</span>
                      <p className="font-medium text-gray-900">{note.vitals.spo2}</p>
                    </div>
                  </div>
                )}

                <p className="text-gray-700 mb-2">{note.notes}</p>
                {note.assessment && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Assessment:</span> {note.assessment}
                  </p>
                )}
                {note.plan && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Plan:</span> {note.plan}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 lg:flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedNote(note);
                    setShowViewModal(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Note Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Treatment Note">
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select
                  value={newNote.patientId}
                  onChange={(e) => setNewNote({ ...newNote, patientId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select patient...</option>
                  {currentPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.ward} ({p.bed})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor/Staff</label>
                <select
                  value={newNote.doctorId}
                  onChange={(e) => setNewNote({ ...newNote, doctorId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
              <select
                value={newNote.noteType}
                onChange={(e) =>
                  setNewNote({
                    ...newNote,
                    noteType: e.target.value as TreatmentNote["noteType"],
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="progress">Progress Note</option>
                <option value="nursing">Nursing Note</option>
                <option value="medication">Medication Note</option>
                <option value="procedure">Procedure Note</option>
                <option value="rounds">Rounds Note</option>
              </select>
            </div>

            {/* Vitals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vitals (Optional)
              </label>
              <div className="grid grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="BP"
                  value={newNote.vitals.bp}
                  onChange={(e) =>
                    setNewNote({
                      ...newNote,
                      vitals: { ...newNote.vitals, bp: e.target.value },
                    })
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Pulse"
                  value={newNote.vitals.pulse}
                  onChange={(e) =>
                    setNewNote({
                      ...newNote,
                      vitals: { ...newNote.vitals, pulse: e.target.value },
                    })
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Temp"
                  value={newNote.vitals.temp}
                  onChange={(e) =>
                    setNewNote({
                      ...newNote,
                      vitals: { ...newNote.vitals, temp: e.target.value },
                    })
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="SpO2"
                  value={newNote.vitals.spo2}
                  onChange={(e) =>
                    setNewNote({
                      ...newNote,
                      vitals: { ...newNote.vitals, spo2: e.target.value },
                    })
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={newNote.notes}
                onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter observations, findings..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
              <textarea
                value={newNote.assessment}
                onChange={(e) => setNewNote({ ...newNote, assessment: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Clinical assessment..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <textarea
                value={newNote.plan}
                onChange={(e) => setNewNote({ ...newNote, plan: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Treatment plan, next steps..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddNote}
            disabled={!newNote.patientId || !newNote.doctorId || !newNote.notes}
          >
            Save Note
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Note Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedNote(null);
        }}
        title="Treatment Note Details"
      >
        <ModalBody>
          {selectedNote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium text-gray-900">{selectedNote.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">
                    {selectedNote.ward} - {selectedNote.bedNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Doctor/Staff</p>
                  <p className="font-medium text-gray-900">{selectedNote.doctorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(selectedNote.date), "MMM d, yyyy")} at {selectedNote.time}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Note Type</p>
                  <Badge className={noteTypeColors[selectedNote.noteType]}>
                    {selectedNote.noteType}
                  </Badge>
                </div>
              </div>

              {selectedNote.vitals && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Vitals</p>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500">BP</span>
                      <p className="font-medium text-gray-900">{selectedNote.vitals.bp}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500">Pulse</span>
                      <p className="font-medium text-gray-900">{selectedNote.vitals.pulse}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500">Temp</span>
                      <p className="font-medium text-gray-900">{selectedNote.vitals.temp}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500">SpO2</span>
                      <p className="font-medium text-gray-900">{selectedNote.vitals.spo2}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                <p className="text-gray-900">{selectedNote.notes}</p>
              </div>

              {selectedNote.assessment && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Assessment</p>
                  <p className="text-gray-900">{selectedNote.assessment}</p>
                </div>
              )}

              {selectedNote.plan && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Plan</p>
                  <p className="text-gray-900">{selectedNote.plan}</p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowViewModal(false);
              setSelectedNote(null);
            }}
          >
            Close
          </Button>
          <Button>Edit Note</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
