import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';

// Pages
import InstitutionalLandingPage from './pages/InstitutionalLandingPage';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import ProfilePage from './pages/student/ProfilePage';
import FeesPage from './pages/student/FeesPage';
import AttendancePage from './pages/student/AttendancePage';
import ExamsPage from './pages/student/ExamsPage';
import HostelPage from './pages/student/HostelPage';
import NoDuesPage from './pages/student/NoDuesPage';
import GatePassPage from './pages/student/GatePassPage';
import NotificationsPage from './pages/student/NotificationsPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import StudentsListPage from './pages/admin/StudentsListPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import PendingWorkflowsPage from './pages/admin/PendingWorkflowsPage';

// Faculty
import FacultyDashboard from './pages/faculty/FacultyDashboard';

// Warden
import WardenDashboard from './pages/warden/WardenDashboard';
import WardenGatePassPage from './pages/warden/WardenGatePassPage';
import NoDuesVerifyPage from './pages/warden/NoDuesVerifyPage';

// Workflow Pages
import ApplicationsPage from './pages/student/ApplicationsPage';
import MyApplicationsPage from './pages/student/MyApplicationsPage';
import ApplicationsInboxPage from './pages/admin/ApplicationsInboxPage';
import WorkflowConfigPage from './pages/admin/WorkflowConfigPage';

// Accounts
import AccountsDashboard from './pages/accounts/AccountsDashboard';


// =============================================
// PROTECTED ROUTE
// =============================================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span>Loading GECM ACADEMICS...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <AppLayout>{children}</AppLayout>;
};

// =============================================
// ROOT REDIRECT — sends to correct dashboard
// =============================================
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <span>Loading GECM ACADEMICS...</span>
    </div>
  );

  if (!user) return <Navigate to="/" replace />;

  const ROLE_HOME = {
    student: '/student/dashboard',
    faculty: '/faculty/dashboard',
    hod: '/faculty/dashboard',
    warden: '/warden/dashboard',
    accounts: '/accounts/dashboard',
    admin: '/admin/dashboard',
  };

  return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
};

// =============================================
// APP ROUTES
// =============================================
const AppRoutes = () => (
  <Routes>
    {/* Public Routes — All login handled via institutional modal */}
    <Route path="/login" element={<InstitutionalLandingPage initialOpenLogin={true} />} />
    <Route path="/" element={<InstitutionalLandingPage />} />

    {/* ── STUDENT ── */}
    <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
    <Route path="/student/applications" element={<ProtectedRoute allowedRoles={['student']}><ApplicationsPage /></ProtectedRoute>} />
    <Route path="/student/my-applications" element={<ProtectedRoute allowedRoles={['student']}><MyApplicationsPage /></ProtectedRoute>} />
    <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><ProfilePage /></ProtectedRoute>} />
    <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><FeesPage /></ProtectedRoute>} />
    <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><AttendancePage /></ProtectedRoute>} />
    <Route path="/student/exams" element={<ProtectedRoute allowedRoles={['student']}><ExamsPage /></ProtectedRoute>} />
    <Route path="/student/results" element={<ProtectedRoute allowedRoles={['student']}><ExamsPage /></ProtectedRoute>} />
    <Route path="/student/hostel" element={<ProtectedRoute allowedRoles={['student']}><HostelPage /></ProtectedRoute>} />
    <Route path="/student/nodues" element={<ProtectedRoute allowedRoles={['student']}><NoDuesPage /></ProtectedRoute>} />
    <Route path="/student/gatepass" element={<ProtectedRoute allowedRoles={['student']}><GatePassPage /></ProtectedRoute>} />
    <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><NotificationsPage /></ProtectedRoute>} />

    {/* ── FACULTY / HOD ── */}
    <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><FacultyDashboard /></ProtectedRoute>} />
    <Route path="/faculty/applications-inbox" element={<ProtectedRoute allowedRoles={['faculty']}><ApplicationsInboxPage /></ProtectedRoute>} />
    <Route path="/faculty/students" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><StudentsListPage /></ProtectedRoute>} />
    <Route path="/faculty/courses" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><FacultyDashboard /></ProtectedRoute>} />
    <Route path="/faculty/attendance" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><FacultyDashboard /></ProtectedRoute>} />
    <Route path="/faculty/results" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><FacultyDashboard /></ProtectedRoute>} />
    <Route path="/hod/applications-inbox" element={<ProtectedRoute allowedRoles={['hod']}><ApplicationsInboxPage /></ProtectedRoute>} />
    <Route path="/hod/department" element={<ProtectedRoute allowedRoles={['hod']}><DepartmentsPage /></ProtectedRoute>} />
    <Route path="/hod/students" element={<ProtectedRoute allowedRoles={['hod']}><StudentsListPage /></ProtectedRoute>} />
    <Route path="/hod/approvals" element={<ProtectedRoute allowedRoles={['hod']}><PendingWorkflowsPage /></ProtectedRoute>} />

    {/* ── WARDEN ── */}
    <Route path="/warden/dashboard" element={<ProtectedRoute allowedRoles={['warden']}><WardenDashboard /></ProtectedRoute>} />
    <Route path="/warden/applications-inbox" element={<ProtectedRoute allowedRoles={['warden']}><ApplicationsInboxPage /></ProtectedRoute>} />
    <Route path="/warden/gatepass" element={<ProtectedRoute allowedRoles={['warden', 'admin']}><WardenGatePassPage /></ProtectedRoute>} />
    <Route path="/warden/nodues" element={<ProtectedRoute allowedRoles={['warden', 'admin']}><NoDuesVerifyPage role="warden" /></ProtectedRoute>} />
    <Route path="/warden/hostel" element={<ProtectedRoute allowedRoles={['warden']}><WardenDashboard /></ProtectedRoute>} />

    {/* ── ACCOUNTS ── */}
    <Route path="/accounts/dashboard" element={<ProtectedRoute allowedRoles={['accounts']}><AccountsDashboard /></ProtectedRoute>} />
    <Route path="/accounts/applications-inbox" element={<ProtectedRoute allowedRoles={['accounts']}><ApplicationsInboxPage /></ProtectedRoute>} />
    <Route path="/accounts/fees" element={<ProtectedRoute allowedRoles={['accounts']}><AccountsDashboard /></ProtectedRoute>} />
    <Route path="/accounts/payments" element={<ProtectedRoute allowedRoles={['accounts']}><AccountsDashboard /></ProtectedRoute>} />
    <Route path="/accounts/nodues" element={<ProtectedRoute allowedRoles={['accounts', 'admin']}><NoDuesVerifyPage role="accounts" /></ProtectedRoute>} />

    {/* ── ADMIN ── */}
    <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/applications-inbox" element={<ProtectedRoute allowedRoles={['admin']}><ApplicationsInboxPage /></ProtectedRoute>} />
    <Route path="/admin/workflow-config" element={<ProtectedRoute allowedRoles={['admin']}><WorkflowConfigPage /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
    <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin', 'hod']}><StudentsListPage /></ProtectedRoute>} />
    <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
    <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['admin', 'hod']}><DepartmentsPage /></ProtectedRoute>} />
    <Route path="/admin/nodues" element={<ProtectedRoute allowedRoles={['admin']}><NoDuesVerifyPage role="admin" /></ProtectedRoute>} />
    <Route path="/admin/gatepass" element={<ProtectedRoute allowedRoles={['admin']}><WardenGatePassPage /></ProtectedRoute>} />
    <Route path="/admin/fees" element={<ProtectedRoute allowedRoles={['admin', 'accounts']}><AccountsDashboard /></ProtectedRoute>} />
    <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogsPage /></ProtectedRoute>} />
    <Route path="/admin/workflows" element={<ProtectedRoute allowedRoles={['admin', 'hod']}><PendingWorkflowsPage /></ProtectedRoute>} />


    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

// =============================================
// MAIN APP
// =============================================
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e1e2a',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontSize: '13.5px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </Router>
    </AuthProvider>
  );
}
