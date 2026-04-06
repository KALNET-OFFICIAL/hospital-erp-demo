import { forwardRef } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceData {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  patientAddress?: string;
  doctorName?: string;
  department?: string;
  visitType: "OPD" | "IPD" | "Emergency";
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  paid: number;
  due: number;
  paymentMethod?: string;
  date: string;
  invoiceDate?: string;
}

interface PrintInvoiceProps {
  data: InvoiceData;
  hospitalInfo?: {
    name: string;
    address: string;
    phone: string;
    email?: string;
    gstNumber?: string;
    logo?: string;
  };
}

const PrintInvoice = forwardRef<HTMLDivElement, PrintInvoiceProps>(
  ({ data, hospitalInfo }, ref) => {
    const hospital = hospitalInfo || {
      name: "KALNET Hospital",
      address: "123 Healthcare Avenue, Medical District, Mumbai - 400001",
      phone: "+91 22 1234 5678",
      email: "billing@kalnethospital.com",
      gstNumber: "27AABCK1234A1ZJ",
    };

    return (
      <div
        ref={ref}
        className="bg-white p-8 max-w-[210mm] mx-auto text-sm"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{hospital.name}</h1>
            <p className="text-gray-600 mt-1">{hospital.address}</p>
            <p className="text-gray-600">
              Phone: {hospital.phone}
              {hospital.email && ` | Email: ${hospital.email}`}
            </p>
            {hospital.gstNumber && (
              <p className="text-gray-600">GST No: {hospital.gstNumber}</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">Invoice No:</span> {data.id}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Date:</span>{" "}
              {formatDate(data.invoiceDate || data.date)}
            </p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold text-gray-800 mb-2 uppercase text-xs">
              Bill To:
            </h3>
            <p className="font-semibold text-gray-900">{data.patientName}</p>
            <p className="text-gray-600">Patient ID: {data.patientId}</p>
            {data.patientAge && data.patientGender && (
              <p className="text-gray-600">
                {data.patientAge} yrs / {data.patientGender}
              </p>
            )}
            {data.patientPhone && (
              <p className="text-gray-600">Phone: {data.patientPhone}</p>
            )}
            {data.patientAddress && (
              <p className="text-gray-600">{data.patientAddress}</p>
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold text-gray-800 mb-2 uppercase text-xs">
              Visit Details:
            </h3>
            <p className="text-gray-600">
              <span className="font-medium">Type:</span> {data.visitType}
            </p>
            {data.doctorName && (
              <p className="text-gray-600">
                <span className="font-medium">Doctor:</span> {data.doctorName}
              </p>
            )}
            {data.department && (
              <p className="text-gray-600">
                <span className="font-medium">Department:</span> {data.department}
              </p>
            )}
            <p className="text-gray-600">
              <span className="font-medium">Visit Date:</span>{" "}
              {formatDate(data.date)}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="text-left p-2 w-8">#</th>
              <th className="text-left p-2">Description</th>
              <th className="text-center p-2 w-16">Qty</th>
              <th className="text-right p-2 w-24">Rate</th>
              <th className="text-right p-2 w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-2 text-gray-600">{index + 1}</td>
                <td className="p-2">{item.description}</td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-right">{formatCurrency(item.rate)}</td>
                <td className="p-2 text-right font-medium">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCurrency(data.subtotal)}</span>
            </div>
            {data.discount && data.discount > 0 && (
              <div className="flex justify-between py-1 text-green-600">
                <span>Discount:</span>
                <span>-{formatCurrency(data.discount)}</span>
              </div>
            )}
            {data.tax && data.tax > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Tax:</span>
                <span>{formatCurrency(data.tax)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-t-2 border-gray-800 font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(data.total)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Paid:</span>
              <span className="text-green-600">{formatCurrency(data.paid)}</span>
            </div>
            {data.due > 0 && (
              <div className="flex justify-between py-1 text-red-600 font-medium">
                <span>Due:</span>
                <span>{formatCurrency(data.due)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        {data.paymentMethod && (
          <div className="mb-6 p-3 bg-green-50 rounded border border-green-200">
            <p className="text-green-800">
              <span className="font-medium">Payment Method:</span>{" "}
              {data.paymentMethod}
              {data.paid >= data.total && (
                <span className="ml-4 font-bold">✓ PAID IN FULL</span>
              )}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 mt-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-gray-500">Terms & Conditions:</p>
              <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
                <li>Payment is due upon receipt</li>
                <li>This is a computer-generated invoice</li>
                <li>Subject to Mumbai jurisdiction</li>
              </ul>
            </div>
            <div className="text-right">
              <div className="mt-8 pt-4 border-t border-gray-300 inline-block w-48">
                <p className="text-xs text-gray-500">Authorized Signature</p>
              </div>
            </div>
          </div>
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

PrintInvoice.displayName = "PrintInvoice";

export { PrintInvoice };
export type { InvoiceData, PrintInvoiceProps };
