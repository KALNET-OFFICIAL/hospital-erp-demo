import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Filter, ListTodo, PlayCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useAuthStore, useHospitalOpsStore } from "@/stores";
import type { HandoverTask, TaskStatus } from "@/types";
import { formatDate } from "@/lib/utils";

export function HandoverBoardPage() {
  const { user } = useAuthStore();
  const { tasks, updateTaskStatus } = useHospitalOpsStore();
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = statusFilter === "all" || task.status === statusFilter;
      const roleMatch =
        user?.role === "admin" ||
        task.assignedRole === user?.role ||
        (task.assignedUserId && task.assignedUserId === user?.id);
      return statusMatch && roleMatch;
    });
  }, [tasks, statusFilter, user]);

  const counts = {
    pending: visibleTasks.filter((task) => task.status === "pending").length,
    inProgress: visibleTasks.filter((task) => task.status === "in-progress").length,
    completed: visibleTasks.filter((task) => task.status === "completed").length,
  };

  const priorityVariant = (priority: HandoverTask["priority"]) => {
    if (priority === "critical") {
      return "danger";
    }
    if (priority === "high") {
      return "warning";
    }
    if (priority === "medium") {
      return "info";
    }
    return "default";
  };

  const statusVariant = (status: HandoverTask["status"]) => {
    if (status === "completed") {
      return "success";
    }
    if (status === "in-progress") {
      return "primary";
    }
    if (status === "cancelled") {
      return "danger";
    }
    return "warning";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Handover Board</h1>
        <p className="text-ink-muted">Digital task handover across reception, doctors, billing and pharmacy</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-ink-muted">Pending</p>
          <p className="text-2xl font-bold text-warning-700">{counts.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-ink-muted">In Progress</p>
          <p className="text-2xl font-bold text-primary-700">{counts.inProgress}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-ink-muted">Completed</p>
          <p className="text-2xl font-bold text-success-700">{counts.completed}</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 text-ink-muted">
            <Filter className="h-4 w-4" />
            Task Filter
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | TaskStatus)}
            options={[
              { value: "all", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "in-progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
            className="max-w-48"
          />
        </div>
      </Card>

      <div className="space-y-3">
        {visibleTasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink">{task.title}</p>
                  <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
                  <Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge>
                </div>
                <p className="text-sm text-ink-muted">{task.description}</p>
                <p className="text-xs text-ink-muted">
                  {task.patientName ? `${task.patientName} • ` : ""}
                  Assigned: {task.assignedRole}
                  {task.dueAt ? ` • Due ${formatDate(task.dueAt)}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {task.status === "pending" && (
                  <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, "in-progress")}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start
                  </Button>
                )}
                {task.status !== "completed" && task.status !== "cancelled" && (
                  <Button size="sm" onClick={() => updateTaskStatus(task.id, "completed")}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                )}
                {task.status !== "completed" && task.status !== "cancelled" && (
                  <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, "cancelled")}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {visibleTasks.length === 0 && (
        <Card className="p-10 text-center">
          <ListTodo className="mx-auto h-10 w-10 text-ink-muted" />
          <p className="mt-3 text-ink-muted">No tasks for the selected filter.</p>
        </Card>
      )}
    </div>
  );
}
