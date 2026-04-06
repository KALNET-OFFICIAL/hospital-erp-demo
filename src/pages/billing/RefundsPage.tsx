import { useState } from "react";
import {
  Search,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCcw,
  IndianRupee,
  FileText,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { refunds, invoices } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Refund } from "@/types";

const statusConfig: Record<string, { label: string; variant: "primary" | "success" | "warning" | "danger"; icon: React.ReactNode }> = {
  pending: { label: "Pending", variant: "warning", icon: <Clock className="w-3 h-3" /> },
  approved: { label: "Approved", variant: "success", icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: "Rejected", variant: "danger", icon: <XCircle className="w-3 h-3" /> },
  processed: { label: "Processed", variant: "primary", icon: <RefreshCcw className="w-3 h-3" /> },
};

export default function RefundsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    invoiceId: "",
    amount: "",
    reason: "",
    paymentMode: "original",
  });

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch =
      refund.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || refund.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateRefund = () => {
    setFormData({
      invoiceId: "",
      amount: "",
      reason: "",
      paymentMode: "original",
    });
    setShowCreateModal(true);
  };

  const handleSubmitRefund = () => {
    console.log("Creating refund:", formData);
    setShowCreateModal(false);
  };

  const handleApprove = () => {
    console.log("Approving refund:", selectedRefund?.id);
    setShowApproveModal(false);
    setSelectedRefund(null);
  };

  const handleReject = () => {
    console.log("Rejecting refund:", selectedRefund?.id);
    setShowApproveModal(false);
    setSelectedRefund(null);
  };

  // Stats
  const totalRefunds = refunds.length;
  const pendingRefunds = refunds.filter((r) => r.status === "pending").length;
  const approvedRefunds = refunds.filter((r) => r.status === "approved" || r.status === "processed").length;
  const totalAmount = refunds.filter((r) => r.status === "approved" || r.status === "processed").reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refunds & Adjustments</h1>
          <p className="text-gray-500 mt-1">Process refund requests and billing adjustments</p>
        </div>
        <Button onClick={handleCreateRefund}>
          <Plus className="w-4 h-4 mr-2" />
          New Refund Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{totalRefunds}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <RefreshCcw className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-2xl font-bold text-warning-600">{pendingRefunds}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-success-600">{approvedRefunds}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Refunded</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by refund ID, invoice, or patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processed">Processed</option>
          </Select>
        </div>
      </Card>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedStatus === status
                ? "bg-primary-100 text-primary-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status === "all" ? "All" : statusConfig[status]?.label || status}
            <span className="ml-2 text-xs">
              ({status === "all" ? filteredRefunds.length : filteredRefunds.filter((r) => r.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Refunds List */}
      <div className="space-y-4">
        {filteredRefunds.map((refund) => (
          <Card key={refund.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                  <RefreshCcw className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{refund.id}</h3>
                    <Badge
                      variant={statusConfig[refund.status]?.variant || "primary"}
                      className="flex items-center gap-1"
                    >
                      {statusConfig[refund.status]?.icon}
                      {statusConfig[refund.status]?.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Invoice: {refund.invoiceId}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {refund.patientName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{refund.reason}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-semibold text-danger-600">-{formatCurrency(refund.amount)}</p>
                  <p className="text-xs text-gray-500">{formatDate(refund.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRefund(refund)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {refund.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRefund(refund);
                        setShowApproveModal(true);
                      }}
                    >
                      Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRefunds.length === 0 && (
        <div className="text-center py-12">
          <RefreshCcw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No refund requests found</p>
        </div>
      )}

      {/* Create Refund Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Refund Request"
      >
        <div className="space-y-4">
          <Select
            label="Invoice *"
            value={formData.invoiceId}
            onChange={(e) => {
              setFormData({ ...formData, invoiceId: e.target.value });
            }}
          >
            <option value="">Select Invoice</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.id} - {inv.patientName} ({formatCurrency(inv.total)})
              </option>
            ))}
          </Select>

          <Input
            label="Refund Amount (₹) *"
            type="number"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Explain the reason for refund..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <Select
            label="Refund Mode"
            value={formData.paymentMode}
            onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
          >
            <option value="original">Same as Original Payment</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
            <option value="credit">Credit Note</option>
          </Select>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRefund}>
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Refund Modal */}
      <Modal
        isOpen={!!selectedRefund && !showApproveModal}
        onClose={() => setSelectedRefund(null)}
        title={`Refund Details: ${selectedRefund?.id}`}
      >
        {selectedRefund && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Invoice</p>
                <p className="font-medium">{selectedRefund.invoiceId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={statusConfig[selectedRefund.status]?.variant || "primary"}>
                  {statusConfig[selectedRefund.status]?.label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-medium">{selectedRefund.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-semibold text-danger-600">{formatCurrency(selectedRefund.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Requested Date</p>
                <p className="font-medium">{formatDate(selectedRefund.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Requested By</p>
                <p className="font-medium">{selectedRefund.requestedBy}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">Reason</p>
              <p className="mt-1">{selectedRefund.reason}</p>
            </div>

            {selectedRefund.approvedBy && (
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Approved By</p>
                    <p className="font-medium">{selectedRefund.approvedBy}</p>
                  </div>
                  {selectedRefund.processedDate && (
                    <div>
                      <p className="text-sm text-gray-500">Processed Date</p>
                      <p className="font-medium">{formatDate(selectedRefund.processedDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedRefund(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve/Reject Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title={`Review Refund: ${selectedRefund?.id}`}
      >
        {selectedRefund && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Invoice</p>
                  <p className="font-medium">{selectedRefund.invoiceId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium">{selectedRefund.patientName}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Reason</p>
                <p className="mt-1">{selectedRefund.reason}</p>
              </div>
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-danger-600">{formatCurrency(selectedRefund.amount)}</p>
                <p className="text-sm text-gray-500">Refund Amount</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes (Optional)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={2}
                placeholder="Add any notes for this decision..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowApproveModal(false)}>
                Cancel
              </Button>
              <Button variant="outline" className="text-danger-600 border-danger-300 hover:bg-danger-50" onClick={handleReject}>
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button onClick={handleApprove}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
