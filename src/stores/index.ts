import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole, Notification, Appointment, Referral, AuditLog, HandoverTask } from "@/types";

// Initial mock handover tasks
const initialTasks: HandoverTask[] = [
  {
    id: "TASK001",
    patientId: "PT001",
    patientName: "Rajesh Kumar",
    appointmentId: "APT001",
    title: "Patient Check-in for Appointment",
    description: "Verify patient documents and complete registration formalities",
    module: "appointments",
    assignedRole: "reception",
    createdByRole: "admin",
    status: "pending",
    priority: "medium",
    dueAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TASK002",
    patientId: "PT002",
    patientName: "Priya Sharma",
    appointmentId: "APT002",
    title: "Consultation Ready - Room 102",
    description: "Patient is waiting for Dr. Kavita Rao consultation",
    module: "opd",
    assignedRole: "doctor",
    createdByRole: "reception",
    status: "pending",
    priority: "high",
    dueAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TASK003",
    patientId: "PT003",
    patientName: "Amit Patel",
    title: "Generate Invoice - Consultation Complete",
    description: "Dr. Anil Mehta completed consultation. Generate OPD invoice.",
    module: "billing",
    assignedRole: "reception",
    createdByRole: "doctor",
    status: "in-progress",
    priority: "medium",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "TASK004",
    patientId: "PT004",
    patientName: "Sunita Reddy",
    title: "Dispense Prescription Medicines",
    description: "Prescription from Dr. Suresh Nair - Pain killers and supplements",
    module: "pharmacy",
    assignedRole: "pharmacist",
    createdByRole: "doctor",
    status: "pending",
    priority: "high",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "TASK005",
    patientId: "PT005",
    patientName: "Mohammed Ali",
    title: "Schedule Follow-up Appointment",
    description: "Patient requires follow-up after 1 week with Dr. Anil Mehta",
    module: "appointments",
    assignedRole: "reception",
    createdByRole: "doctor",
    status: "pending",
    priority: "low",
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: "TASK006",
    patientId: "PT006",
    patientName: "Anita Desai",
    title: "Prepare Lab Reports",
    description: "Blood test results ready for review - CBC and Lipid Profile",
    module: "documents",
    assignedRole: "doctor",
    createdByRole: "reception",
    status: "completed",
    priority: "medium",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TASK007",
    patientId: "PT007",
    patientName: "Vikram Joshi",
    title: "Insurance Claim Processing",
    description: "Process TPA claim for cardiology consultation",
    module: "billing",
    assignedRole: "reception",
    createdByRole: "admin",
    status: "in-progress",
    priority: "high",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TASK008",
    patientId: "PT008",
    patientName: "Lakshmi Iyer",
    referralId: "REF001",
    title: "External Referral - Cardiology Specialist",
    description: "Refer patient to City Heart Hospital for advanced cardiac evaluation",
    module: "referrals",
    assignedRole: "reception",
    createdByRole: "doctor",
    status: "pending",
    priority: "critical",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "TASK009",
    patientId: "PT009",
    patientName: "Ramesh Agarwal",
    title: "IPD Discharge Processing",
    description: "Prepare final bill and discharge summary for patient",
    module: "billing",
    assignedRole: "reception",
    createdByRole: "doctor",
    status: "pending",
    priority: "high",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "TASK010",
    patientId: "PT010",
    patientName: "Fatima Khan",
    title: "Emergency Medication Alert",
    description: "Urgent: Dispense emergency prescription for pediatric patient",
    module: "pharmacy",
    assignedRole: "pharmacist",
    createdByRole: "doctor",
    status: "pending",
    priority: "critical",
    dueAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];
import { notifications as mockNotifications, appointments as mockAppointments, auditLogs as mockAuditLogs } from "@/lib/mock-data";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const mockUsers: Record<UserRole, User> = {
  admin: {
    id: "ADM001",
    name: "Admin User",
    email: "admin@kalnet.com",
    role: "admin",
  },
  doctor: {
    id: "DOC001",
    name: "Dr. Anil Mehta",
    email: "anil.mehta@kalnet.com",
    role: "doctor",
    department: "General Medicine",
  },
  reception: {
    id: "REC001",
    name: "Meera Singh",
    email: "meera.singh@kalnet.com",
    role: "reception",
  },
  pharmacist: {
    id: "PH001",
    name: "Rakesh Gupta",
    email: "rakesh.gupta@kalnet.com",
    role: "pharmacist",
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (role: UserRole) => {
    set({
      user: mockUsers[role],
      isAuthenticated: true,
    });
  },
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter((notification) => !notification.read).length,
      markAsRead: (id: string) => {
        set((state) => {
          const notifications = state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          );
          return {
            notifications,
            unreadCount: notifications.filter((notification) => !notification.read).length,
          };
        });
      },
      markAllAsRead: () => {
        set((state) => {
          const notifications = state.notifications.map((notification) => ({ ...notification, read: true }));
          return {
            notifications,
            unreadCount: 0,
          };
        });
      },
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `NOT${Date.now()}`,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
    }),
    {
      name: "hos-notifications-store",
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);

interface SidebarState {
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
}));

interface AppointmentCreateInput {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  type: "opd" | "follow-up" | "emergency";
  notes?: string;
}

interface ReferralCreateInput {
  patientId: string;
  patientName: string;
  fromDoctorId?: string;
  fromDoctorName: string;
  fromDepartment?: string;
  toType: "internal" | "external";
  toDoctorId?: string;
  toDoctorName?: string;
  toSpecialty?: string;
  toHospitalName?: string;
  reason: string;
  notes?: string;
  attachments?: string[];
  priority: "routine" | "urgent" | "critical";
  requestedByRole: UserRole;
}

interface HandoverTaskCreateInput {
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  referralId?: string;
  title: string;
  description?: string;
  module: HandoverTask["module"];
  assignedRole: HandoverTask["assignedRole"];
  assignedUserId?: string;
  createdByRole: UserRole;
  priority: HandoverTask["priority"];
  dueAt?: string;
}

interface HospitalOpsState {
  appointments: Appointment[];
  referrals: Referral[];
  tasks: HandoverTask[];
  addAppointment: (input: AppointmentCreateInput) => Appointment;
  updateAppointmentStatus: (appointmentId: string, status: Appointment["status"]) => void;
  createReferral: (input: ReferralCreateInput) => Referral;
  updateReferralStatus: (referralId: string, status: Referral["status"]) => void;
  createTask: (input: HandoverTaskCreateInput) => HandoverTask;
  updateTaskStatus: (taskId: string, status: HandoverTask["status"]) => void;
}

export const useHospitalOpsStore = create<HospitalOpsState>()(
  persist(
    (set, get) => ({
      appointments: mockAppointments,
      referrals: [],
      tasks: initialTasks,

      addAppointment: (input) => {
        const sameDayAppointments = get().appointments.filter(
          (appointment) => appointment.date === input.date && appointment.doctorId === input.doctorId
        );
        const nextToken =
          sameDayAppointments.length > 0
            ? Math.max(...sameDayAppointments.map((appointment) => appointment.tokenNumber ?? 0)) + 1
            : 1;

        const appointment: Appointment = {
          id: `APT${Date.now()}`,
          patientId: input.patientId,
          patientName: input.patientName,
          doctorId: input.doctorId,
          doctorName: input.doctorName,
          department: input.department,
          date: input.date,
          time: input.time,
          status: "scheduled",
          type: input.type,
          notes: input.notes,
          tokenNumber: nextToken,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          appointments: [...state.appointments, appointment].sort((a, b) => {
            const dateSort = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateSort !== 0) {
              return dateSort;
            }
            return a.time.localeCompare(b.time);
          }),
        }));

        useAuditTrailStore.getState().logAction({
          userId: "SYSTEM",
          userName: "System",
          action: "create",
          module: "appointments",
          recordId: appointment.id,
          recordType: "Appointment",
        });

        get().createTask({
          patientId: appointment.patientId,
          patientName: appointment.patientName,
          appointmentId: appointment.id,
          title: `Consult ${appointment.patientName}`,
          description: `Patient assigned by front desk for ${appointment.time}`,
          module: "appointments",
          assignedRole: "doctor",
          assignedUserId: appointment.doctorId,
          createdByRole: "reception",
          priority: input.type === "emergency" ? "critical" : "medium",
          dueAt: `${appointment.date}T${appointment.time}:00`,
        });

        return appointment;
      },

      updateAppointmentStatus: (appointmentId, status) => {
        const previous = get().appointments.find((appointment) => appointment.id === appointmentId);
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === appointmentId ? { ...appointment, status } : appointment
          ),
        }));
        if (previous && previous.status !== status) {
          useAuditTrailStore.getState().logAction({
            userId: "SYSTEM",
            userName: "System",
            action: "update",
            module: "appointments",
            recordId: appointmentId,
            recordType: "Appointment",
            changes: {
              status: { old: previous.status, new: status },
            },
          });
        }

        if (status === "completed" && previous) {
          const doctorTask = get().tasks.find(
            (task) =>
              task.appointmentId === previous.id &&
              task.module === "appointments" &&
              task.assignedRole === "doctor" &&
              task.status !== "completed"
          );
          if (doctorTask) {
            get().updateTaskStatus(doctorTask.id, "completed");
          }
          get().createTask({
            patientId: previous.patientId,
            patientName: previous.patientName,
            appointmentId: previous.id,
            title: `Generate billing for ${previous.patientName}`,
            description: "Consultation completed. Billing draft required.",
            module: "billing",
            assignedRole: "reception",
            createdByRole: "doctor",
            priority: "high",
          });
          get().createTask({
            patientId: previous.patientId,
            patientName: previous.patientName,
            appointmentId: previous.id,
            title: `Prepare pharmacy fulfillment for ${previous.patientName}`,
            description: "Review prescription and prepare dispensing flow.",
            module: "pharmacy",
            assignedRole: "pharmacist",
            createdByRole: "doctor",
            priority: "medium",
          });
          get().createTask({
            patientId: previous.patientId,
            patientName: previous.patientName,
            appointmentId: previous.id,
            title: `Schedule follow-up for ${previous.patientName}`,
            description: "Front desk to confirm follow-up slot and patient instructions.",
            module: "appointments",
            assignedRole: "reception",
            createdByRole: "doctor",
            priority: "medium",
          });
        }
      },

      createReferral: (input) => {
        const referral: Referral = {
          id: `REF${Date.now()}`,
          patientId: input.patientId,
          patientName: input.patientName,
          fromDoctorId: input.fromDoctorId,
          fromDoctorName: input.fromDoctorName,
          fromDepartment: input.fromDepartment,
          toType: input.toType,
          toDoctorId: input.toDoctorId,
          toDoctorName: input.toDoctorName,
          toSpecialty: input.toSpecialty,
          toHospitalName: input.toHospitalName,
          reason: input.reason,
          notes: input.notes,
          attachments: input.attachments,
          priority: input.priority,
          status: "requested",
          requestedByRole: input.requestedByRole,
          requestedAt: new Date().toISOString(),
        };

        set((state) => ({
          referrals: [referral, ...state.referrals],
        }));

        useAuditTrailStore.getState().logAction({
          userId: "SYSTEM",
          userName: "System",
          action: "create",
          module: "referrals",
          recordId: referral.id,
          recordType: "Referral",
        });

        get().createTask({
          patientId: referral.patientId,
          patientName: referral.patientName,
          referralId: referral.id,
          title: `Process referral packet for ${referral.patientName}`,
          description:
            referral.toType === "internal"
              ? `Coordinate with ${referral.toDoctorName ?? "target doctor"}`
              : `Prepare transfer documents for ${referral.toHospitalName ?? "external specialist"}`,
          module: "referrals",
          assignedRole: referral.toType === "internal" ? "doctor" : "reception",
          assignedUserId: referral.toDoctorId,
          createdByRole: input.requestedByRole,
          priority: referral.priority === "critical" ? "critical" : "high",
        });

        if (referral.attachments && referral.attachments.length > 0) {
          get().createTask({
            patientId: referral.patientId,
            patientName: referral.patientName,
            referralId: referral.id,
            title: `Upload referral documents (${referral.attachments.length})`,
            description: "Attach referral files to patient document center.",
            module: "documents",
            assignedRole: "reception",
            createdByRole: input.requestedByRole,
            priority: "medium",
          });
        }

        return referral;
      },

      updateReferralStatus: (referralId, status) => {
        const previous = get().referrals.find((referral) => referral.id === referralId);
        set((state) => ({
          referrals: state.referrals.map((referral) => {
            if (referral.id !== referralId) {
              return referral;
            }

            return {
              ...referral,
              status,
              acceptedAt: status === "accepted" ? new Date().toISOString() : referral.acceptedAt,
              completedAt: status === "completed" ? new Date().toISOString() : referral.completedAt,
            };
          }),
        }));
        if (previous && previous.status !== status) {
          useAuditTrailStore.getState().logAction({
            userId: "SYSTEM",
            userName: "System",
            action: "update",
            module: "referrals",
            recordId: referralId,
            recordType: "Referral",
            changes: {
              status: { old: previous.status, new: status },
            },
          });
        }

        if (status === "completed") {
          const relatedTask = get().tasks.find((task) => task.referralId === referralId && task.module === "referrals");
          if (relatedTask) {
            get().updateTaskStatus(relatedTask.id, "completed");
          }
        }
      },

      createTask: (input) => {
        const task: HandoverTask = {
          id: `TSK${Date.now()}${Math.floor(Math.random() * 1000)}`,
          patientId: input.patientId,
          patientName: input.patientName,
          appointmentId: input.appointmentId,
          referralId: input.referralId,
          title: input.title,
          description: input.description,
          module: input.module,
          assignedRole: input.assignedRole,
          assignedUserId: input.assignedUserId,
          createdByRole: input.createdByRole,
          status: "pending",
          priority: input.priority,
          dueAt: input.dueAt,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          tasks: [task, ...state.tasks],
        }));

        useAuditTrailStore.getState().logAction({
          userId: "SYSTEM",
          userName: "System",
          action: "create",
          module: "tasks",
          recordId: task.id,
          recordType: "Handover Task",
        });

        return task;
      },

      updateTaskStatus: (taskId, status) => {
        const previous = get().tasks.find((task) => task.id === taskId);
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status,
                  completedAt: status === "completed" ? new Date().toISOString() : task.completedAt,
                }
              : task
          ),
        }));

        if (previous && previous.status !== status) {
          useAuditTrailStore.getState().logAction({
            userId: "SYSTEM",
            userName: "System",
            action: "update",
            module: "tasks",
            recordId: taskId,
            recordType: "Handover Task",
            changes: {
              status: { old: previous.status, new: status },
            },
          });
        }
      },
    }),
    {
      name: "hos-operations-store",
      partialize: (state) => ({
        appointments: state.appointments,
        referrals: state.referrals,
        tasks: state.tasks,
      }),
      merge: (persistedState, currentState) => {
        const typedPersisted = persistedState as Partial<HospitalOpsState>;
        const persistedAppointments = Array.isArray(typedPersisted?.appointments)
          ? typedPersisted.appointments
          : [];

        // Keep baseline mock schedule (including existing/follow-up visits) while retaining user-added updates.
        const appointmentsById = new Map(
          currentState.appointments.map((appointment) => [appointment.id, appointment])
        );
        persistedAppointments.forEach((appointment) => {
          appointmentsById.set(appointment.id, appointment);
        });

        return {
          ...currentState,
          ...typedPersisted,
          appointments: Array.from(appointmentsById.values()).sort((a, b) => {
            const dateSort = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateSort !== 0) {
              return dateSort;
            }
            return a.time.localeCompare(b.time);
          }),
        } as HospitalOpsState;
      },
    }
  )
);

interface AuditTrailState {
  logs: AuditLog[];
  logAction: (entry: Omit<AuditLog, "id" | "timestamp">) => void;
  clearLogs: () => void;
}

export const useAuditTrailStore = create<AuditTrailState>()(
  persist(
    (set) => ({
      logs: mockAuditLogs,
      logAction: (entry) => {
        const log: AuditLog = {
          ...entry,
          id: `AUD${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ logs: [log, ...state.logs] }));
      },
      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: "hos-audit-store",
      partialize: (state) => ({
        logs: state.logs,
      }),
    }
  )
);

// Theme Store for Dark Mode
type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        const root = document.documentElement;
        if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      },
    }),
    {
      name: "hos-theme-store",
      onRehydrateStorage: () => (state) => {
        // Apply theme on page load
        if (state) {
          const root = document.documentElement;
          if (state.theme === "dark" || (state.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }
        }
      },
    }
  )
);
