import { useState } from "react";
import {
  CalendarOff,
  Plus,
  Search,
  Check,
  X,
  Clock,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { format, addDays, differenceInDays } from "date-fns";

interface LeaveRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  department: string;
  leaveType: "casual" | "medical" | "emergency" | "vacation" | "conference";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedOn: string;
  approvedBy?: string;
  rejectionReason?: string;
}

const leaveTypeColors: Record<string, string> = {
  casual: "bg-blue-100 text-blue-800",
  medical: "bg-red-100 text-red-800",
  emergency: "bg-orange-100 text-orange-800",
  vacation: "bg-teal-100 text-teal-800",
  conference: "bg-purple-100 text-purple-800",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const mockLeaves: LeaveRequest[] = [
  {
    id: "L001",
    doctorId: "D001",
    doctorName: "Dr. Sarah Johnson",
    department: "Cardiology",
    leaveType: "vacation",
    startDate: format(addDays(new Date(), 5), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 10), "yyyy-MM-dd"),
    reason: "Annual family vacation",
    status: "pending",
    appliedOn: format(addDays(new Date(), -2), "yyyy-MM-dd"),
  },
  {
    id: "L002",
    doctorId: "D002",
    doctorName: "Dr. Michael Chen",
    department: "Orthopedics",
    leaveType: "conference",
    startDate: format(addDays(new Date(), 15), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 18), "yyyy-MM-dd"),
    reason: "International Orthopedics Conference - Chicago",
    status: "approved",
    appliedOn: format(addDays(new Date(), -10), "yyyy-MM-dd"),
    approvedBy: "Admin",
  },
  {
    id: "L003",
    doctorId: "D003",
    doctorName: "Dr. Emily Parker",
    department: "Pediatrics",
    leaveType: "medical",
    startDate: format(addDays(new Date(), -3), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
    reason: "Medical procedure",
    status: "approved",
    appliedOn: format(addDays(new Date(), -7), "yyyy-MM-dd"),
    approvedBy: "Admin",
  },
  {
    id: "L004",
    doctorId: "D004",
    doctorName: "Dr. James Wilson",
    department: "General Medicine",
    leaveType: "casual",
    startDate: format(addDays(new Date(), 20), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 21), "yyyy-MM-dd"),
    reason: "Personal work",
    status: "rejected",
    appliedOn: format(addDays(new Date(), -1), "yyyy-MM-dd"),
    rejectionReason: "Overlaps with Dr. Smith's approved leave",
  },
];

const doctors = [
  { id: "D001", name: "Dr. Sarah Johnson", department: "Cardiology" },
  { id: "D002", name: "Dr. Michael Chen", department: "Orthopedics" },
  { id: "D003", name: "Dr. Emily Parker", department: "Pediatrics" },
  { id: "D004", name: "Dr. James Wilson", department: "General Medicine" },
  { id: "D005", name: "Dr. Lisa Anderson", department: "Dermatology" },
];

export function DoctorLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaves);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [newLeave, setNewLeave] = useState({
    doctorId: "",
    leaveType: "casual" as LeaveRequest["leaveType"],
    startDate: "",
    endDate: "",
    reason: "",
  });

  const stats = {
    pending: leaves.filter((l) => l.status === "pending").length,
    approved: leaves.filter((l) => l.status === "approved").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
    onLeaveToday: leaves.filter(
      (l) =>
        l.status === "approved" &&
        new Date(l.startDate) <= new Date() &&
        new Date(l.endDate) >= new Date()
    ).length,
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      leave.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || leave.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (leave: LeaveRequest) => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === leave.id ? { ...l, status: "approved" as const, approvedBy: "Admin" } : l
      )
    );
  };

  const handleReject = () => {
    if (!selectedLeave) return;
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === selectedLeave.id
          ? { ...l, status: "rejected" as const, rejectionReason }
          : l
      )
    );
    setShowRejectModal(false);
    setSelectedLeave(null);
    setRejectionReason("");
  };

  const handleAddLeave = () => {
    const doctor = doctors.find((d) => d.id === newLeave.doctorId);
    if (!doctor) return;

    const newRequest: LeaveRequest = {
      id: `L${String(leaves.length + 1).padStart(3, "0")}`,
      doctorId: newLeave.doctorId,
      doctorName: doctor.name,
      department: doctor.department,
      leaveType: newLeave.leaveType,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      reason: newLeave.reason,
      status: "pending",
      appliedOn: format(new Date(), "yyyy-MM-dd"),
    };

    setLeaves((prev) => [newRequest, ...prev]);
    setShowAddModal(false);
    setNewLeave({
      doctorId: "",
      leaveType: "casual",
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Leaves</h1>
          <p className="text-gray-500 mt-1">Manage leave requests and approvals</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Apply Leave
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarOff className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.onLeaveToday}</p>
              <p className="text-sm text-gray-500">On Leave Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by doctor name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeaves.map((leave) => {
                const days = differenceInDays(
                  new Date(leave.endDate),
                  new Date(leave.startDate)
                ) + 1;
                return (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                          {leave.doctorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{leave.doctorName}</p>
                          <p className="text-sm text-gray-500">{leave.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          leaveTypeColors[leave.leaveType]
                        }`}
                      >
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-900">
                            {format(new Date(leave.startDate), "MMM d")} -{" "}
                            {format(new Date(leave.endDate), "MMM d, yyyy")}
                          </p>
                          <p className="text-gray-500">
                            {days} day{days > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">{leave.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[leave.status]}>{leave.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {leave.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleApprove(leave)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setSelectedLeave(leave);
                              setShowRejectModal(true);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          {leave.status === "approved" ? `By ${leave.approvedBy}` : "-"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Leave Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Apply for Leave">
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <select
                value={newLeave.doctorId}
                onChange={(e) => setNewLeave({ ...newLeave, doctorId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select doctor...</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select
                value={newLeave.leaveType}
                onChange={(e) =>
                  setNewLeave({
                    ...newLeave,
                    leaveType: e.target.value as LeaveRequest["leaveType"],
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="casual">Casual Leave</option>
                <option value="medical">Medical Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="vacation">Vacation</option>
                <option value="conference">Conference/Training</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newLeave.startDate}
                  onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={newLeave.endDate}
                  onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={newLeave.reason}
                onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter reason for leave..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddLeave}
            disabled={
              !newLeave.doctorId ||
              !newLeave.startDate ||
              !newLeave.endDate ||
              !newLeave.reason
            }
          >
            Submit Request
          </Button>
        </ModalFooter>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedLeave(null);
          setRejectionReason("");
        }}
        title="Reject Leave Request"
      >
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide a reason for rejecting{" "}
              <span className="font-medium">{selectedLeave?.doctorName}'s</span> leave request.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter reason for rejection..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowRejectModal(false);
              setSelectedLeave(null);
              setRejectionReason("");
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={!rejectionReason}>
            Reject Request
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
