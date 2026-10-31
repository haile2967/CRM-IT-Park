import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Check,
  Lock,
  Layers,
  Key,
  Info,
  CheckSquare,
  Square,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import roleService from '../../services/roleService';
import type { Role, PermissionGroup } from '../../types/role';

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
  const [roleTier, setRoleTier] = useState<number>(3);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load permission catalog whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingCatalog(true);
      roleService
        .getPermissions()
        .then((groups) => {
          setPermissionGroups(groups);
        })
        .catch((err) => {
          console.error('Failed to load permission catalog:', err);
          setErrorMessage('Could not load permission catalog from server.');
        })
        .finally(() => {
          setIsLoadingCatalog(false);
        });
    }
  }, [isOpen]);

  // Sync state when roleToEdit changes
  useEffect(() => {
    if (roleToEdit) {
      setRoleName(roleToEdit.name || roleToEdit.role_name || '');
      setDescription(roleToEdit.description || '');
      setRoleTier(roleToEdit.role_tier ?? 3);
      setSelectedPermissions(roleToEdit.permissions || []);
      setErrorMessage(null);
    } else {
      setRoleName('');
      setDescription('');
      setRoleTier(3);
      setSelectedPermissions([]);
      setErrorMessage(null);
    }
  }, [roleToEdit, isOpen]);

  // All permission names across all groups
  const allPermissionNames = useMemo(() => {
    return permissionGroups.flatMap((g) => g.permissions.map((p) => p.name));
  }, [permissionGroups]);

  const totalPermissions = allPermissionNames.length;
  const isAllSelected =
    totalPermissions > 0 && selectedPermissions.length === totalPermissions;

  // Toggle individual permission
  const handleTogglePermission = (name: string) => {
    if (isSystemRole) return;
    setSelectedPermissions((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  // Toggle all permissions for an entire group
  const handleToggleGroup = (group: PermissionGroup) => {
    if (isSystemRole) return;
    const groupPermNames = group.permissions.map((p) => p.name);
    const hasAll = groupPermNames.every((p) => selectedPermissions.includes(p));

    if (hasAll) {
      // Unselect group
      setSelectedPermissions((prev) =>
        prev.filter((p) => !groupPermNames.includes(p))
      );
    } else {
      // Select all in group
      setSelectedPermissions((prev) =>
        Array.from(new Set([...prev, ...groupPermNames]))
      );
    }
  };

  // Select / Deselect All globally
  const handleToggleAll = () => {
    if (isSystemRole) return;
    if (isAllSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions([...allPermissionNames]);
    }
  };

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
          role_tier: roleTier,
          permissions: selectedPermissions,
        });
        onSaved(updated);
      } else {
        const created = await roleService.createRole({
          name: roleName.trim(),
          description: description.trim() || undefined,
          role_tier: roleTier,
          permissions: selectedPermissions,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-2xs">
              {isSystemRole ? (
                <Lock className="w-4 h-4 text-purple-600" />
              ) : isEditing ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <Key className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-sm">
                  {isEditing ? `Edit Role: ${roleToEdit?.role_name}` : 'Create New System Role'}
                </h3>
                {isSystemRole && (
                  <Badge variant="purple" size="sm">
                    System Protected
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {isEditing
                  ? 'Configure role scope, security tier, and fine-grained permissions'
                  : 'Define a custom organizational role and configure capabilities'}
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
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
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex items-start gap-3 text-xs text-purple-900">
                <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-900">Immutable System Role</p>
                  <p className="text-purple-700 text-[11px] mt-0.5 leading-relaxed">
                    The System Administrator role is protected by system security rules and automatically possesses all current and future capabilities across the CRM.
                  </p>
                </div>
              </div>
            )}

            {/* Role Metadata Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Input
                    label="Role Title"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. Facilities Operations Officer"
                    disabled={isSystemRole}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Security Tier
                  </label>
                  <select
                    value={roleTier}
                    onChange={(e) => setRoleTier(Number(e.target.value))}
                    disabled={isSystemRole}
                    className="w-full h-9.5 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value={1}>Tier 1 — Full Administration</option>
                    <option value={2}>Tier 2 — Department Management</option>
                    <option value={3}>Tier 3 — Business Operations</option>
                    <option value={4}>Tier 4 — Support Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description & Scope
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSystemRole}
                  placeholder="Summarize the departmental responsibilities and access scope of this role..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                />
              </div>
            </div>

            {/* Permission Checkbox Matrix */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span>Permission Matrix</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600 font-normal">
                      {selectedPermissions.length} of {totalPermissions} granted
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Grant or revoke specific functional capabilities for staff assigned to this role.
                  </p>
                </div>

                {!isSystemRole && totalPermissions > 0 && (
                  <button
                    type="button"
                    onClick={handleToggleAll}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-medium px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    {isAllSelected ? (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Deselect All</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Select All</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {isLoadingCatalog ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading system permission catalog...
                </div>
              ) : permissionGroups.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                  No permission modules found in catalog.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {permissionGroups.map((group) => {
                    const groupPermNames = group.permissions.map((p) => p.name);
                    const selectedCount = groupPermNames.filter((p) =>
                      selectedPermissions.includes(p)
                    ).length;
                    const isAllInGroup =
                      groupPermNames.length > 0 &&
                      selectedCount === groupPermNames.length;

                    return (
                      <div
                        key={group.name}
                        className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs"
                      >
                        {/* Domain Group Header */}
                        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-800">
                              {group.name} Domain
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500">
                              {selectedCount}/{group.permissions.length} active
                            </span>
                          </div>

                          {!isSystemRole && (
                            <button
                              type="button"
                              onClick={() => handleToggleGroup(group)}
                              className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                            >
                              {isAllInGroup ? 'Clear Domain' : 'Select Domain'}
                            </button>
                          )}
                        </div>

                        {/* Domain Permission Items */}
                        <div className="p-3 divide-y divide-slate-100">
                          {group.permissions.map((perm) => {
                            const isChecked = selectedPermissions.includes(perm.name);

                            return (
                              <label
                                key={perm.name}
                                className={`flex items-start gap-3 py-2 px-2 rounded-lg transition-colors cursor-pointer ${
                                  isChecked
                                    ? 'bg-emerald-50/40 hover:bg-emerald-50/60'
                                    : 'hover:bg-slate-50'
                                } ${isSystemRole ? 'cursor-not-allowed opacity-90' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isSystemRole}
                                  onChange={() => handleTogglePermission(perm.name)}
                                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-900 font-mono">
                                      {perm.name}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                    {perm.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-500">
              {isSystemRole
                ? 'System roles are read-only'
                : `${selectedPermissions.length} permissions configured`}
            </span>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {isSystemRole ? 'Close' : 'Cancel'}
              </Button>

              {!isSystemRole && (
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={isSubmitting}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  {isEditing ? 'Save Role Changes' : 'Create System Role'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;

