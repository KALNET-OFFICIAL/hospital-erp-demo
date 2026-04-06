import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { LoginPage } from "@/pages/auth";
import { DashboardPage } from "@/pages/dashboard";
import {
  PatientListPage,
  PatientCreatePage,
  PatientProfilePage,
  PatientEditPage,
} from "@/pages/patients";
import {
  AppointmentCalendarPage,
  AppointmentCreatePage,
  AppointmentQueuePage,
  AppointmentDetailPage,
} from "@/pages/appointments";
import { OPDQueuePage, OPDConsultationPage, OPDEMRRecordsPage } from "@/pages/opd";
import { IPDAdmissionsPage, IPDBedManagementPage, IPDDischargePage, IPDAttendersPage, TreatmentNotesPage } from "@/pages/ipd";
import { BillingListPage, BillingCreatePage } from "@/pages/billing";
import { PharmacyInventoryPage, PharmacyPOSPage, PharmacyMedicinesPage, PharmacyLowStockPage, PharmacyExpiryPage, StockIntakePage } from "@/pages/pharmacy";
import { StaffListPage, StaffCreatePage, StaffEditPage, DoctorLeavesPage } from "@/pages/staff";
import { ReportsPage, OPDReportsPage, IPDReportsPage, PharmacyReportsPage } from "@/pages/reports";
import { SettingsPage } from "@/pages/settings";
import { ReferralsPage } from "@/pages/referrals";
import { HandoverBoardPage } from "@/pages/operations";

import ServiceCatalogPage from "@/pages/billing/ServiceCatalogPage";
import RefundsPage from "@/pages/billing/RefundsPage";
import SuppliersPage from "@/pages/pharmacy/SuppliersPage";
import PurchaseOrdersPage from "@/pages/pharmacy/PurchaseOrdersPage";
import DepartmentConfigPage from "@/pages/settings/DepartmentConfigPage";
import AuditLogsPage from "@/pages/settings/AuditLogsPage";
import ServicesAndPricingPage from "@/pages/settings/ServicesAndPricingPage";
import BedAndWardConfigPage from "@/pages/settings/BedAndWardConfigPage";
import DocumentsPage from "@/pages/documents/DocumentsPage";
import PatientTimelinePage from "@/pages/patients/PatientTimelinePage";
import DoctorAvailabilityPage from "@/pages/staff/DoctorAvailabilityPage";
import { RolesAndPermissionsPage } from "@/pages/staff/RolesAndPermissionsPage";
import { DoctorSchedulesPage } from "@/pages/staff/DoctorSchedulesPage";
import { ComingSoonPage } from "@/pages/common/ComingSoonPage";
import { AppointmentListPage } from "@/pages/appointments/AppointmentListPage";
import { BillingPaymentsPage } from "@/pages/billing/BillingPaymentsPage";
import { BillingInvoiceDetailPage } from "@/pages/billing/BillingInvoiceDetailPage";
import { PatientTimelineIndexPage } from "@/pages/patients/PatientTimelineIndexPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />

          <Route path="/patients" element={<PatientListPage />} />
          <Route path="/patients/new" element={<PatientCreatePage />} />
          <Route path="/patients/timeline" element={<PatientTimelineIndexPage />} />
          <Route path="/patients/:patientId" element={<PatientProfilePage />} />
          <Route path="/patients/:patientId/edit" element={<PatientEditPage />} />
          <Route path="/patients/:patientId/timeline" element={<PatientTimelinePage />} />

          <Route path="/appointments" element={<AppointmentCalendarPage />} />
          <Route path="/appointments/new" element={<AppointmentCreatePage />} />
          <Route path="/appointments/list" element={<AppointmentListPage />} />
          <Route path="/appointments/queue" element={<AppointmentQueuePage />} />
          <Route path="/appointments/:appointmentId" element={<AppointmentDetailPage />} />

          <Route path="/opd" element={<OPDQueuePage />} />
          <Route path="/opd/queue" element={<Navigate to="/opd" replace />} />
          <Route path="/opd/consultation/:visitId" element={<OPDConsultationPage />} />
          <Route path="/opd/records" element={<OPDEMRRecordsPage />} />
          <Route path="/opd/emr" element={<OPDEMRRecordsPage />} />

          <Route path="/ipd" element={<IPDAdmissionsPage />} />
          <Route path="/ipd/beds" element={<IPDBedManagementPage />} />
          <Route path="/ipd/attenders" element={<IPDAttendersPage />} />
          <Route path="/ipd/admissions/new" element={<IPDAdmissionsPage />} />
          <Route path="/ipd/discharge" element={<IPDDischargePage />} />
          <Route path="/ipd/notes" element={<TreatmentNotesPage />} />

          <Route path="/billing" element={<BillingListPage />} />
          <Route path="/billing/new" element={<BillingCreatePage />} />
          <Route path="/billing/services" element={<ServiceCatalogPage />} />
          <Route path="/billing/refunds" element={<RefundsPage />} />
          <Route path="/billing/payments" element={<BillingPaymentsPage />} />
          <Route path="/billing/:invoiceId" element={<BillingInvoiceDetailPage />} />

          <Route path="/pharmacy" element={<PharmacyInventoryPage />} />
          <Route path="/pharmacy/pos" element={<PharmacyPOSPage />} />
          <Route path="/pharmacy/suppliers" element={<SuppliersPage />} />
          <Route path="/pharmacy/purchases" element={<PurchaseOrdersPage />} />
          <Route path="/pharmacy/medicines" element={<PharmacyMedicinesPage />} />
          <Route path="/pharmacy/medicines/new" element={<PharmacyMedicinesPage />} />
          <Route path="/pharmacy/low-stock" element={<PharmacyLowStockPage />} />
          <Route path="/pharmacy/expiry" element={<PharmacyExpiryPage />} />
          <Route path="/pharmacy/purchases/new" element={<StockIntakePage />} />
          <Route path="/pharmacy/suppliers/new" element={<SuppliersPage />} />

          <Route path="/staff" element={<StaffListPage />} />
          <Route path="/staff/new" element={<StaffCreatePage />} />
          <Route path="/staff/:staffId/edit" element={<StaffEditPage />} />
          <Route path="/staff/availability" element={<DoctorAvailabilityPage />} />
          <Route path="/staff/roles" element={<RolesAndPermissionsPage />} />
          <Route path="/staff/schedules" element={<DoctorSchedulesPage />} />
          <Route path="/staff/leaves" element={<DoctorLeavesPage />} />

          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/opd" element={<OPDReportsPage />} />
          <Route path="/reports/ipd" element={<IPDReportsPage />} />
          <Route path="/reports/pharmacy" element={<PharmacyReportsPage />} />

          <Route path="/referrals" element={<ReferralsPage />} />
          <Route path="/handover" element={<HandoverBoardPage />} />

          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/lab" element={<DocumentsPage />} />
          <Route path="/documents/upload" element={<DocumentsPage />} />

          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/departments" element={<DepartmentConfigPage />} />
          <Route path="/settings/audit-logs" element={<AuditLogsPage />} />
          <Route path="/settings/audit" element={<Navigate to="/settings/audit-logs" replace />} />
          <Route path="/settings/services" element={<ServicesAndPricingPage />} />
          <Route path="/settings/beds" element={<BedAndWardConfigPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
