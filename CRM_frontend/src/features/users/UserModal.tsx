import React, { useState, useEffect, useMemo } from 'react';
import { X, UserPlus, UserCheck, Lock, Mail, Phone, User as UserIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import userService from '../../services/userService';
import roleService from '../../services/roleService';
import { usePermission } from '../../hooks/usePermission';
import type { User, Role, CreateUserPayload, UpdateUserPayload, UserStatus } from '../../types/user';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
  onSaved: (user: User) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  onSaved,
}) => {
  const { isSuperAdmin, can } = usePermission();
  const isEditing = Boolean(userToEdit);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');
  const [status, setStatus] = useState<UserStatus>('active');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter roles: only System Administrators can see or assign the System Administrator role
  const availableRoles = useMemo(() => {
    return roles.filter((r) => {
      if (r.role_name === 'System Administrator' || r.is_system) {
        return isSuperAdmin;
      }
      return true;
    });
  }, [roles, isSuperAdmin]);

  // Determine if the current user has permission to change/assign role
  const canAssignRole = isEditing ? can('users.assign_role') : true;

  // Load available roles when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingRoles(true);
      roleService
        .getRoles()
        .then((data) => {
          setRoles(data);
          if (!userToEdit && data.length > 0 && roleId === '') {
            const firstAssignable = data.find((r) => isSuperAdmin || (!r.is_system && r.role_name !== 'System Administrator'));
            if (firstAssignable) {
              setRoleId(firstAssignable.id);
            }
          }
        })
        .catch(() => {
          setErrorMessage('Unable to load roles. Please check connection.');
        })
        .finally(() => {
          setIsLoadingRoles(false);
        });
    }
  }, [isOpen, userToEdit, isSuperAdmin]);

  // Populate form if editing
  useEffect(() => {
    if (userToEdit) {
      setFirstName(userToEdit.first_name || '');
      setLastName(userToEdit.last_name || '');
      setEmail(userToEdit.email || '');
      setPhone(userToEdit.phone || '');
      setRoleId(userToEdit.role?.id ?? '');
      setStatus(userToEdit.status || 'active');
      setPassword('');
      setPasswordConfirmation('');
      setErrorMessage(null);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setRoleId('');
      setStatus('active');
      setPassword('');
      setPasswordConfirmation('');
      setErrorMessage(null);
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!roleId) {
      setErrorMessage('Please assign a valid role to this user.');
      return;
    }

    if (!isEditing) {
      if (!password || password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        return;
      }
      if (password !== passwordConfirmation) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isEditing && userToEdit) {
        const payload: UpdateUserPayload = {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          status,
        };

        // Only include role_id if the user has permission to assign roles
        if (canAssignRole) {
          payload.role_id = Number(roleId);
        }

        const updated = await userService.updateUser(userToEdit.id, payload);
        onSaved(updated);
        onClose();
      } else {
        const payload: CreateUserPayload = {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          role_id: Number(roleId),
          password,
          password_confirmation: passwordConfirmation,
        };

        const created = await userService.createUser(payload);
        onSaved(created);
        onClose();
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as {
          response?: {
            data?: {
              message?: string;
              errors?: Record<string, string[]>;
            };
          };
        }).response;

        if (res?.data?.errors) {
          const firstKey = Object.keys(res.data.errors)[0];
          setErrorMessage(res.data.errors[firstKey][0]);
        } else {
          setErrorMessage(res?.data?.message || 'Failed to save user. Please verify input fields.');
        }
      } else {
        setErrorMessage('A network error occurred while saving user data.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              {isEditing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {isEditing ? 'Edit User Profile & Role' : 'Create New CRM User'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isEditing
                  ? `Update identity, role permissions, or credentials for ${userToEdit?.full_name}`
                  : 'Register a staff member and grant portal permissions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <Alert variant="error" title="Validation Error" onClose={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Abebe"
                required
                leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Kebede"
                required
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Official Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@itpark.gov.et"
                required
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 911 000000"
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              />
            </div>

            {/* Role & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-700">
                    Assigned Role <span className="text-rose-500">*</span>
                  </label>
                  {!canAssignRole && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(Number(e.target.value))}
                    required
                    disabled={!canAssignRole || isLoadingRoles}
                    className="w-full h-9.5 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                  >
                    <option value="" disabled>
                      {isLoadingRoles ? 'Loading available roles...' : 'Select a role'}
                    </option>
                    {availableRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.role_name}
                      </option>
                    ))}
                  </select>
                </div>
                {!canAssignRole && (
                  <p className="text-[10px] text-slate-400">
                    Modifying user roles requires the <code>users.assign_role</code> permission.
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Account Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                    className="w-full h-9.5 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-colors"
                  >
                    <option value="active">Active (Access Allowed)</option>
                    <option value="inactive">Inactive (Access Suspended)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Password Section (Only for New User Creation) */}
            {!isEditing && (
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Security Credentials
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Minimum 8 characters. User will use this to sign in.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="••••••••"
                    required
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} type="button">
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={isSubmitting} type="submit">
              {isEditing ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
