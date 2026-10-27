import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { AppShell } from '../../components/layout/AppShell';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const ChangePasswordPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successRedirecting, setSuccessRedirecting] = useState(false);

  // Live Password Complexity Checks
  const requirements = useMemo(() => {
    return [
      {
        id: 'length',
        label: 'At least 8 characters',
        met: newPassword.length >= 8,
      },
      {
        id: 'lowercase',
        label: 'One lowercase letter (a-z)',
        met: /[a-z]/.test(newPassword),
      },
      {
        id: 'uppercase',
        label: 'One uppercase letter (A-Z)',
        met: /[A-Z]/.test(newPassword),
      },
      {
        id: 'number',
        label: 'One number (0-9)',
        met: /[0-9]/.test(newPassword),
      },
      {
        id: 'special',
        label: 'One special symbol (!@#$%^&*)',
        met: /[@$!%*?&#^()_+=\-[\]{}|:;,.`~]/.test(newPassword),
      },
    ];
  }, [newPassword]);

  const allRequirementsMet = useMemo(() => {
    return requirements.every((r) => r.met);
  }, [requirements]);

  const passwordsMatch = useMemo(() => {
    if (!newPassword || !newPasswordConfirmation) return null;
    return newPassword === newPasswordConfirmation;
  }, [newPassword, newPasswordConfirmation]);

  const isSameAsCurrent = useMemo(() => {
    if (!currentPassword || !newPassword) return false;
    return currentPassword === newPassword;
  }, [currentPassword, newPassword]);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Client-side validations
    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (!allRequirementsMet) {
      setErrorMessage('Please ensure your new password satisfies all security complexity requirements.');
      return;
    }

    if (isSameAsCurrent) {
      setErrorMessage('The new password cannot be the same as your current password.');
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      setErrorMessage('The new password and confirm password fields do not match.');
      return;
    }

    try {
      setIsLoading(true);

      const res = await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });

      // Show success state
      setSuccessRedirecting(true);

      // Option B: Revoke token locally & redirect to login with flash banner
      setTimeout(async () => {
        await logout();
        navigate('/login', {
          replace: true,
          state: {
            successMessage: res.message || 'Password successfully updated. Please sign in with your new password.',
          },
        });
      }, 1000);

    } catch (err: unknown) {
      setIsLoading(false);

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as {
          response?: {
            status?: number;
            data?: {
              message?: string;
              errors?: Record<string, string[]>;
            };
          };
        };

        const resData = axiosErr.response?.data;
        if (resData?.errors) {
          setFieldErrors(resData.errors);
          // Pick the first error message to display prominently
          const firstField = Object.keys(resData.errors)[0];
          setErrorMessage(resData.errors[firstField]?.[0] || 'Validation failed. Please review your input.');
        } else {
          setErrorMessage(resData?.message || 'Failed to update password. Please verify your credentials.');
        }
      } else {
        setErrorMessage('Unable to connect to the server. Please check your connection.');
      }
    }
  };

  return (
    <AppShell 
      title="Account Security" 
      subtitle="Manage your credentials, update your password, and protect your account."
    >
      <div className="max-w-xl mx-auto space-y-6">
        {/* Navigation Breadcrumb / Back Button */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Success Transition Banner */}
        {successRedirecting && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-emerald-950">Password successfully updated!</p>
              <p className="text-xs text-emerald-800 mt-0.5">
                Session invalidated for security. Redirecting to sign in with your new credentials...
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && !successRedirecting && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-semibold text-rose-950">Unable to update password</p>
              <p className="mt-0.5 leading-relaxed text-rose-800">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-600 cursor-pointer p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Change Password</h2>
                <p className="text-xs text-slate-500">
                  Enter your current password followed by a secure new password.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      if (fieldErrors.current_password) {
                        setFieldErrors((prev) => ({ ...prev, current_password: [] }));
                      }
                    }}
                    placeholder="••••••••"
                    disabled={isLoading || successRedirecting}
                    className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border transition-all outline-none ${
                      fieldErrors.current_password?.length
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20'
                        : 'border-slate-200/90 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.current_password?.[0] && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    {fieldErrors.current_password[0]}
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (fieldErrors.new_password) {
                        setFieldErrors((prev) => ({ ...prev, new_password: [] }));
                      }
                    }}
                    placeholder="••••••••"
                    disabled={isLoading || successRedirecting}
                    className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border transition-all outline-none ${
                      fieldErrors.new_password?.length
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20'
                        : 'border-slate-200/90 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Compact Password Requirements Checklist Under Input Field */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 mt-2">
                  <p className="text-[11px] font-semibold text-slate-700">
                    Password must contain:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {requirements.map((req) => (
                      <div
                        key={req.id}
                        className={`flex items-center gap-2 text-[11px] transition-colors ${
                          req.met ? 'text-emerald-700 font-medium' : 'text-slate-400'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            req.met ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="w-2 h-2" />
                        </div>
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isSameAsCurrent && (
                  <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    New password cannot be identical to your current password.
                  </p>
                )}
                {fieldErrors.new_password?.[0] && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    {fieldErrors.new_password[0]}
                  </p>
                )}
              </div>

              {/* Confirm New Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={newPasswordConfirmation}
                    onChange={(e) => {
                      setNewPasswordConfirmation(e.target.value);
                      if (fieldErrors.new_password_confirmation) {
                        setFieldErrors((prev) => ({ ...prev, new_password_confirmation: [] }));
                      }
                    }}
                    placeholder="••••••••"
                    disabled={isLoading || successRedirecting}
                    className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border transition-all outline-none ${
                      passwordsMatch === false
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20'
                        : passwordsMatch === true
                        ? 'border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 bg-emerald-50/10'
                        : 'border-slate-200/90 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passwordsMatch === false && newPasswordConfirmation.length > 0 && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1.5 mt-1">
                    <X className="w-3.5 h-3.5" />
                    Passwords do not match
                  </p>
                )}
                {passwordsMatch === true && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 mt-1">
                    <Check className="w-3.5 h-3.5" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Link
                  to="/dashboard"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isLoading || successRedirecting || !currentPassword || !allRequirementsMet || !passwordsMatch || isSameAsCurrent}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
    </AppShell>
  );
};

export default ChangePasswordPage;
