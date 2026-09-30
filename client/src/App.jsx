import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';

// Public & Institutional Pages
import InstitutionalLandingPage from './pages/InstitutionalLandingPage';
import PublicNoticesPage from './pages/PublicNoticesPage';
import PublicServicesPage from './pages/PublicServicesPage';
import PublicAcademicsPage from './pages/PublicAcademicsPage';
import PublicAboutPage from './pages/PublicAboutPage';
import PublicVerifyPage from './pages/PublicVerifyPage';
import DepartmentsListPage from './pages/departments/DepartmentsListPage';
import DepartmentDetailPage from './pages/departments/DepartmentDetailPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ProfilePage from './pages/student/ProfilePage';
import CourseRegistrationPage from './pages/student/CourseRegistrationPage';
import AttendancePage from './pages/student/AttendancePage';
import ExamsPage from './pages/student/ExamsPage';
import StudentResultsPage from './pages/student/StudentResultsPage';
import FeesPage from './pages/student/FeesPage';
import GatePassPage from './pages/student/GatePassPage';
import NoDuesPage from './pages/student/NoDuesPage';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';
import StudentTimetablePage from './pages/student/StudentTimetablePage';
import HostelPage from './pages/student/HostelPage';
import ApplicationsPage from './pages/student/ApplicationsPage';
import MyApplicationsPage from './pages/student/MyApplicationsPage';
import NotificationsPage from './pages/student/NotificationsPage';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyProfilePage from './pages/faculty/FacultyProfilePage';
import FacultyAttendancePage from './pages/faculty/FacultyAttendancePage';
import FacultyCoursesPage from './pages/faculty/FacultyCoursesPage';
import FacultyTimetablePage from './pages/faculty/FacultyTimetablePage';
import FacultyExaminationsPage from './pages/faculty/FacultyExaminationsPage';
import FacultyAssignmentsPage from './pages/faculty/FacultyAssignmentsPage';
import FacultyNoticesPage from './pages/faculty/FacultyNoticesPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import StudentsListPage from './pages/admin/StudentsListPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import PendingWorkflowsPage from './pages/admin/PendingWorkflowsPage';
import ApplicationsInboxPage from './pages/admin/ApplicationsInboxPage';
import WorkflowConfigPage from './pages/admin/WorkflowConfigPage';
import AdminAccountsPage from './pages/admin/AdminAccountsPage';
import AdminExaminationPage from './pages/admin/AdminExaminationPage';
import AdminLibraryPage from './pages/admin/AdminLibraryPage';
import AdminLaboratoryPage from './pages/admin/AdminLaboratoryPage';
import AdminHostelPage from './pages/admin/AdminHostelPage';
import AdminNoticesPage from './pages/admin/AdminNoticesPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Warden Pages
import WardenDashboard from './pages/warden/WardenDashboard';
import WardenGatePassPage from './pages/warden/WardenGatePassPage';
import NoDuesVerifyPage from './pages/warden/NoDuesVerifyPage';

// Accounts Pages
import AccountsDashboard from './pages/accounts/AccountsDashboard';

// =============================================
// ROLE-BASED PROTECTED ROUTE
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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized user to their own role dashboard
    const ROLE_HOME = {
      student: '/student/dashboard',
      faculty: '/faculty/dashboard',
      hod: '/faculty/dashboard',
      warden: '/warden/dashboard',
      accounts: '/accounts/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

// =============================================
// APP ROUTES
// =============================================
const AppRoutes = () => (
  <Routes>
    {/* ── PUBLIC INSTITUTIONAL PAGES ── */}
    <Route path="/" element={<InstitutionalLandingPage />} />
    <Route path="/login" element={<InstitutionalLandingPage initialOpenLogin={true} />} />
    <Route path="/notices" element={<PublicNoticesPage />} />
    <Route path="/services" element={<PublicServicesPage />} />
    <Route path="/academics" element={<PublicAcademicsPage />} />
    <Route path="/about" element={<PublicAboutPage />} />
    <Route path="/verify" element={<PublicVerifyPage />} />
    <Route path="/verify/:certId" element={<PublicVerifyPage />} />
    <Route path="/departments" element={<DepartmentsListPage />} />
    <Route path="/departments/:deptId" element={<DepartmentDetailPage />} />

    {/* ── 🎓 STUDENT SERVICES ── */}
    <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
    <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><ProfilePage /></ProtectedRoute>} />
    <Route path="/student/course-registration" element={<ProtectedRoute allowedRoles={['student']}><CourseRegistrationPage /></ProtectedRoute>} />
    <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><AttendancePage /></ProtectedRoute>} />
    <Route path="/student/examination" element={<ProtectedRoute allowedRoles={['student']}><ExamsPage /></ProtectedRoute>} />
    <Route path="/student/exams" element={<ProtectedRoute allowedRoles={['student']}><ExamsPage /></ProtectedRoute>} />
    <Route path="/student/results" element={<ProtectedRoute allowedRoles={['student']}><StudentResultsPage /></ProtectedRoute>} />
    <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><FeesPage /></ProtectedRoute>} />
    <Route path="/student/gate-pass" element={<ProtectedRoute allowedRoles={['student']}><GatePassPage /></ProtectedRoute>} />
    <Route path="/student/gatepass" element={<ProtectedRoute allowedRoles={['student']}><GatePassPage /></ProtectedRoute>} />
    <Route path="/student/no-dues" element={<ProtectedRoute allowedRoles={['student']}><NoDuesPage /></ProtectedRoute>} />
    <Route path="/student/nodues" element={<ProtectedRoute allowedRoles={['student']}><NoDuesPage /></ProtectedRoute>} />
    <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><StudentAssignmentsPage /></ProtectedRoute>} />
    <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={['student']}><StudentTimetablePage /></ProtectedRoute>} />
    <Route path="/student/hostel" element={<ProtectedRoute allowedRoles={['student']}><HostelPage /></ProtectedRoute>} />
    <Route path="/student/applications" element={<ProtectedRoute allowedRoles={['student']}><ApplicationsPage /></ProtectedRoute>} />
    <Route path="/student/my-applications" element={<ProtectedRoute allowedRoles={['student']}><MyApplicationsPage /></ProtectedRoute>} />
    <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><NotificationsPage /></ProtectedRoute>} />

    {/* ── 👨‍🏫 FACULTY SERVICES ── */}
    <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><FacultyDashboard /></ProtectedRoute>} />
    <Route path="/faculty/profile" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><FacultyProfilePage /></ProtectedRoute>} />
    <Route path="/faculty/attendance" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><FacultyAttendancePage /></ProtectedRoute>} />
    <Route path="/faculty/courses" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><FacultyCoursesPage /></ProtectedRoute>} />
    <Route path="/faculty/timetable" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><FacultyTimetablePage /></ProtectedRoute>} />
    <Route path="/faculty/examinations" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><FacultyExaminationsPage /></ProtectedRoute>} />
    <Route path="/faculty/results" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><FacultyExaminationsPage /></ProtectedRoute>} />
    <Route path="/faculty/assignments" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><FacultyAssignmentsPage /></ProtectedRoute>} />
    <Route path="/faculty/notices" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><FacultyNoticesPage /></ProtectedRoute>} />
    <Route path="/faculty/students" element={<ProtectedRoute allowedRoles={['faculty', 'hod']}><StudentsListPage /></ProtectedRoute>} />
    <Route path="/faculty/applications-inbox" element={<ProtectedRoute allowedRoles={['faculty']}><ApplicationsInboxPage /></ProtectedRoute>} />

    {/* ── HOD ROUTES ── */}
    <Route path="/hod/applications-inbox" element={<ProtectedRoute allowedRoles={['hod']}><ApplicationsInboxPage /></ProtectedRoute>} />
    <Route path="/hod/department" element={<ProtectedRoute allowedRoles={['hod']}><DepartmentsPage /></ProtectedRoute>} />
    <Route path="/hod/students" element={<ProtectedRoute allowedRoles={['hod']}><StudentsListPage /></ProtectedRoute>} />
    <Route path="/hod/approvals" element={<ProtectedRoute allowedRoles={['hod']}><PendingWorkflowsPage /></ProtectedRoute>} />

    {/* ── 🏛️ ADMIN / STAFF SERVICES ── */}
    <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin', 'hod']}><StudentsListPage /></ProtectedRoute>} />
    <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
    <Route path="/admin/accounts" element={<ProtectedRoute allowedRoles={['admin', 'accounts']}><AdminAccountsPage /></ProtectedRoute>} />
    <Route path="/admin/fees" element={<ProtectedRoute allowedRoles={['admin', 'accounts']}><AdminAccountsPage /></ProtectedRoute>} />
    <Route path="/admin/examination" element={<ProtectedRoute allowedRoles={['admin']}><AdminExaminationPage /></ProtectedRoute>} />
    <Route path="/admin/library" element={<ProtectedRoute allowedRoles={['admin']}><AdminLibraryPage /></ProtectedRoute>} />
    <Route path="/admin/laboratory" element={<ProtectedRoute allowedRoles={['admin']}><AdminLaboratoryPage /></ProtectedRoute>} />
    <Route path="/admin/hostel" element={<ProtectedRoute allowedRoles={['admin']}><AdminHostelPage /></ProtectedRoute>} />
    <Route path="/admin/department" element={<ProtectedRoute allowedRoles={['admin', 'hod']}><DepartmentsPage /></ProtectedRoute>} />
    <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['admin', 'hod']}><DepartmentsPage /></ProtectedRoute>} />
    <Route path="/admin/notices" element={<ProtectedRoute allowedRoles={['admin']}><AdminNoticesPage /></ProtectedRoute>} />
    <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReportsPage /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
    <Route path="/admin/workflow-config" element={<ProtectedRoute allowedRoles={['admin']}><WorkflowConfigPage /></ProtectedRoute>} />
    <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogsPage /></ProtectedRoute>} />
    <Route path="/admin/workflows" element={<ProtectedRoute allowedRoles={['admin', 'hod']}><PendingWorkflowsPage /></ProtectedRoute>} />
    <Route path="/admin/applications-inbox" element={<ProtectedRoute allowedRoles={['admin']}><ApplicationsInboxPage /></ProtectedRoute>} />
    <Route path="/admin/nodues" element={<ProtectedRoute allowedRoles={['admin']}><NoDuesVerifyPage role="admin" /></ProtectedRoute>} />
    <Route path="/admin/gatepass" element={<ProtectedRoute allowedRoles={['admin']}><WardenGatePassPage /></ProtectedRoute>} />

    {/* ── WARDEN ── */}
    <Route path="/warden/dashboard" element={<ProtectedRoute allowedRoles={['warden']}><WardenDashboard /></ProtectedRoute>} />
    <Route path="/warden/applications-inbox" element={<ProtectedRoute allowedRoles={['warden']}><ApplicationsInboxPage /></ProtectedRoute>} />
    <Route path="/warden/gatepass" element={<ProtectedRoute allowedRoles={['warden', 'admin']}><WardenGatePassPage /></ProtectedRoute>} />
    <Route path="/warden/nodues" element={<ProtectedRoute allowedRoles={['warden', 'admin']}><NoDuesVerifyPage role="warden" /></ProtectedRoute>} />
    <Route path="/warden/hostel" element={<ProtectedRoute allowedRoles={['warden']}><AdminHostelPage /></ProtectedRoute>} />

    {/* ── ACCOUNTS ── */}
    <Route path="/accounts/dashboard" element={<ProtectedRoute allowedRoles={['accounts']}><AccountsDashboard /></ProtectedRoute>} />
    <Route path="/accounts/applications-inbox" element={<ProtectedRoute allowedRoles={['accounts']}><ApplicationsInboxPage /></ProtectedRoute>} />
    <Route path="/accounts/fees" element={<ProtectedRoute allowedRoles={['accounts']}><AdminAccountsPage /></ProtectedRoute>} />
    <Route path="/accounts/payments" element={<ProtectedRoute allowedRoles={['accounts']}><AdminAccountsPage /></ProtectedRoute>} />
    <Route path="/accounts/nodues" element={<ProtectedRoute allowedRoles={['accounts', 'admin']}><NoDuesVerifyPage role="accounts" /></ProtectedRoute>} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

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
              background: '#0b1d3a',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
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
