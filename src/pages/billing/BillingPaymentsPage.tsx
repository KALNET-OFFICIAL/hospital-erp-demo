import { useMemo, useState } from "react";
import { CreditCard, IndianRupee, Search, CheckCircle, Clock, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { invoices as mockInvoices } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentMethod, Invoice } from "@/types";

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

// Get payment history
interface Payment {
  id: string;
  invoiceId: string;
  patientName: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  createdAt: string;
}

function getPayments(): Payment[] {
  const stored = localStorage.getItem("hos_payments");
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

function savePayment(payment: Payment) {
  const payments = getPayments();
  payments.unshift(payment);
  localStorage.setItem("hos_payments", JSON.stringify(payments));
}

const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "insurance", label: "Insurance" },
];

export function BillingPaymentsPage() {
  const [query, setQuery] = useState("");
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(getInvoices);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);

  const filtered = useMemo(() => {
    return invoiceList.filter((invoice) => {
      const pending = invoice.total - invoice.paidAmount;
      if (pending <= 0) {
        return false;
      }
      const lowerQuery = query.toLowerCase();
      return (
        invoice.patientName.toLowerCase().includes(lowerQuery) ||
        invoice.id.toLowerCase().includes(lowerQuery)
      );
    });
  }, [invoiceList, query]);

  const dueTotal = filtered.reduce((sum, invoice) => sum + (invoice.total - invoice.paidAmount), 0);
  const recentPayments = getPayments().slice(0, 5);

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    const pending = invoice.total - invoice.paidAmount;
    setPaymentAmount(pending.toString());
    setPaymentMethod("cash");
    setPaymentNotes("");
    setShowPaymentModal(true);
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice) return;
    
    const amount = parseFloat(paymentAmount);
    const pending = selectedInvoice.total - selectedInvoice.paidAmount;
    
    if (amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    if (amount > pending) {
      alert(`Amount cannot exceed pending balance of ${formatCurrency(pending)}`);
      return;
    }

    // Create payment record
    const payment: Payment = {
      id: `PAY${Date.now()}`,
      invoiceId: selectedInvoice.id,
      patientName: selectedInvoice.patientName,
      amount,
      method: paymentMethod,
      notes: paymentNotes || undefined,
      createdAt: new Date().toISOString(),
    };

    // Update invoice
    const newPaidAmount = selectedInvoice.paidAmount + amount;
    const newStatus = newPaidAmount >= selectedInvoice.total ? "paid" : "partial";
    
    const updatedInvoices = invoiceList.map((inv) =>
      inv.id === selectedInvoice.id
        ? {
            ...inv,
            paidAmount: newPaidAmount,
            paymentStatus: newStatus as Invoice["paymentStatus"],
            paymentMethod,
            paidAt: newStatus === "paid" ? new Date().toISOString() : inv.paidAt,
          }
        : inv
    );

    // Save everything
    savePayment(payment);
    saveInvoices(updatedInvoices);
    setInvoiceList(updatedInvoices);
    setLastPayment(payment);

    // Show success
    setShowPaymentModal(false);
    setShowSuccessModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Payments</h1>
        <p className="text-ink-muted">Record and track invoice payments</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Clock className="h-5 w-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Pending Invoices</p>
              <p className="text-2xl font-bold text-ink">{filtered.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-danger-100 rounded-lg">
              <IndianRupee className="h-5 w-5 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Outstanding Amount</p>
              <p className="text-2xl font-bold text-danger-600">{formatCurrency(dueTotal)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Today's Collections</p>
              <p className="text-2xl font-bold text-success-600">
                {formatCurrency(
                  getPayments()
                    .filter((p) => p.createdAt.startsWith(new Date().toISOString().split("T")[0]))
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Pending Invoices */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <Input
              icon={<Search size={16} />}
              placeholder="Search by invoice ID or patient name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Card>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-success-300 mb-4" />
                <p className="text-ink-muted">No pending payments!</p>
              </Card>
            ) : (
              filtered.map((invoice) => {
                const pending = invoice.total - invoice.paidAmount;
                return (
                  <Card key={invoice.id} className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-ink">{invoice.patientName}</p>
                        <p className="text-sm text-ink-muted">
                          {invoice.id} • {formatDate(invoice.createdAt)}
                        </p>
                        <p className="text-sm text-ink-muted">
                          Total: {formatCurrency(invoice.total)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={invoice.paymentStatus === "partial" ? "warning" : "danger"}>
                          {invoice.paymentStatus}
                        </Badge>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-warning-50 px-3 py-1 text-sm font-medium text-warning-700">
                          <IndianRupee size={14} />
                          {formatCurrency(pending)} due
                        </span>
                        {invoice.paidAmount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-success-50 px-3 py-1 text-sm text-success-700">
                            <CreditCard size={14} />
                            Paid {formatCurrency(invoice.paidAmount)}
                          </span>
                        )}
                        <Button size="sm" onClick={() => openPaymentModal(invoice)}>
                          Record Payment
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Recent Payments */}
        <div>
          <Card className="p-4">
            <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <Receipt size={18} />
              Recent Payments
            </h3>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-ink-muted text-center py-4">No payments recorded yet</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="border-b border-line pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink">{payment.patientName}</p>
                        <p className="text-xs text-ink-muted">{payment.invoiceId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-success-600">
                          +{formatCurrency(payment.amount)}
                        </p>
                        <Badge variant="default" className="text-xs capitalize">
                          {payment.method}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-ink-muted mt-1">{formatDate(payment.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
      >
        {selectedInvoice && (
          <ModalBody>
            <div className="space-y-4">
              {/* Invoice Summary */}
              <div className="bg-bg rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-ink-muted">Invoice</p>
                    <p className="font-medium">{selectedInvoice.id}</p>
                  </div>
                  <div>
                    <p className="text-ink-muted">Patient</p>
                    <p className="font-medium">{selectedInvoice.patientName}</p>
                  </div>
                  <div>
                    <p className="text-ink-muted">Total Amount</p>
                    <p className="font-medium">{formatCurrency(selectedInvoice.total)}</p>
                  </div>
                  <div>
                    <p className="text-ink-muted">Already Paid</p>
                    <p className="font-medium text-success-600">{formatCurrency(selectedInvoice.paidAmount)}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-line text-center">
                  <p className="text-sm text-ink-muted">Balance Due</p>
                  <p className="text-2xl font-bold text-danger-600">
                    {formatCurrency(selectedInvoice.total - selectedInvoice.paidAmount)}
                  </p>
                </div>
              </div>

              <Input
                label="Payment Amount (₹) *"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />

              <Select
                label="Payment Method *"
                options={paymentMethodOptions}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              />

              <div>
                <label className="block text-sm font-medium text-ink-muted mb-1">Notes (Optional)</label>
                <textarea
                  className="w-full px-3 py-2 border border-line bg-paper text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={2}
                  placeholder="Transaction reference, remarks..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>
            </div>
          </ModalBody>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleRecordPayment} className="gap-2">
            <CheckCircle size={16} />
            Record Payment
          </Button>
        </ModalFooter>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Payment Recorded"
      >
        <ModalBody>
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-success-600" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Payment Successful!</h3>
            {lastPayment && (
              <div className="space-y-2 text-sm text-ink-muted">
                <p>Payment ID: {lastPayment.id}</p>
                <p>Amount: {formatCurrency(lastPayment.amount)}</p>
                <p className="capitalize">Method: {lastPayment.method}</p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowSuccessModal(false)}>
            Done
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
