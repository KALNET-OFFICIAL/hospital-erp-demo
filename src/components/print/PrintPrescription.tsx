import { forwardRef } from "react";
import { formatDate } from "@/lib/utils";

interface PrescriptionData {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  patientAddress?: string;
  doctorName: string;
  doctorQualification?: string;
  doctorRegistration?: string;
  department?: string;
  diagnosis?: string;
  symptoms?: string[];
  vitals?: {
    bp?: string;
    pulse?: string;
    temp?: string;
    weight?: string;
    spo2?: string;
  };
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  labTests?: string[];
  advice?: string[];
  followUp?: string;
  date: string;
}

interface PrintPrescriptionProps {
  data: PrescriptionData;
  hospitalInfo?: {
    name: string;
    address: string;
    phone: string;
    email?: string;
    logo?: string;
  };
}

const PrintPrescription = forwardRef<HTMLDivElement, PrintPrescriptionProps>(
  ({ data, hospitalInfo }, ref) => {
    const hospital = hospitalInfo || {
      name: "KALNET Hospital",
      address: "123 Healthcare Avenue, Medical District, Mumbai - 400001",
      phone: "+91 22 1234 5678",
      email: "info@kalnethospital.com",
    };

    return (
      <div
        ref={ref}
        className="bg-white p-8 max-w-[210mm] mx-auto text-sm"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="border-b-2 border-blue-600 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-blue-800">{hospital.name}</h1>
              <p className="text-gray-600 mt-1">{hospital.address}</p>
              <p className="text-gray-600">Phone: {hospital.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-800 font-bold text-lg">
                Dr. {data.doctorName}
              </p>
              {data.doctorQualification && (
                <p className="text-gray-600">{data.doctorQualification}</p>
              )}
              {data.doctorRegistration && (
                <p className="text-gray-600 text-xs">
                  Reg. No: {data.doctorRegistration}
                </p>
              )}
              {data.department && (
                <p className="text-blue-600 font-medium">{data.department}</p>
              )}
            </div>
          </div>
        </div>

        {/* Patient Info & Date */}
        <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded">
          <div>
            <p className="text-xs text-gray-500 uppercase">Patient Name</p>
            <p className="font-semibold">{data.patientName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Age / Gender</p>
            <p className="font-semibold">
              {data.patientAge ? `${data.patientAge} yrs` : "-"} /{" "}
              {data.patientGender || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Date</p>
            <p className="font-semibold">{formatDate(data.date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Patient ID</p>
            <p className="font-semibold">{data.patientId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Phone</p>
            <p className="font-semibold">{data.patientPhone || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Prescription ID</p>
            <p className="font-semibold">{data.id}</p>
          </div>
        </div>

        {/* Vitals */}
        {data.vitals && Object.values(data.vitals).some((v) => v) && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2 text-xs uppercase border-b pb-1">
              Vitals
            </h3>
            <div className="flex gap-6 text-sm">
              {data.vitals.bp && (
                <span>
                  <span className="text-gray-500">BP:</span> {data.vitals.bp}
                </span>
              )}
              {data.vitals.pulse && (
                <span>
                  <span className="text-gray-500">Pulse:</span> {data.vitals.pulse}
                </span>
              )}
              {data.vitals.temp && (
                <span>
                  <span className="text-gray-500">Temp:</span> {data.vitals.temp}
                </span>
              )}
              {data.vitals.weight && (
                <span>
                  <span className="text-gray-500">Weight:</span> {data.vitals.weight}
                </span>
              )}
              {data.vitals.spo2 && (
                <span>
                  <span className="text-gray-500">SpO2:</span> {data.vitals.spo2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Symptoms */}
        {data.symptoms && data.symptoms.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold text-gray-800 mb-2 text-xs uppercase border-b pb-1">
              Chief Complaints
            </h3>
            <p>{data.symptoms.join(", ")}</p>
          </div>
        )}

        {/* Diagnosis */}
        {data.diagnosis && (
          <div className="mb-6 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
            <h3 className="font-bold text-blue-800 mb-1 text-xs uppercase">
              Diagnosis
            </h3>
            <p className="text-blue-900">{data.diagnosis}</p>
          </div>
        )}

        {/* Rx Symbol & Medicines */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl font-serif text-blue-600">℞</span>
            <h3 className="font-bold text-gray-800 text-xs uppercase">
              Medications
            </h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2 w-8">#</th>
                <th className="text-left p-2">Medicine</th>
                <th className="text-left p-2 w-24">Dosage</th>
                <th className="text-left p-2 w-28">Frequency</th>
                <th className="text-left p-2 w-20">Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.medicines.map((med, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-2 text-gray-500">{index + 1}</td>
                  <td className="p-2">
                    <span className="font-medium">{med.name}</span>
                    {med.instructions && (
                      <p className="text-xs text-gray-500 italic">
                        {med.instructions}
                      </p>
                    )}
                  </td>
                  <td className="p-2">{med.dosage}</td>
                  <td className="p-2">{med.frequency}</td>
                  <td className="p-2">{med.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lab Tests */}
        {data.labTests && data.labTests.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2 text-xs uppercase border-b pb-1">
              Lab Tests Advised
            </h3>
            <ul className="list-disc list-inside">
              {data.labTests.map((test, index) => (
                <li key={index}>{test}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Advice */}
        {data.advice && data.advice.length > 0 && (
          <div className="mb-6 p-3 bg-yellow-50 rounded border border-yellow-200">
            <h3 className="font-bold text-yellow-800 mb-2 text-xs uppercase">
              Advice / Instructions
            </h3>
            <ul className="list-disc list-inside text-yellow-900">
              {data.advice.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Follow-up */}
        {data.followUp && (
          <div className="mb-6 p-3 bg-green-50 rounded border border-green-200">
            <p className="text-green-800">
              <span className="font-bold">Follow-up:</span> {data.followUp}
            </p>
          </div>
        )}

        {/* Signature */}
        <div className="mt-12 flex justify-end">
          <div className="text-center w-48">
            <div className="border-t border-gray-400 pt-2">
              <p className="font-semibold">Dr. {data.doctorName}</p>
              {data.doctorQualification && (
                <p className="text-xs text-gray-500">{data.doctorQualification}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
          <p>This prescription is valid for 7 days from the date of issue.</p>
          <p>For emergency, contact: {hospital.phone}</p>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
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

PrintPrescription.displayName = "PrintPrescription";

export { PrintPrescription };
export type { PrescriptionData, PrintPrescriptionProps };
