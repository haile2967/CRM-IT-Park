import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import LeadsPage from './features/leads/LeadsPage';
import UsersPage from './features/users/UsersPage';
import RolesPage from './features/roles/RolesPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes (Accessible only when logged out) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected Routes (Require active authenticated session) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/accounts" element={<Navigate to="/dashboard" replace />} />
            <Route path="/contacts" element={<Navigate to="/dashboard" replace />} />
            <Route path="/opportunities" element={<Navigate to="/dashboard" replace />} />
            <Route path="/tickets" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Root & Catch-all Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
