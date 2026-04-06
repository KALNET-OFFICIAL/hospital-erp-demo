// User & Auth Types
export type UserRole = "admin" | "doctor" | "reception" | "pharmacist";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

// Patient Types
export type Gender = "male" | "female" | "other";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gender: Gender;
  dob: string;
  bloodGroup?: BloodGroup;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt: string;
  updatedAt: string;
}

// Appointment Types
export type AppointmentStatus = "scheduled" | "waiting" | "in-consultation" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: "opd" | "follow-up" | "emergency";
  notes?: string;
  tokenNumber?: number;
  createdAt: string;
}

// IPD Types
export type AdmissionStatus = "admitted" | "discharged" | "transferred";
export type BedStatus = "available" | "occupied" | "maintenance" | "reserved";

export interface Ward {
  id: string;
  name: string;
  type: "general" | "private" | "icu" | "emergency";
  totalBeds: number;
  availableBeds: number;
}

export interface Bed {
  id: string;
  wardId: string;
  bedNumber: string;
  status: BedStatus;
  patientId?: string;
  patientName?: string;
}

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  wardId: string;
  wardName: string;
  bedId: string;
  bedNumber: string;
  admissionDate: string;
  dischargeDate?: string;
  status: AdmissionStatus;
  diagnosis: string;
  doctorId: string;
  doctorName: string;
}

// Billing Types
export type PaymentMethod = "cash" | "card" | "upi" | "insurance";
export type PaymentStatus = "pending" | "partial" | "paid" | "refunded";

export interface BillingItem {
  id: string;
  name: string;
  category: "consultation" | "procedure" | "medicine" | "lab" | "room" | "other";
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  type: "opd" | "ipd" | "pharmacy";
  items: BillingItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  paidAt?: string;
}

// Pharmacy Types
export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  unitPrice: number;
  stock: number;
  minStock: number;
  expiryDate: string;
  batchNumber: string;
}

// EMR Types
export interface EMRRecord {
  id: string;
  patientId: string;
  visitId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  symptoms: string[];
  diagnosis: string;
  prescription: PrescriptionItem[];
  notes?: string;
  attachments?: string[];
  labTests?: string[];
  advice?: string[];
  followUp?: string;
}

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// Staff Types
export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  specialization?: string;
  qualification?: string;
  joinDate: string;
  status: "active" | "inactive";
  workingHours?: WorkingHours[];
  consultationFee?: number;
}

export interface WorkingHours {
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  startTime: string;
  endTime: string;
  slotDuration: number; // in minutes
  isAvailable: boolean;
}

// Service Catalog Types
export type ServiceCategory = "consultation" | "procedure" | "lab" | "radiology" | "room" | "pharmacy" | "other";

export interface Service {
  id: string;
  name: string;
  code: string;
  category: ServiceCategory;
  departmentId: string;
  departmentName: string;
  basePrice: number;
  tax: number; // percentage
  isActive: boolean;
  description?: string;
  duration?: number; // in minutes for appointments
  createdAt: string;
  updatedAt: string;
}

// Department Types
export interface Department {
  id: string;
  name: string;
  code: string;
  type: "clinical" | "support" | "admin";
  headDoctorId?: string;
  headDoctorName?: string;
  headOfDepartment?: string;
  description?: string;
  consultationFee: number;
  isActive: boolean;
  createdAt: string;
}

// Supplier Types (Pharmacy)
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  gstNumber?: string;
  paymentTerms: string;
  isActive: boolean;
  createdAt: string;
}

// Purchase Order Types
export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "ordered" | "partial" | "received" | "cancelled";
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  receivedQuantity?: number;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: "create" | "update" | "delete" | "view" | "print";
  module: string;
  recordId: string;
  recordType: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// Document Types
export interface Document {
  id: string;
  patientId: string;
  patientName: string;
  type: "prescription" | "lab_report" | "discharge_summary" | "invoice" | "consent" | "other";
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  visitId?: string;
  tags?: string[];
  createdAt: string;
}

// Attender/Family Types (for IPD)
export interface Attender {
  id: string;
  admissionId: string;
  name: string;
  relationship: "spouse" | "parent" | "child" | "sibling" | "relative" | "friend" | "other";
  phone: string;
  alternatePhone?: string;
  address?: string;
  idProofType?: string;
  idProofNumber?: string;
  isPrimary: boolean;
}

// Patient Status Tags
export type PatientStatus = "stable" | "critical" | "recovering" | "under_observation" | "discharged";

// Refund Types
export interface Refund {
  id: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "processed" | "rejected";
  requestedBy: string;
  approvedBy?: string;
  processedDate?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  opdCount: number;
  ipdCount: number;
  todayRevenue: number;
  pendingBills: number;
  bedOccupancy: number;
  criticalAlerts: number;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: string;
  recipientRoles?: UserRole[];
  recipientUserIds?: string[];
  module?: string;
  relatedId?: string;
}

// Referral & Coordination Types
export type ReferralPriority = "routine" | "urgent" | "critical";
export type ReferralStatus = "requested" | "accepted" | "in-progress" | "completed" | "declined";

export interface Referral {
  id: string;
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
  priority: ReferralPriority;
  status: ReferralStatus;
  requestedByRole: UserRole;
  requestedAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

// Workflow / Handover Types
export type TaskStatus = "pending" | "in-progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface HandoverTask {
  id: string;
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  referralId?: string;
  title: string;
  description?: string;
  module: "appointments" | "opd" | "billing" | "pharmacy" | "referrals" | "documents";
  assignedRole: UserRole | "admin";
  assignedUserId?: string;
  createdByRole: UserRole;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string;
  createdAt: string;
  completedAt?: string;
}
