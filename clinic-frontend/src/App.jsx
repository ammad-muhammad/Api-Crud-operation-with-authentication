import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AISymptomChecker from './pages/doctor/AISymptomChecker';

// Receptionist pages
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';

// Shared pages
import Patients from './pages/shared/Patients';
import Appointments from './pages/shared/Appointments';
import Prescriptions from './pages/shared/Prescriptions';

// Root redirect component based on role
const RootRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Let the main loading handler handle it
  
  if (!user) return <Navigate to="/login" replace />;
  
  const dashboards = {
    admin: '/admin',
    doctor: '/doctor',
    receptionist: '/receptionist',
    patient: '/patient',
  };
  
  return <Navigate to={dashboards[user.role] || '/login'} replace />;
};

// Unauthorized page
const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white">
    <div className="text-center px-6">
      <p className="text-8xl font-bold text-neutral-200 mb-4 leading-none">403</p>
      <h1 className="text-2xl font-bold text-neutral-900 mb-3">Access Denied</h1>
      <p className="text-neutral-500 text-sm mb-8">You don't have permission to view this page.</p>
      <Link to="/" className="btn-primary inline-flex">Return to Portal</Link>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
          toastClassName="!rounded-xl !shadow-lg !text-sm"
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ── ADMIN ─────────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<MainLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/patients" element={<Patients />} />
              <Route path="/admin/appointments" element={<Appointments />} />
              <Route path="/admin/ai-diagnosis" element={<AISymptomChecker />} />
              <Route path="/admin/analytics" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* ── DOCTOR ────────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={['doctor']} />}>
            <Route element={<MainLayout />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<Appointments />} />
              <Route path="/doctor/patients" element={<Patients />} />
              <Route path="/doctor/prescriptions" element={<Prescriptions />} />
              <Route path="/doctor/ai-diagnosis" element={<AISymptomChecker />} />
              <Route path="/doctor/analytics" element={<DoctorDashboard />} />
            </Route>
          </Route>

          {/* ── RECEPTIONIST ──────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={['receptionist']} />}>
            <Route element={<MainLayout />}>
              <Route path="/receptionist" element={<ReceptionistDashboard />} />
              <Route path="/receptionist/patients" element={<Patients />} />
              <Route path="/receptionist/register-patient" element={<Patients />} />
              <Route path="/receptionist/appointments" element={<Appointments />} />
              <Route path="/receptionist/book-appointment" element={<Appointments />} />
            </Route>
          </Route>

          {/* ── PATIENT ───────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={['patient']} />}>
            <Route element={<MainLayout />}>
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/patient/appointments" element={<Appointments />} />
              <Route path="/patient/prescriptions" element={<Prescriptions />} />
            </Route>
          </Route>

          {/* Root & Catch-all Redirects */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
