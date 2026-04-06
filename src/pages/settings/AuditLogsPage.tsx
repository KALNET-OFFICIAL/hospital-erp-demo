import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  User,
  Calendar,
  Clock,
  FileText,
  Edit2,
  Trash2,
  PlusCircle,
  Activity,
  Shield,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useAuditTrailStore } from "@/stores";
import { formatDate } from "@/lib/utils";
import type { AuditLog } from "@/types";

const actionConfig: Record<string, { label: string; variant: "primary" | "success" | "warning" | "danger"; icon: React.ReactNode }> = {
  create: { label: "Created", variant: "success", icon: <PlusCircle className="w-3 h-3" /> },
  update: { label: "Updated", variant: "warning", icon: <Edit2 className="w-3 h-3" /> },
  delete: { label: "Deleted", variant: "danger", icon: <Trash2 className="w-3 h-3" /> },
  view: { label: "Viewed", variant: "primary", icon: <Eye className="w-3 h-3" /> },
  login: { label: "Login", variant: "primary", icon: <User className="w-3 h-3" /> },
  logout: { label: "Logout", variant: "primary", icon: <User className="w-3 h-3" /> },
};

const moduleLabels: Record<string, string> = {
  patients: "Patients",
  appointments: "Appointments",
  billing: "Billing",
  pharmacy: "Pharmacy",
  inventory: "Inventory",
  emr: "EMR Records",
  staff: "Staff",
  settings: "Settings",
  referrals: "Referrals",
  tasks: "Tasks",
  documents: "Documents",
  auth: "Authentication",
};

export default function AuditLogsPage() {
  const { logs: auditLogs } = useAuditTrailStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recordId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recordType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = selectedAction === "all" || log.action === selectedAction;
    const matchesModule = selectedModule === "all" || log.module === selectedModule;
    return matchesSearch && matchesAction && matchesModule;
  });

  // Group logs by date
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, AuditLog[]>);

  const handleExport = () => {
    // In real app, this would export to CSV/PDF
    console.log("Exporting audit logs...");
  };

  // Stats
  const todayLogs = auditLogs.filter((log) => {
    const today = new Date().toDateString();
    return new Date(log.timestamp).toDateString() === today;
  }).length;

  const uniqueUsers = new Set(auditLogs.map((log) => log.userId)).size;
  const createActions = auditLogs.filter((log) => log.action === "create").length;
  const updateActions = auditLogs.filter((log) => log.action === "update").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Track all system activities and user actions</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Activity</p>
              <p className="text-2xl font-bold text-gray-900">{todayLogs}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-success-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueUsers}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
              <User className="w-5 h-5 text-warning-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Changes Made</p>
              <p className="text-2xl font-bold text-gray-900">{createActions + updateActions}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-600" />
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
                placeholder="Search by user, record ID, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-32"
          >
            <option value="all">All Actions</option>
            <option value="create">Created</option>
            <option value="update">Updated</option>
            <option value="delete">Deleted</option>
            <option value="view">Viewed</option>
          </Select>
          <Select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-40"
          >
            <option value="all">All Modules</option>
            <option value="patients">Patients</option>
            <option value="appointments">Appointments</option>
            <option value="billing">Billing</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="inventory">Inventory</option>
            <option value="emr">EMR Records</option>
            <option value="staff">Staff</option>
            <option value="settings">Settings</option>
            <option value="referrals">Referrals</option>
            <option value="tasks">Tasks</option>
            <option value="documents">Documents</option>
          </Select>
        </div>
      </Card>

      {/* Action Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "create", "update", "delete"].map((action) => (
          <button
            key={action}
            onClick={() => setSelectedAction(action)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedAction === action
                ? "bg-primary-100 text-primary-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {action === "all" ? "All Actions" : actionConfig[action]?.label || action}
            <span className="ml-2 text-xs">
              ({action === "all" ? filteredLogs.length : filteredLogs.filter((l) => l.action === action).length})
            </span>
          </button>
        ))}
      </div>

      {/* Audit Logs Timeline */}
      <div className="space-y-6">
        {Object.entries(groupedLogs).map(([date, logs]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">{date}</span>
              <span className="text-xs text-gray-400">({logs.length} events)</span>
            </div>
            <div className="space-y-3">
              {logs.map((log) => (
                <AuditLogCard key={log.id} log={log} onClick={() => setSelectedLog(log)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No audit logs found</p>
        </div>
      )}

      {/* Log Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Details"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Log ID</p>
                <p className="font-mono text-sm">{selectedLog.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Action</p>
                <Badge variant={actionConfig[selectedLog.action]?.variant || "primary"}>
                  {actionConfig[selectedLog.action]?.label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">User</p>
                <p className="font-medium">{selectedLog.userName}</p>
                <p className="text-xs text-gray-400">{selectedLog.userId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Module</p>
                <p className="font-medium">{moduleLabels[selectedLog.module] || selectedLog.module}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Record</p>
                <p className="font-medium">{selectedLog.recordType}</p>
                <p className="text-xs text-gray-400">{selectedLog.recordId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Timestamp</p>
                <p className="font-medium">{formatDate(selectedLog.timestamp)}</p>
                <p className="text-xs text-gray-400">
                  {new Date(selectedLog.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {selectedLog.changes && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Changes Made</p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {Object.entries(selectedLog.changes).map(([field, change]) => (
                    <div key={field} className="flex items-start gap-4 text-sm">
                      <span className="font-medium text-gray-700 min-w-24">{field}:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-danger-600 line-through">{(change as any).old}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-success-600">{(change as any).new}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedLog.ipAddress && (
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">IP Address</p>
                    <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                  </div>
                  {selectedLog.userAgent && (
                    <div>
                      <p className="text-sm text-gray-500">User Agent</p>
                      <p className="text-xs text-gray-600 truncate">{selectedLog.userAgent}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Audit Log Card Component
function AuditLogCard({ log, onClick }: { log: AuditLog; onClick: () => void }) {
  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            log.action === "create"
              ? "bg-success-100"
              : log.action === "update"
              ? "bg-warning-100"
              : log.action === "delete"
              ? "bg-danger-100"
              : "bg-primary-100"
          }`}
        >
          {actionConfig[log.action]?.icon || <Activity className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{log.userName}</span>
            <Badge variant={actionConfig[log.action]?.variant || "primary"} className="text-xs">
              {actionConfig[log.action]?.label}
            </Badge>
            <span className="text-gray-500">{log.recordType}</span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {log.recordId}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>
          {log.changes && (
            <div className="mt-2 text-xs text-gray-600">
              Changed: {Object.keys(log.changes).join(", ")}
            </div>
          )}
        </div>
        <Badge variant="primary" className="text-xs flex-shrink-0">
          {moduleLabels[log.module] || log.module}
        </Badge>
      </div>
    </Card>
  );
}
