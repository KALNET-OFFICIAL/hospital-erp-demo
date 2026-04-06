import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EMRRecord } from "@/types";
import { formatDate } from "@/lib/utils";

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

export function OPDEMRRecordsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const records = readEMRRecords();

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const text = `${record.patientId} ${record.doctorName} ${record.diagnosis}`.toLowerCase();
      return text.includes(query.toLowerCase());
    });
  }, [records, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">EMR Records</h1>
        <p className="text-slate-500">Search and reopen consultation records</p>
      </div>

      <Card className="p-4">
        <Input
          icon={<Search size={16} />}
          placeholder="Search by patient, doctor, diagnosis"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Card>

      <div className="space-y-3">
        {filtered.map((record) => (
          <Card key={record.id} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">Visit {record.visitId}</p>
                <p className="text-sm text-slate-500">
                  Patient {record.patientId} • Dr. {record.doctorName} • {formatDate(record.date)}
                </p>
                <p className="mt-1 text-sm text-slate-700">{record.diagnosis || "No diagnosis"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="primary">{record.prescription.length} meds</Badge>
                {record.labTests && record.labTests.length > 0 && (
                  <Badge variant="warning">{record.labTests.length} lab tests</Badge>
                )}
                {record.followUp && <Badge variant="info">Follow-up</Badge>}
                <Button variant="outline" onClick={() => navigate(`/opd/consultation/${record.visitId}`)}>
                  Open
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-8 text-center text-slate-500">No EMR records found.</Card>
      )}
    </div>
  );
}
