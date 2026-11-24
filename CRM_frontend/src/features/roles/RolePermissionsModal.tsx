import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Check,
  Lock,
  Search,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import roleService from '../../services/roleService';
import type { Role, PermissionGroup } from '../../types/role';

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSaved: (updatedRole: Role) => void;
}

export const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({
  isOpen,
  onClose,
  role,
  onSaved,
}) => {
  const isSystemRole = Boolean(
    role?.is_system || role?.role_name === 'System Administrator'
  );

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load permission catalog whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingCatalog(true);
      setSearchTerm('');
      setErrorMessage(null);
      setSuccessMessage(null);

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

  // Sync state when role changes
  useEffect(() => {
    if (role) {
      setSelectedPermissions(role.permissions || []);
    } else {
      setSelectedPermissions([]);
    }
  }, [role, isOpen]);

  // All permission names across all groups
  const allPermissionNames = useMemo(() => {
    return permissionGroups.flatMap((g) => g.permissions.map((p) => p.name));
  }, [permissionGroups]);

  const totalPermissions = allPermissionNames.length;
  const isAllSelected =
    totalPermissions > 0 && selectedPermissions.length === totalPermissions;

  // Filter permission groups based on search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return permissionGroups;
    const term = searchTerm.toLowerCase();

    return permissionGroups
      .map((group) => {
        const matchesGroup = group.name.toLowerCase().includes(term);
        const filteredPerms = group.permissions.filter(
          (p) =>
            matchesGroup ||
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term)
        );

        return {
          ...group,
          permissions: filteredPerms,
        };
      })
      .filter((group) => group.permissions.length > 0);
  }, [permissionGroups, searchTerm]);

  // Toggle individual permission
  const handleTogglePermission = (name: string) => {
    if (isSystemRole) return;
    setSelectedPermissions((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  // Toggle all permissions for an entire domain group
  const handleToggleGroup = (group: PermissionGroup) => {
    if (isSystemRole) return;
    const groupPermNames = group.permissions.map((p) => p.name);
    const hasAll = groupPermNames.every((p) => selectedPermissions.includes(p));

    if (hasAll) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !groupPermNames.includes(p))
      );
    } else {
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

  // Save permissions
  const handleSave = async () => {
    if (!role) return;
    if (isSystemRole) {
      setErrorMessage('System roles cannot be modified.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await roleService.updateRole(role.id, {
        name: role.name || role.role_name,
        permissions: selectedPermissions,
      });
      setSuccessMessage('Permissions successfully updated.');
      onSaved(updated);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Failed to update role permissions:', err);
      const res = err.response;
      if (res?.data?.message) {
        setErrorMessage(res.data.message);
      } else {
        setErrorMessage('Failed to save permissions. Please check connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 flex items-center justify-center border border-cyan-100 dark:border-cyan-800/50 shadow-2xs shrink-0">
              {isSystemRole ? (
                <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Permissions: {role.role_name}
                </h3>
                {isSystemRole ? (
                  <Badge variant="purple" size="sm">
                    System Protected
                  </Badge>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50">
                    {selectedPermissions.length} of {totalPermissions} granted
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure granular page access and functional permissions for this role.
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

        {/* Top Control Bar: Search & Global Toggles */}
        <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter pages, capabilities, or permissions..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
            />
          </div>

          {!isSystemRole && totalPermissions > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleAll}
                className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 transition-colors cursor-pointer"
              >
                {isAllSelected ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Select All</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Modal Body / Permissions List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <Alert
              variant="error"
              title="Error"
              onClose={() => setErrorMessage(null)}
            >
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Alert
              variant="success"
              title="Success"
              onClose={() => setSuccessMessage(null)}
            >
              {successMessage}
            </Alert>
          )}

          {isSystemRole && (
            <div className="p-4 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 flex items-start gap-3 text-xs text-purple-900 dark:text-purple-200">
              <ShieldCheck className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-100">
                  Immutable System Administrator Role
                </p>
                <p className="text-purple-700 dark:text-purple-300 text-xs mt-0.5 leading-relaxed">
                  The System Administrator role possesses full administrative access across all current and future CRM pages and operations. Its permissions are permanently locked and cannot be edited.
                </p>
              </div>
            </div>
          )}

          {isLoadingCatalog ? (
            <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading CRM permissions catalog...
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <AlertCircle className="w-5 h-5 mx-auto mb-1 text-slate-400" />
              {searchTerm ? 'No permissions matched your filter.' : 'No permission modules found.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map((group) => {
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
                    className="rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0b1120] overflow-hidden shadow-2xs"
                  >
                    {/* Module / Domain Header */}
                    <div className="px-4 py-2.5 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                          {group.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                          {selectedCount} of {group.permissions.length} active
                        </span>
                      </div>

                      {!isSystemRole && (
                        <button
                          type="button"
                          onClick={() => handleToggleGroup(group)}
                          className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline cursor-pointer"
                        >
                          {isAllInGroup ? 'Clear Section' : 'Select Section'}
                        </button>
                      )}
                    </div>

                    {/* Permissions Grid */}
                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {group.permissions.map((perm) => {
                        const isChecked = isSystemRole || selectedPermissions.includes(perm.name);

                        return (
                          <label
                            key={perm.name}
                            className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer ${
                              isChecked
                                ? 'bg-cyan-50/30 dark:bg-cyan-950/20 border-cyan-200/70 dark:border-cyan-800/40'
                                : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/60'
                            } ${isSystemRole ? 'cursor-not-allowed opacity-90' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isSystemRole}
                              onChange={() => handleTogglePermission(perm.name)}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono block">
                                {perm.name}
                              </span>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
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

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isSystemRole
              ? 'All permissions permanently active'
              : `${selectedPermissions.length} of ${totalPermissions} permissions configured`}
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
                type="button"
                onClick={handleSave}
                isLoading={isSubmitting}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Save Permissions
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsModal;
