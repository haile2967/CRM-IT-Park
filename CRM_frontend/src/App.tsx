import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import LoginPage from './features/auth/LoginPage';
import ChangePasswordPage from './features/auth/ChangePasswordPage';
import OAuthCallbackPage from './features/auth/OAuthCallbackPage';
import DashboardPage from './features/dashboard/DashboardPage';
import LeadsPage from './features/leads/LeadsPage';
import UsersPage from './features/users/UsersPage';
import RolesPage from './features/roles/RolesPage';
import PipelineStagesPage from './features/pipelineStages/PipelineStagesPage';
import EscalationPoliciesPage from './features/escalationPolicies/EscalationPoliciesPage';
import ChangePasswordPage from './features/auth/ChangePasswordPage';
import OAuthCallbackPage from './features/auth/OAuthCallbackPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* OAuth Callback handler */}
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />

          {/* Protected Routes (Require active authenticated session) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/settings/security" element={<ChangePasswordPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/pipeline-stages" element={<PipelineStagesPage />} />
            <Route path="/escalations" element={<EscalationPoliciesPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
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
