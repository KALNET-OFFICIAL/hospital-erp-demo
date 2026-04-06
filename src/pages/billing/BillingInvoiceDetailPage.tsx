import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Save, Undo2, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PrintInvoice } from "@/components/print";
import { usePrint } from "@/hooks";
import { invoices as mockInvoices, patients } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useNotificationStore } from "@/stores";
import type { PaymentMethod, Invoice } from "@/types";

interface RefundEntry {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

// Get invoices from localStorage or mock data
function getInvoices(): Invoice[] {
  const stored = localStorage.getItem("hos_invoices");
  if (stored) {
    return JSON.parse(stored);
  }
  return mockInvoices;
}

// Save invoices to localStorage
function saveInvoices(invoiceList: Invoice[]) {
  localStorage.setItem("hos_invoices", JSON.stringify(invoiceList));
}

export function BillingInvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { printRef, handlePrint } = usePrint();
  const { addNotification } = useNotificationStore();

  const [invoiceList, setInvoiceList] = useState<Invoice[]>(getInvoices);
  const invoice = invoiceList.find((entry) => entry.id === invoiceId);
  const patient = patients.find((entry) => entry.id === invoice?.patientId);

  const [paidAmount, setPaidAmount] = useState(invoice?.paidAmount ?? 0);
  const [discount, setDiscount] = useState(invoice?.discount ?? 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(invoice?.paymentMethod ?? "cash");
  const [paymentInput, setPaymentInput] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refunds, setRefunds] = useState<RefundEntry[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state when invoice changes
  useEffect(() => {
    if (invoice) {
      setPaidAmount(invoice.paidAmount);
      setDiscount(invoice.discount);
      setPaymentMethod(invoice.paymentMethod ?? "cash");
    }
  }, [invoice]);

  const subtotal = invoice?.subtotal ?? 0;
  const tax = invoice?.tax ?? 0;
  const grandTotal = Math.max(subtotal + tax - discount, 0);
  const due = Math.max(grandTotal - paidAmount, 0);

  const paymentStatus = due === 0 ? "paid" : paidAmount > 0 ? "partial" : "pending";

  const invoiceItems = invoice?.items ?? [];

  const printData = useMemo(() => {
    if (!invoice) {
      return null;
    }

    return {
      id: invoice.id,
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      patientAge: patient ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : undefined,
      patientGender: patient?.gender,
      patientPhone: patient?.phone,
      patientAddress: patient?.address,
      visitType:
        invoice.type === "ipd" ? "IPD" : invoice.type === "pharmacy" ? "Emergency" : "OPD",
      items: invoiceItems.map((item) => ({
        description: item.name,
        quantity: item.quantity,
        rate: item.unitPrice,
        amount: item.total,
      })),
      subtotal,
      discount,
      tax,
      total: grandTotal,
      paid: paidAmount,
      due,
      paymentMethod,
      date: invoice.createdAt,
      invoiceDate: new Date().toISOString(),
    } as const;
  }, [invoice, patient, invoiceItems, subtotal, discount, tax, grandTotal, paidAmount, due, paymentMethod]);

  const collectPayment = () => {
    const amount = Number(paymentInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const nextPaid = Math.min(paidAmount + amount, grandTotal);
    setPaidAmount(nextPaid);
    setPaymentInput("");
    setHasChanges(true);

    addNotification({
      title: "Payment Recorded",
      message: `${formatCurrency(amount)} captured for ${invoiceId}`,
      type: "success",
    });
  };

  const handleDiscountChange = (value: number) => {
    setDiscount(value);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    if (!invoice) return;

    const updatedInvoices = invoiceList.map((inv) =>
      inv.id === invoiceId
        ? {
            ...inv,
            paidAmount,
            discount,
            paymentMethod,
            total: grandTotal,
            paymentStatus: (due === 0 ? "paid" : paidAmount > 0 ? "partial" : "pending") as Invoice["paymentStatus"],
            paidAt: due === 0 ? new Date().toISOString() : inv.paidAt,
          }
        : inv
    );

    setInvoiceList(updatedInvoices);
    saveInvoices(updatedInvoices);
    setHasChanges(false);

    addNotification({
      title: "Invoice Updated",
      message: `Changes saved for ${invoiceId}`,
      type: "success",
    });
  };

  const addRefund = () => {
    const amount = Number(refundAmount);
    if (!Number.isFinite(amount) || amount <= 0 || !refundReason.trim()) {
      return;
    }

    const entry: RefundEntry = {
      id: `RF-${Date.now()}`,
      amount,
      reason: refundReason.trim(),
      createdAt: new Date().toISOString(),
    };

    setRefunds((prev) => [entry, ...prev]);
    setRefundAmount("");
    setRefundReason("");

    addNotification({
      title: "Refund Requested",
      message: `${formatCurrency(amount)} flagged for ${invoiceId}`,
      type: "warning",
    });
  };

  if (!invoice) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-600">Invoice not found.</p>
        <Button className="mt-4" onClick={() => navigate("/billing")}>Back to Billing</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/billing")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Invoice Detail</h1>
            <p className="text-slate-500">{invoice.id} • {invoice.patientName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button 
            onClick={handleSaveChanges} 
            disabled={!hasChanges}
            className={hasChanges ? "bg-success-500 hover:bg-success-600" : ""}
          >
            {hasChanges ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Saved
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card className="p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="primary">{invoice.type.toUpperCase()}</Badge>
              <Badge variant={paymentStatus === "paid" ? "success" : paymentStatus === "partial" ? "warning" : "danger"}>
                {paymentStatus}
              </Badge>
              <span className="text-sm text-slate-500">Created {formatDate(invoice.createdAt)}</span>
            </div>

            <div className="space-y-2">
              {invoiceItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900">{formatCurrency(item.total)}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Collect Payment</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                label="Amount"
                type="number"
                value={paymentInput}
                onChange={(e) => setPaymentInput(e.target.value)}
                placeholder="0"
              />
              <Select
                label="Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "upi", label: "UPI" },
                  { value: "card", label: "Card" },
                  { value: "insurance", label: "Insurance" },
                ]}
              />
              <div className="flex items-end">
                <Button className="w-full" onClick={collectPayment}>Collect</Button>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Adjustments</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                label="Discount"
                type="number"
                value={discount}
                onChange={(e) => handleDiscountChange(Number(e.target.value) || 0)}
              />
              <div className="sm:col-span-2">
                <p className="mb-2 text-sm text-slate-600">Final total is recalculated instantly.</p>
                <Button variant="outline" className="gap-2" onClick={() => setDiscount(invoice.discount)}>
                  <Undo2 className="h-4 w-4" />
                  Reset Discount
                </Button>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Refund Request</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                label="Amount"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0"
              />
              <Input
                label="Reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Duplicate charge, service not used"
              />
              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={addRefund}>Create Refund</Button>
              </div>
            </div>

            {refunds.length > 0 && (
              <div className="space-y-2">
                {refunds.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{entry.id}</p>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {formatCurrency(entry.amount)} • {entry.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="space-y-2 p-4 text-sm">
            <p className="text-slate-500">Patient</p>
            <p className="font-semibold text-slate-900">{invoice.patientName}</p>
            <p className="text-slate-500">{invoice.patientId}</p>
            <div className="my-3 border-t border-slate-200" />
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paid</span>
              <span className="text-success-700">{formatCurrency(paidAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Due</span>
              <span className={due === 0 ? "text-success-700" : "text-warning-700"}>{formatCurrency(due)}</span>
            </div>
          </Card>
        </div>
      </div>

      {printData && (
        <div className="hidden">
          <div ref={printRef}>
            <PrintInvoice data={printData} />
          </div>
        </div>
      )}
    </div>
  );
}
