import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  BedDouble,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  Stethoscope,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import {
  admissions as mockAdmissions,
  patients as mockPatients,
  staff as mockStaff,
  wards,
  beds as mockBeds,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import type { Admission, Bed } from "@/types";

type AdmissionStatus = "admitted" | "discharged" | "transferred";

// Get admissions from localStorage or mock data
function getAdmissions(): Admission[] {
  const stored = localStorage.getItem("hos_admissions");
  if (stored) {
    return JSON.parse(stored);
  }
  return mockAdmissions;
}

// Save admissions to localStorage
function saveAdmissions(admissionList: Admission[]) {
  localStorage.setItem("hos_admissions", JSON.stringify(admissionList));
}

// Get beds from localStorage or mock data
function getBeds(): Bed[] {
  const stored = localStorage.getItem("hos_beds");
  if (stored) {
    const storedBeds = JSON.parse(stored) as Bed[];
    const storedById = new Map(storedBeds.map((bed) => [bed.id, bed]));
    const mergedBeds = mockBeds.map((bed) => {
      const persisted = storedById.get(bed.id);
      return persisted ? { ...bed, ...persisted, bedNumber: bed.bedNumber, wardId: bed.wardId } : bed;
    });
    const additionalBeds = storedBeds.filter((bed) => !mockBeds.some((mock) => mock.id === bed.id));
    const reconciledBeds = [...mergedBeds, ...additionalBeds];
    localStorage.setItem("hos_beds", JSON.stringify(reconciledBeds));
    return reconciledBeds;
  }
  localStorage.setItem("hos_beds", JSON.stringify(mockBeds));
  return mockBeds;
}

// Save beds to localStorage
function saveBeds(bedList: Bed[]) {
  localStorage.setItem("hos_beds", JSON.stringify(bedList));
}

function getPatients() {
  const stored = localStorage.getItem("hos_patients");
  if (stored) {
    return JSON.parse(stored) as typeof mockPatients;
  }
  return mockPatients;
}

function getStaff() {
  const stored = localStorage.getItem("hos_staff");
  if (stored) {
    return JSON.parse(stored) as typeof mockStaff;
  }
  return mockStaff;
}

export function IPDAdmissionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [admissionList, setAdmissionList] = useState<Admission[]>(getAdmissions);
  const [bedList, setBedList] = useState<Bed[]>(getBeds);
  const [patientList] = useState(getPatients);
  const [staffList] = useState(getStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdmissionStatus | "all">("all");
  const [showNewAdmissionModal, setShowNewAdmissionModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [selectedBed, setSelectedBed] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState("");

  useEffect(() => {
    const shouldOpenFromRoute =
      location.pathname === "/ipd/admissions/new" || searchParams.get("new") === "true";
    if (shouldOpenFromRoute) {
      setShowNewAdmissionModal(true);
      if (searchParams.get("new")) {
        searchParams.delete("new");
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [location.pathname, searchParams, setSearchParams]);

  const filteredAdmissions = admissionList.filter((admission) => {
    const matchesSearch =
      admission.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.bedNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || admission.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: admissionList.length,
    admitted: admissionList.filter((a) => a.status === "admitted").length,
    discharged: admissionList.filter((a) => a.status === "discharged").length,
    avgStay: admissionList.length > 0 ? Math.round(
      admissionList.reduce((acc, a) => {
        if (a.dischargeDate) {
          return acc + differenceInDays(new Date(a.dischargeDate), new Date(a.admissionDate));
        }
        return acc + differenceInDays(new Date(), new Date(a.admissionDate));
      }, 0) / admissionList.length
    ) : 0,
  };

  const getStatusBadge = (status: AdmissionStatus) => {
    switch (status) {
      case "admitted":
        return <Badge variant="success">Admitted</Badge>;
      case "discharged":
        return <Badge variant="default">Discharged</Badge>;
      case "transferred":
        return <Badge variant="warning">Transferred</Badge>;
    }
  };

  const availableBeds = bedList.filter(
    (bed) => bed.status === "available" && (!selectedWard || bed.wardId === selectedWard)
  );

  const wardAvailability = useMemo(
    () =>
      wards.reduce<Record<string, number>>((acc, ward) => {
        acc[ward.id] = bedList.filter(
          (bed) => bed.wardId === ward.id && bed.status === "available"
        ).length;
        return acc;
      }, {}),
    [bedList]
  );

  const assignedPatientIds = useMemo(() => {
    const admittedIds = admissionList
      .filter((admission) => admission.status === "admitted")
      .map((admission) => admission.patientId);
    const occupiedBedIds = bedList
      .filter((bed) => bed.status === "occupied" && bed.patientId)
      .map((bed) => bed.patientId as string);
    return new Set([...admittedIds, ...occupiedBedIds]);
  }, [admissionList, bedList]);

  const unassignedPatients = patientList.filter((patient) => !assignedPatientIds.has(patient.id));

  const doctors = staffList.filter((s) => s.role === "doctor");

  const handleCreateAdmission = () => {
    if (!selectedPatient || !selectedWard || !selectedBed || !selectedDoctor || !diagnosis) {
      alert("Please fill all required fields");
      return;
    }

    const patient = patientList.find((p) => p.id === selectedPatient);
    const ward = wards.find((w) => w.id === selectedWard);
    const bed = bedList.find((b) => b.id === selectedBed);
    const doctor = doctors.find((d) => d.id === selectedDoctor);

    if (!patient || !ward || !bed || !doctor) {
      alert("Invalid selection");
      return;
    }

    const alreadyAdmitted = assignedPatientIds.has(patient.id);
    if (alreadyAdmitted) {
      alert("This patient is already admitted and assigned a bed.");
      return;
    }

    if (bed.status !== "available") {
      alert("Selected bed is no longer available. Please choose another bed.");
      return;
    }

    // Create new admission
    const newAdmission: Admission = {
      id: `ADM${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      wardId: ward.id,
      wardName: ward.name,
      bedId: bed.id,
      bedNumber: bed.bedNumber,
      admissionDate: new Date().toISOString(),
      status: "admitted",
      diagnosis,
      doctorId: doctor.id,
      doctorName: doctor.name,
    };

    // Update bed status
    const updatedBeds = bedList.map((b) =>
      b.id === selectedBed
        ? { ...b, status: "occupied" as const, patientId: patient.id, patientName: patient.name }
        : b
    );

    // Save everything
    const updatedAdmissions = [...admissionList, newAdmission];
    setAdmissionList(updatedAdmissions);
    setBedList(updatedBeds);
    saveAdmissions(updatedAdmissions);
    saveBeds(updatedBeds);

    // Reset form
    setShowNewAdmissionModal(false);
    setSelectedPatient("");
    setSelectedWard("");
    setSelectedBed("");
    setSelectedDoctor("");
    setDiagnosis("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">IPD Admissions</h1>
          <p className="text-slate-500">Manage inpatient admissions and records</p>
        </div>
        <Button className="gap-2" onClick={() => setShowNewAdmissionModal(true)}>
          <Plus size={16} />
          New Admission
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter("all")}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setStatusFilter("all")}
          className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <BedDouble className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Admissions</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter("admitted")}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setStatusFilter("admitted")}
          className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Currently Admitted</p>
              <p className="text-2xl font-bold text-green-600">{stats.admitted}</p>
            </div>
          </div>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter("discharged")}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && setStatusFilter("discharged")
          }
          className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Discharged</p>
              <p className="text-2xl font-bold text-slate-600">{stats.discharged}</p>
            </div>
          </div>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate("/reports/ipd")}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/reports/ipd")}
          className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Stay (days)</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgStay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by patient, diagnosis, bed..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "admitted" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("admitted")}
          >
            Admitted
          </Button>
          <Button
            variant={statusFilter === "discharged" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("discharged")}
          >
            Discharged
          </Button>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Patient</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Ward / Bed</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Doctor</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Diagnosis</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Admission Date</th>
                <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Status</th>
                <th className="text-right text-sm font-medium text-slate-600 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-slate-300" />
                      <p className="text-slate-500">No admissions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((admission) => (
                  <tr key={admission.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{admission.patientName}</p>
                          <p className="text-sm text-slate-500">ID: {admission.patientId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900">{admission.bedNumber}</p>
                          <p className="text-sm text-slate-500">{admission.wardName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">{admission.doctorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 max-w-[200px] truncate" title={admission.diagnosis}>
                        {admission.diagnosis}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">
                          {format(new Date(admission.admissionDate), "dd MMM yyyy")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(admission.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/patients/${admission.patientId}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {admission.status === "admitted" && (
                          <Link to={`/ipd/discharge?admissionId=${admission.id}`}>
                            <Button variant="outline" size="sm">
                              Discharge
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Admission Modal */}
      <Modal
        isOpen={showNewAdmissionModal}
        onClose={() => setShowNewAdmissionModal(false)}
        title="New Admission"
        className="max-w-xl"
      >
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Select Patient
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
              >
                <option value="">Select a patient...</option>
                {unassignedPatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.phone}
                  </option>
                ))}
              </select>
              {unassignedPatients.length === 0 && (
                <p className="mt-1 text-xs text-warning-600">
                  All patients are currently assigned to beds. Discharge or transfer a patient first.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ward</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedWard}
                  onChange={(e) => {
                    setSelectedWard(e.target.value);
                    setSelectedBed(""); // Reset bed when ward changes
                  }}
                >
                  <option value="">Select ward...</option>
                  {wards.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name} ({wardAvailability[ward.id] ?? 0} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bed</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedBed}
                  onChange={(e) => setSelectedBed(e.target.value)}
                  disabled={!selectedWard}
                >
                  <option value="">Select bed...</option>
                  {availableBeds.map((bed) => (
                    <option key={bed.id} value={bed.id}>
                      Bed {bed.bedNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Attending Doctor
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <option value="">Select doctor...</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Diagnosis / Reason for Admission
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter diagnosis or reason for admission..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowNewAdmissionModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateAdmission}
            disabled={
              !selectedPatient ||
              !selectedWard ||
              !selectedBed ||
              !selectedDoctor ||
              unassignedPatients.length === 0
            }
          >
            Admit Patient
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
