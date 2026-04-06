import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { patients } from "@/lib/mock-data";

export function PatientTimelineIndexPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredPatients = useMemo(() => {
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query.toLowerCase()) ||
        patient.id.toLowerCase().includes(query.toLowerCase()) ||
        patient.phone.includes(query)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Patient Timeline</h1>
        <p className="text-slate-500">Jump to a patient to view complete care continuity</p>
      </div>

      <Card className="p-4">
        <Input
          icon={<Search size={16} />}
          placeholder="Search by name, patient ID, or phone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Card>

      <div className="space-y-3">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{patient.name}</p>
                <p className="text-sm text-slate-500">
                  {patient.id} • {patient.phone}
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate(`/patients/${patient.id}/timeline`)}
              >
                Open Timeline
                <ArrowRight size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
