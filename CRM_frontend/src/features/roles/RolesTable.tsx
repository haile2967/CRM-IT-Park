import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Key,
  ShieldCheck,
  Edit3,
  Trash2,
  Lock,
  ArrowRight,
  Users as UsersIcon,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Can from '../../components/auth/Can';
import type { Role } from '../../types/role';

interface RoleWithUserCount extends Role {
  userCount?: number;
}

interface RolesTableProps {
  roles: RoleWithUserCount[];
  isLoading: boolean;
  onEditRole?: (role: Role) => void;
  onDeleteRole?: (role: Role) => void;
}

export const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  isLoading,
  onEditRole,
  onDeleteRole,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center text-xs text-slate-400 shadow-2xs">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading system roles and access levels...
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center text-xs text-slate-500 space-y-2 shadow-2xs">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
          <Key className="w-5 h-5" />
        </div>
        <p className="font-semibold text-slate-800 text-sm">No roles found</p>
        <p className="text-slate-400 max-w-sm mx-auto">
          No system roles match your current search query.
        </p>
      </div>
    );
  }

  const getRoleVisuals = (role: Role) => {
    const isSystemRole = Boolean(
      role.is_system || (role.name || role.role_name || '').toLowerCase() === 'system administrator'
    );

    if (isSystemRole) {
      return {
        icon: ShieldCheck,
        badgeVariant: 'purple' as const,
        iconBg: 'bg-purple-50 text-purple-700 border-purple-200',
        typeLabel: 'System Role',
      };
    }

    return {
      icon: Key,
      badgeVariant: 'blue' as const,
      iconBg: 'bg-sky-50 text-sky-700 border-sky-200',
      typeLabel: 'Custom Role',
    };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Role Title</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Assigned Staff</th>
              <th className="py-3 px-4">Permissions</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.map((role) => {
              const visuals = getRoleVisuals(role);
              const Icon = visuals.icon;
              const count = role.user_count ?? role.userCount ?? 0;
              const isSystemRole = Boolean(
                role.is_system || role.role_name === 'System Administrator'
              );
              const permissionsCount = role.permissions?.length ?? 0;

              return (
                <tr
                  key={role.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Role Name & Icon */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 shadow-2xs ${visuals.iconBg}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-900 truncate">
                            {role.role_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            #{role.id}
                          </span>
                          {isSystemRole && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              <Lock className="w-2.5 h-2.5" />
                              System Protected
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[11px] block">
                          {isSystemRole ? 'Built-in administrator' : 'User-defined role'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Role Type Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant={visuals.badgeVariant} size="sm">
                      {visuals.typeLabel}
                    </Badge>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {role.description || 'No description specified'}
                    </p>
                  </td>

                  {/* Assigned Staff Count */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => navigate(`/users?role=${role.id}`)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                      title="Click to view staff holding this role"
                    >
                      <UsersIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{count} staff {count === 1 ? 'member' : 'members'}</span>
                    </button>
                  </td>

                  {/* Permissions Granted */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isSystemRole ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        All Capabilities
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                        {permissionsCount} granted
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View / Edit Permissions Button */}
                      <Can
                        permission="roles.edit"
                        fallback={
                          <button
                            type="button"
                            onClick={() => onEditRole?.(role)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Inspect role permissions"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        }
                      >
                        <button
                          type="button"
                          onClick={() => onEditRole?.(role)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title={isSystemRole ? 'Inspect System Role' : 'Edit Role & Permissions'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </Can>

                      {/* Delete Role Button */}
                      {isSystemRole ? (
                        <span
                          className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed"
                          title="System Administrator is a protected system role and cannot be deleted."
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <Can permission="roles.delete">
                          <button
                            type="button"
                            onClick={() => onDeleteRole?.(role)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              count > 0
                                ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-50'
                                : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={
                              count > 0
                                ? `Cannot delete: ${count} staff member(s) assigned`
                                : 'Delete custom role'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Can>
                      )}

                      {/* View Staff in Directory */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/users?role=${role.id}`)}
                        rightIcon={
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        }
                      >
                        Staff
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolesTable;
