import React, { useState } from 'react';
import {
  Shield,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSsoLogin = () => {
    setIsRedirecting(true);
    login();
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-12 bg-slate-50 selection:bg-emerald-600 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 mb-3">
            <Shield className="w-6 h-6 text-emerald-100" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ethiopian IT Park
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Enterprise CRM Portal • Single Sign-On
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="space-y-1.5 text-center">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Authentication is centralized with Ethiopian IT Park Identity & Access Management (IAM).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Multi-Factor Authentication (MFA/2FA) protected</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Role-Based Access Control (RBAC) synchronized</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Encrypted OpenID Connect & PKCE Authorization Code flow</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              isLoading={isRedirecting}
              onClick={handleSsoLogin}
              leftIcon={<KeyRound className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full font-semibold shadow-sm"
            >
              Sign In with Ethiopian IT Park SSO
            </Button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Secured via Keycloak OIDC Authentication</span>
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
