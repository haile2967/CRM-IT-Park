import React from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import AppShell from '../components/layout/AppShell';

interface ProtectedRouteProps {
  requiredPermission?: string | string[];
  requiredRole?: string | string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermission,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { can, hasRole } = usePermission();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#070b14] overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="hidden md:flex w-64 h-full bg-[#0a121e] border-r border-slate-800/90 flex-col p-4 space-y-6 shrink-0">
          <div className="h-8 w-36 rounded-lg bg-slate-800/80 animate-pulse" />
          <div className="space-y-2.5 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 w-full rounded-lg bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col h-full">
          <header className="h-14 bg-white/95 dark:bg-[#0a121e]/95 border-b border-slate-200 dark:border-slate-800/90 px-6 flex items-center justify-between shrink-0">
            <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-8 w-32 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </header>
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            <div className="h-24 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 animate-pulse"
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const missingRole = requiredRole ? !hasRole(requiredRole) : false;
  const missingPermission = requiredPermission ? !can(requiredPermission) : false;

  if (missingRole || missingPermission) {
    return (
      <AppShell title="Access Restricted" subtitle="Insufficient role permissions">
        <div className="max-w-md mx-auto mt-16 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
            Access Denied
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
            Your assigned role does not have permission to view this page. Contact your System Administrator if you need access.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard', { replace: true })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </AppShell>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
