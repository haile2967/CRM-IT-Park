import React, { useEffect, useState } from 'react';
import { Shield, ArrowRight, KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Auto-forward directly to the unified Ethiopian IT Park login form
    const timer = setTimeout(() => {
      login();
    }, 150);

    return () => clearTimeout(timer);
  }, [login]);

  const handleManualLogin = () => {
    setIsRedirecting(true);
    login();
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-12 bg-slate-50 selection:bg-emerald-600 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 mb-3 animate-pulse">
            <Shield className="w-6 h-6 text-emerald-100" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ethiopian IT Park
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Enterprise CRM Portal
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-8 space-y-5 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <div className="space-y-1">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                Opening Secure Authentication...
              </h2>
              <p className="text-xs text-slate-500">
                Directing to Ethiopian IT Park sign-in form.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleManualLogin}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs text-slate-600"
            >
              Click here if not redirected automatically
            </Button>
          </div>
        </div>

        {/* Security Notice Footer */}
        <div className="text-center">
          <p className="text-[11px] text-slate-400 inline-flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Official Platform • Ethiopian IT Park Corporation © 2026</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
