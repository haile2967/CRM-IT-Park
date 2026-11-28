import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import LoginPage from './features/auth/LoginPage';
import ChangePasswordPage from './features/auth/ChangePasswordPage';
import OAuthCallbackPage from './features/auth/OAuthCallbackPage';
import DashboardPage from './features/dashboard/DashboardPage';
import LeadsPage from './features/leads/LeadsPage';
import AccountsPage from './features/accounts/AccountsPage';
import ContactsPage from './features/contacts/ContactsPage';
import { OpportunitiesPage } from './features/opportunities/OpportunitiesPage';
import { TicketsPage } from './features/tickets/TicketsPage';
import UsersPage from './features/users/UsersPage';
import RolesPage from './features/roles/RolesPage';
import PipelineStagesPage from './features/pipelineStages/PipelineStagesPage';
import EscalationPoliciesPage from './features/escalationPolicies/EscalationPoliciesPage';

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

          {/* Protected Routes (Require active authenticated session) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/settings/security" element={<ChangePasswordPage />} />

            <Route element={<ProtectedRoute requiredPermission="leads.view" />}>
              <Route path="/leads" element={<LeadsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="accounts.view" />}>
              <Route path="/accounts" element={<AccountsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="contacts.view" />}>
              <Route path="/contacts" element={<ContactsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="opportunities.view" />}>
              <Route path="/opportunities" element={<OpportunitiesPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="tickets.view" />}>
              <Route path="/tickets" element={<TicketsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredRole="System Administrator" />}>
              <Route path="/pipeline-stages" element={<PipelineStagesPage />} />
              <Route path="/escalations" element={<EscalationPoliciesPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="users.view" />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="roles.view" />}>
              <Route path="/roles" element={<RolesPage />} />
            </Route>
          </Route>

          {/* Root & Catch-all Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
