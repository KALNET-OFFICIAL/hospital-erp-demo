import { forwardRef } from "react";
import { formatDate } from "@/lib/utils";

interface DischargeSummaryData {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  patientAddress?: string;
  admissionId: string;
  admissionDate: string;
  dischargeDate: string;
  ward?: string;
  bed?: string;
  attendingDoctor: string;
  department?: string;
  diagnosisAtAdmission: string;
  diagnosisAtDischarge: string;
  chiefComplaints?: string[];
  historyOfPresentIllness?: string;
  pastHistory?: string;
  examinationFindings?: string;
  investigationsPerformed?: {
    name: string;
    result: string;
    date?: string;
  }[];
  proceduresPerformed?: {
    name: string;
    date: string;
    notes?: string;
  }[];
  treatmentGiven?: string;
  courseInHospital?: string;
  conditionAtDischarge: "stable" | "improved" | "unchanged" | "critical" | "against_advice";
  dischargeMedications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  dietaryAdvice?: string[];
  activityRestrictions?: string[];
  followUpInstructions?: string[];
  followUpDate?: string;
  emergencyContact?: string;
}

interface PrintDischargeSummaryProps {
  data: DischargeSummaryData;
  hospitalInfo?: {
    name: string;
    address: string;
    phone: string;
    email?: string;
    logo?: string;
  };
}

const conditionLabels: Record<string, string> = {
  stable: "Stable",
  improved: "Improved",
  unchanged: "Unchanged",
  critical: "Critical",
  against_advice: "Discharged Against Medical Advice (DAMA)",
};

const PrintDischargeSummary = forwardRef<HTMLDivElement, PrintDischargeSummaryProps>(
  ({ data, hospitalInfo }, ref) => {
    const hospital = hospitalInfo || {
      name: "KALNET Hospital",
      address: "123 Healthcare Avenue, Medical District, Mumbai - 400001",
      phone: "+91 22 1234 5678",
      email: "info@kalnethospital.com",
    };

    const stayDuration = Math.ceil(
      (new Date(data.dischargeDate).getTime() - new Date(data.admissionDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return (
      <div
        ref={ref}
        className="bg-white p-6 max-w-[210mm] mx-auto text-sm"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="border-b-4 border-blue-800 pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-blue-800">{hospital.name}</h1>
              <p className="text-gray-600 text-xs mt-1">{hospital.address}</p>
              <p className="text-gray-600 text-xs">Phone: {hospital.phone}</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-blue-800 bg-blue-100 px-4 py-2 rounded">
                DISCHARGE SUMMARY
              </h2>
              <p className="text-xs text-gray-600 mt-1">Doc ID: {data.id}</p>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 p-3 rounded text-xs">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-28 text-gray-500">Patient Name:</span>
              <span className="font-semibold">{data.patientName}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-500">Patient ID:</span>
              <span>{data.patientId}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-500">Age / Gender:</span>
              <span>
                {data.patientAge ? `${data.patientAge} yrs` : "-"} / {data.patientGender || "-"}
              </span>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-500">Phone:</span>
              <span>{data.patientPhone || "-"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex">
              <span className="w-28 text-gray-500">Admission ID:</span>
              <span>{data.admissionId}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-500">Admission Date:</span>
              <span>{formatDate(data.admissionDate)}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-500">Discharge Date:</span>
              <span>{formatDate(data.dischargeDate)}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-500">Duration of Stay:</span>
              <span className="font-semibold">{stayDuration} day(s)</span>
            </div>
          </div>
        </div>

        {/* Ward & Doctor Info */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
          {data.ward && (
            <div className="bg-blue-50 p-2 rounded">
              <span className="text-gray-500">Ward/Bed:</span>{" "}
              <span className="font-medium">
                {data.ward} {data.bed && `/ ${data.bed}`}
              </span>
            </div>
          )}
          <div className="bg-blue-50 p-2 rounded">
            <span className="text-gray-500">Attending Doctor:</span>{" "}
            <span className="font-medium">{data.attendingDoctor}</span>
          </div>
          {data.department && (
            <div className="bg-blue-50 p-2 rounded">
              <span className="text-gray-500">Department:</span>{" "}
              <span className="font-medium">{data.department}</span>
            </div>
          )}
        </div>

        {/* Diagnosis */}
        <div className="mb-4">
          <h3 className="font-bold text-blue-800 text-xs uppercase border-b border-blue-200 pb-1 mb-2">
            Diagnosis
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500">At Admission:</span>
              <p className="font-medium">{data.diagnosisAtAdmission}</p>
            </div>
            <div>
              <span className="text-gray-500">At Discharge:</span>
              <p className="font-medium">{data.diagnosisAtDischarge}</p>
            </div>
          </div>
        </div>

        {/* Chief Complaints */}
        {data.chiefComplaints && data.chiefComplaints.length > 0 && (
          <div className="mb-3">
            <h3 className="font-bold text-blue-800 text-xs uppercase border-b border-blue-200 pb-1 mb-2">
              Chief Complaints
            </h3>
            <p className="text-xs">{data.chiefComplaints.join(", ")}</p>
          </div>
        )}

        {/* History */}
        {data.historyOfPresentIllness && (
          <div className="mb-3">
            <h3 className="font-bold text-blue-800 text-xs uppercase border-b border-blue-200 pb-1 mb-2">
              History of Present Illness
            </h3>
            <p className="text-xs">{data.historyOfPresentIllness}</p>
          </div>
        )}

        {/* Examination Findings */}
        {data.examinationFindings && (
          <div className="mb-3">
            <h3 className="font-bold text-blue-800 text-xs uppercase border-b border-blue-200 pb-1 mb-2">
              Examination Findings
            </h3>
            <p className="text-xs">{data.examinationFindings}</p>
          </div>
        )}

        {/* Investigations */}
        {data.investigationsPerformed && data.investigationsPerformed.length > 0 && (
          <div className="mb-3">
            <h3 className="font-bold text-blue-800 text-xs uppercase border-b border-blue-200 pb-1 mb-2">
              Investigations Performed
            </h3>
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-1">Investigation</th>
                  <th className="text-left p-1">Result</th>
                  <th className="text-left p-1 w-24">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.investigationsPerformed.map((inv, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-1">{inv.name}</td>
                    <td className="p-1">{inv.result}</td>
                    <td className="p-1">{inv.date ? formatDate(inv.date) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Procedures */}
        {data.proceduresPerformed && data.proceduresPerformed.length > 0 && (
          <div className="mb-3">
            <h3 className="font-bold text-blue-800 text-xs uppercase border-b border-blue-200 pb-1 mb-2">
              Procedures Performed
            </h3>
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-1">Procedure</th>
                  <th className="text-left p-1 w-24">Date</th>
                  <th className="text-left p-1">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.proceduresPerformed.map((proc, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-1 font-medium">{proc.name}</td>
                    <td className="p-1">{formatDate(proc.date)}</td>
                    <td className="p-1">{proc.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Course in Hospital */}
        {data.courseInHospital && (
          <div className="mb-3">
            <h3 className="font-bold text-blue-800 text-xs uppercase border-b border-blue-200 pb-1 mb-2">
              Course in Hospital
            </h3>
            <p className="text-xs">{data.courseInHospital}</p>
          </div>
        )}

        {/* Condition at Discharge */}
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded">
          <span className="text-xs text-gray-600">Condition at Discharge:</span>{" "}
          <span
            className={`font-bold ${
              data.conditionAtDischarge === "against_advice"
                ? "text-red-600"
                : "text-green-700"
            }`}
          >
            {conditionLabels[data.conditionAtDischarge]}
          </span>
        </div>

        {/* Discharge Medications */}
        <div className="mb-4">
          <h3 className="font-bold text-blue-800 text-xs uppercase border-b border-blue-200 pb-1 mb-2">
            Discharge Medications
          </h3>
          <table className="w-full text-xs">
            <thead className="bg-blue-50">
              <tr>
                <th className="text-left p-1">#</th>
                <th className="text-left p-1">Medicine</th>
                <th className="text-left p-1">Dosage</th>
                <th className="text-left p-1">Frequency</th>
                <th className="text-left p-1">Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.dischargeMedications.map((med, index) => (
                <tr key={index} className="border-b">
                  <td className="p-1">{index + 1}</td>
                  <td className="p-1">
                    <span className="font-medium">{med.name}</span>
                    {med.instructions && (
                      <span className="text-gray-500 italic"> - {med.instructions}</span>
                    )}
                  </td>
                  <td className="p-1">{med.dosage}</td>
                  <td className="p-1">{med.frequency}</td>
                  <td className="p-1">{med.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Advice Sections */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          {data.dietaryAdvice && data.dietaryAdvice.length > 0 && (
            <div className="bg-yellow-50 p-2 rounded">
              <h4 className="font-bold text-yellow-800 mb-1">Dietary Advice:</h4>
              <ul className="list-disc list-inside">
                {data.dietaryAdvice.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {data.activityRestrictions && data.activityRestrictions.length > 0 && (
            <div className="bg-orange-50 p-2 rounded">
              <h4 className="font-bold text-orange-800 mb-1">Activity Restrictions:</h4>
              <ul className="list-disc list-inside">
                {data.activityRestrictions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Follow-up */}
        {(data.followUpDate || (data.followUpInstructions && data.followUpInstructions.length > 0)) && (
          <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
            <h3 className="font-bold text-green-800 text-xs uppercase mb-2">
              Follow-up Instructions
            </h3>
            {data.followUpDate && (
              <p className="text-sm font-medium text-green-800 mb-2">
                📅 Follow-up Date: {formatDate(data.followUpDate)}
              </p>
            )}
            {data.followUpInstructions && (
              <ul className="list-disc list-inside text-xs text-green-800">
                {data.followUpInstructions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Emergency Contact */}
        {data.emergencyContact && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <span className="font-bold text-red-800">Emergency Contact:</span>{" "}
            <span>{data.emergencyContact}</span>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between text-xs">
          <div className="text-center">
            <div className="w-40 border-t border-gray-400 pt-1">
              <p>Patient/Attendant Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="w-40 border-t border-gray-400 pt-1">
              <p>Nurse In-charge</p>
            </div>
          </div>
          <div className="text-center">
            <div className="w-40 border-t border-gray-400 pt-1">
              <p className="font-semibold">{data.attendingDoctor}</p>
              <p className="text-gray-500">Attending Doctor</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>This is a computer-generated discharge summary.</p>
          <p>For queries, contact: {hospital.phone}</p>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 8mm;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        `}</style>
      </div>
    );
  }
);

PrintDischargeSummary.displayName = "PrintDischargeSummary";

export { PrintDischargeSummary };
export type { DischargeSummaryData, PrintDischargeSummaryProps };
