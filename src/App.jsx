import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import PublicProfile from './pages/PublicProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Checkpoint from './pages/Checkpoint';
import AdminDashboard from './pages/AdminDashboard';
import { NotificationProvider } from './context/NotificationContext';
import './styles/index.css';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <div className="spinner spinner-lg" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <div className="spinner spinner-lg" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  // Only redirect if explicitly blocked or suspended (not undefined/null status)
  const badStatus = user.status === 'blocked' || user.status === 'suspended' || user.status === 'pending_review';
  if (badStatus) return <Navigate to="/checkpoint" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  const badStatus = user && (user.status === 'blocked' || user.status === 'suspended' || user.status === 'pending_review');
  if (badStatus) return <Navigate to="/checkpoint" replace />;
  if (!user) return children;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
      <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/checkpoint" element={<Checkpoint />} />
      <Route path="/p/:username" element={<PublicProfile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'premium-toast',
              duration: 4000,
              style: {
                background: 'rgba(12, 12, 12, 0.9)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-md)',
                backdropFilter: 'blur(10px)',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '600',
              },
            }}
          />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
