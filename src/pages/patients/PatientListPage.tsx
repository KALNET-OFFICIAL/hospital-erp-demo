import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, MoreVertical, Phone, Mail, User, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatDate, calculateAge } from "@/lib/utils";
import { getPatientsFromStorage } from "@/lib/patient-storage";

export function PatientListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const patients = useMemo(() => getPatientsFromStorage(), []);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h1 text-ink">Patients</h1>
          <p className="text-ink-muted mt-1">Manage patient records and information</p>
        </div>
        <Button onClick={() => navigate("/patients/new")} className="gap-2" size="default">
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          variant="interactive"
          accent="primary"
          onClick={() => {
            setSearchQuery("");
            setViewMode("table");
          }}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-muted">Total Patients</p>
                <p className="text-2xl font-bold text-ink mt-1">{patients.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="teal"
          onClick={() => navigate("/appointments/list")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-muted">New This Month</p>
                <p className="text-2xl font-bold text-ink mt-1">18</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="success"
          onClick={() => navigate("/opd")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-muted">Active Today</p>
                <p className="text-2xl font-bold text-ink mt-1">42</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success-50 flex items-center justify-center">
                <Eye className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="danger"
          onClick={() => navigate("/handover")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-muted">Critical</p>
                <p className="text-2xl font-bold text-ink mt-1">3</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-danger-50 flex items-center justify-center">
                <User className="h-6 w-6 text-danger-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card variant="elevated">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search by name, ID, or phone..."
                icon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <div className="flex rounded-lg border border-line overflow-hidden">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === "table"
                      ? "bg-primary-50 text-primary-700 border-r border-primary-200"
                      : "text-ink-muted hover:bg-hover"
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary-50 text-primary-700"
                      : "text-ink-muted hover:bg-hover"
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {viewMode === "table" ? (
        <Card variant="elevated">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Patient</TableHead>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Age / Gender</TableHead>
                <TableHead className="font-semibold">Blood Group</TableHead>
                <TableHead className="font-semibold">Registered</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <User className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-ink-muted">No patients found</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer hover:bg-hover transition-colors"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={patient.name} size="sm" />
                        <span className="font-medium text-ink">{patient.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                        {patient.id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-ink-muted">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {patient.phone}
                        </div>
                        {patient.email && (
                          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {patient.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-ink-muted">
                      {calculateAge(patient.dob)} yrs / {patient.gender.charAt(0).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {patient.bloodGroup ? (
                        <Badge variant="danger" className="font-semibold">
                          {patient.bloodGroup}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-ink-muted">
                      {formatDate(patient.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <User className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <p className="text-ink-muted mb-2">No patients found</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                variant="interactive"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={patient.name} size="lg" />
                      <div>
                        <p className="font-semibold text-ink">{patient.name}</p>
                        <code className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">
                          {patient.id}
                        </code>
                      </div>
                    </div>
                    {patient.bloodGroup && (
                      <Badge variant="danger" className="font-semibold">
                        {patient.bloodGroup}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm text-ink-muted">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {patient.phone}
                    </div>
                    {patient.email && (
                      <div className="flex items-center gap-2 text-sm text-ink-muted">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {patient.email}
                      </div>
                    )}
                    <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                      <span className="text-ink-muted">
                        {calculateAge(patient.dob)} years • {patient.gender}
                      </span>
                      <span className="text-slate-400">
                        {formatDate(patient.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
