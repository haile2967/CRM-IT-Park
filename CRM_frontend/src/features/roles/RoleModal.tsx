import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  Check,
  Lock,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import roleService from '../../services/roleService';
import type { Role } from '../../types/role';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: Role | null;
  onSaved: (role: Role) => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  roleToEdit,
  onSaved,
}) => {
  const isEditing = Boolean(roleToEdit);
  const isSystemRole = Boolean(
    roleToEdit?.is_system || roleToEdit?.role_name === 'System Administrator'
  );

  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when roleToEdit changes
  useEffect(() => {
    if (roleToEdit) {
      setRoleName(roleToEdit.name || roleToEdit.role_name || '');
      setDescription(roleToEdit.description || '');
      setErrorMessage(null);
    } else {
      setRoleName('');
      setDescription('');
      setErrorMessage(null);
    }
  }, [roleToEdit, isOpen]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSystemRole) {
      setErrorMessage('System roles cannot be modified.');
      return;
    }

    if (!roleName.trim()) {
      setErrorMessage('Role title is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isEditing && roleToEdit) {
        const updated = await roleService.updateRole(roleToEdit.id, {
          name: roleName.trim(),
          description: description.trim() || undefined,
        });
        onSaved(updated);
      } else {
        const created = await roleService.createRole({
          name: roleName.trim(),
          description: description.trim() || undefined,
        });
        onSaved(created);
      }
      onClose();
    } catch (err: any) {
      console.error('Role save error:', err);
      const res = err.response;
      if (res?.data?.message) {
        setErrorMessage(res.data.message);
      } else if (res?.data?.errors) {
        const firstKey = Object.keys(res.data.errors)[0];
        setErrorMessage(res.data.errors[firstKey][0]);
      } else {
        setErrorMessage('Failed to save role. Please check connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full my-8 overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 flex items-center justify-center border border-cyan-100 dark:border-cyan-800/50 shadow-2xs shrink-0">
              {isSystemRole ? (
                <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              ) : isEditing ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <Key className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  {isEditing ? `Edit Role: ${roleToEdit?.role_name}` : 'Create New System Role'}
                </h3>
                {isSystemRole && (
                  <Badge variant="purple" size="sm">
                    System Protected
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Update role title and organizational description'
                  : 'Define a new role for your CRM system'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-4">
            {errorMessage && (
              <Alert
                variant="error"
                title="Configuration Error"
                onClose={() => setErrorMessage(null)}
              >
                {errorMessage}
              </Alert>
            )}

            {isSystemRole && (
              <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 flex items-start gap-3 text-xs text-purple-900 dark:text-purple-200">
                <ShieldCheck className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-900 dark:text-purple-100">Immutable System Role</p>
                  <p className="text-purple-700 dark:text-purple-300 text-[11px] mt-0.5 leading-relaxed">
                    The System Administrator role is protected by system security rules and cannot be renamed or modified.
                  </p>
                </div>
              </div>
            )}

            {/* Role Metadata Fields */}
            <div className="space-y-4">
              <div>
                <Input
                  label="Role Title"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Sales Representative"
                  disabled={isSystemRole}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description & Scope
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSystemRole}
                  placeholder="Summarize the departmental responsibilities and access scope of this role..."
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {!isSystemRole && (
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                {isEditing ? 'Save Changes' : 'Create Role'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;
