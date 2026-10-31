import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Lock, Users } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import roleService from '../../services/roleService';
import type { Role } from '../../types/role';

interface DeleteRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onDeleted: (roleId: number) => void;
}

export const DeleteRoleModal: React.FC<DeleteRoleModalProps> = ({
  isOpen,
  onClose,
  role,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !role) return null;

  const isSystemRole = Boolean(
    role.is_system || role.role_name === 'System Administrator'
  );
  const assignedUsersCount = role.user_count ?? 0;
  const hasAssignedUsers = assignedUsersCount > 0;
  const cannotDelete = isSystemRole || hasAssignedUsers;

  const handleDelete = async () => {
    if (cannotDelete) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await roleService.deleteRole(role.id);
      onDeleted(role.id);
      onClose();
    } catch (err: any) {
      console.error('Role deletion error:', err);
      const res = err.response;
      setErrorMessage(
        res?.data?.message ||
          'Failed to delete role. Please make sure no users remain assigned to it.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center border shadow-2xs ${
                cannotDelete
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {isSystemRole ? (
                <Lock className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {cannotDelete ? 'Role Protected' : 'Delete Custom Role'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Confirm role removal from CRM security schema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <Alert
              variant="error"
              title="Deletion Blocked"
              onClose={() => setErrorMessage(null)}
            >
              {errorMessage}
            </Alert>
          )}

          {isSystemRole ? (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
              <p className="font-semibold">System Administrator is Protected</p>
              <p className="text-purple-700 text-[11px] leading-relaxed">
                The System Administrator role is an immutable system root and cannot be removed or mutated under any circumstance.
              </p>
            </div>
          ) : hasAssignedUsers ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                <Users className="w-4 h-4 text-amber-700" />
                <span>Active Staff Currently Assigned ({assignedUsersCount})</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                This role cannot be deleted because <strong>{assignedUsersCount} staff member(s)</strong> are currently assigned to it. Please reassign those users to another role before deleting.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete the role{' '}
              <strong className="text-slate-900">"{role.role_name}"</strong>? This will permanently remove this role and its permission bindings from the system.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          {!cannotDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Role
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteRoleModal;

