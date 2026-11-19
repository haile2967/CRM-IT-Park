import React, { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowRight, RefreshCw, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ItParkGlobeEmblem } from '../../components/common/ItParkLogo';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const errorMessage =
    searchParams.get('error') ||
    (location.state as any)?.errorMessage ||
    null;

  useEffect(() => {
    // Only automatically redirect to Keycloak SSO if no error has occurred
    if (!errorMessage) {
      login();
    }
  }, [errorMessage, login]);

  const handleRetry = () => {
    // Clear error query parameters and retry SSO login
    setSearchParams({});
    login();
  };

  if (errorMessage) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between p-4 sm:p-6 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Top Header */}
        <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2">
              <ItParkGlobeEmblem className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                Ethiopian IT Park
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                የኢትዮጵያ ኢንፎርሜሽን ቴክኖሎጂ ፓርክ
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Enterprise IAM Protection</span>
          </div>
        </header>

        {/* Access Restricted Card */}
        <main className="w-full max-w-lg mx-auto my-auto py-8">
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
            {/* Ambient decorative background glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              {/* Security Shield Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 mb-5 shadow-xs">
                <ShieldAlert className="w-7 h-7" />
              </div>

              {/* Title & Badge */}
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Access Restricted
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-md border border-rose-200 dark:border-rose-800">
                  Pre-Provisioned Only
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Ethiopian IT Park CRM Single Sign-On (SSO) Security Policy
              </p>

              {/* Error Message Box */}
              <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 text-xs leading-relaxed text-rose-900 dark:text-rose-200 mb-6">
                <p className="font-semibold mb-1">Access Policy Notice:</p>
                <p className="text-rose-800 dark:text-rose-300">{errorMessage}</p>
              </div>

              {/* Advisory Details */}
              <div className="space-y-3 mb-6 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-1.5 shrink-0" />
                  <p>
                    <strong>Enterprise Pre-Provisioned Accounts:</strong> Social login (Google & GitHub) is strictly permitted for verified employees registered by a CRM Administrator.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-1.5 shrink-0" />
                  <p>
                    If your account has not yet been registered, please contact your CRM Administrator or support team to obtain access.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
                >
                  <span>Sign In with Different Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-6xl mx-auto py-3 text-center text-[11px] text-slate-400 dark:text-slate-500">
          Official Platform • Ethiopian IT Park Corporation © {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  // Connecting state during initial redirection
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4 transition-colors">
      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2.5">
        <ItParkGlobeEmblem className="w-full h-full" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Connecting to Ethiopian IT Park IAM SSO...
        </span>
      </div>
    </div>
  );
};

export default LoginPage;
