import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BedDouble, Plus, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { wards, beds as mockBeds, admissions as mockAdmissions } from "@/lib/mock-data";
import type { BedStatus } from "@/types";

function getBeds() {
  const stored = localStorage.getItem("hos_beds");
  if (stored) {
    return JSON.parse(stored) as typeof mockBeds;
  }
  return mockBeds;
}

function getAdmissions() {
  const stored = localStorage.getItem("hos_admissions");
  if (stored) {
    return JSON.parse(stored) as typeof mockAdmissions;
  }
  return mockAdmissions;
}

export function IPDBedManagementPage() {
  const navigate = useNavigate();
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [bedList] = useState(getBeds);
  const [admissionList] = useState(getAdmissions);

  const wardAvailability = useMemo(
    () =>
      wards.reduce<Record<string, { total: number; available: number }>>((acc, ward) => {
        const wardBeds = bedList.filter((b) => b.wardId === ward.id);
        acc[ward.id] = {
          total: wardBeds.length,
          available: wardBeds.filter((b) => b.status === "available").length,
        };
        return acc;
      }, {}),
    [bedList]
  );

  const filteredBeds = selectedWard
    ? bedList.filter((b) => b.wardId === selectedWard)
    : bedList;

  const getStatusColor = (status: BedStatus) => {
    switch (status) {
      case "available":
        return "bg-success-100 border-success-300 text-success-700 hover:bg-success-200";
      case "occupied":
        return "bg-danger-100 border-danger-300 text-danger-700";
      case "maintenance":
        return "bg-slate-100 border-slate-300 text-ink-muted";
      case "reserved":
        return "bg-warning-100 border-warning-300 text-warning-700";
    }
  };

  const stats = {
    total: bedList.length,
    available: bedList.filter((b) => b.status === "available").length,
    occupied: bedList.filter((b) => b.status === "occupied").length,
    maintenance: bedList.filter((b) => b.status === "maintenance").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Bed Management</h1>
          <p className="text-ink-muted">IPD bed allocation and status</p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/ipd?new=true")}>
          <Plus size={16} />
          New Admission
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <BedDouble className="h-5 w-5 text-ink-muted" />
              </div>
              <div>
                <p className="text-sm text-ink-muted">Total Beds</p>
                <p className="text-xl font-bold text-ink">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
                <BedDouble className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-ink-muted">Available</p>
                <p className="text-xl font-bold text-success-600">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-100">
                <User className="h-5 w-5 text-danger-600" />
              </div>
              <div>
                <p className="text-sm text-ink-muted">Occupied</p>
                <p className="text-xl font-bold text-danger-600">{stats.occupied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100">
                <AlertTriangle className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-ink-muted">Maintenance</p>
                <p className="text-xl font-bold text-warning-600">{stats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ward Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedWard === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedWard(null)}
        >
          All Wards
        </Button>
        {wards.map((ward) => (
          <Button
            key={ward.id}
            variant={selectedWard === ward.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedWard(ward.id)}
          >
            {ward.name} ({wardAvailability[ward.id]?.available ?? 0}/{wardAvailability[ward.id]?.total ?? 0})
          </Button>
        ))}
      </div>

      {/* Bed Grid by Ward */}
      {wards
        .filter((w) => !selectedWard || w.id === selectedWard)
        .map((ward) => (
          <Card key={ward.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>{ward.name}</span>
                <Badge
                  variant={ward.type === "icu" ? "danger" : "default"}
                  className="uppercase"
                >
                  {ward.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                {filteredBeds
                  .filter((b) => b.wardId === ward.id)
                  .map((bed) => (
                    <div
                      key={bed.id}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-colors cursor-pointer",
                        getStatusColor(bed.status)
                      )}
                      title={
                        bed.patientName
                          ? `${bed.patientName}`
                          : bed.status
                      }
                    >
                      <BedDouble className="h-6 w-6" />
                      <span className="mt-1 text-xs font-bold">{bed.bedNumber}</span>
                      {bed.patientName && (
                        <span className="mt-0.5 text-[10px] truncate max-w-full">
                          {bed.patientName.split(" ")[0]}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-success-300 bg-success-100" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-danger-300 bg-danger-100" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-warning-300 bg-warning-100" />
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-slate-300 bg-slate-100" />
          <span>Maintenance</span>
        </div>
      </div>

      {/* Current Admissions */}
      <Card>
        <CardHeader>
          <CardTitle>Current Admissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
             {admissionList
               .filter((a) => a.status === "admitted")
              .map((admission) => (
                <div
                  key={admission.id}
                  className="flex items-center gap-4 rounded-lg border border-line p-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-ink">
                      {admission.patientName}
                    </p>
                    <p className="text-sm text-ink-muted">{admission.diagnosis}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="primary">{admission.bedNumber}</Badge>
                    <p className="mt-1 text-sm text-ink-muted">{admission.wardName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-ink-muted">{admission.doctorName}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
