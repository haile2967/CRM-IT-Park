import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Briefcase,
  Users as UsersIcon,
  Headphones,
  Key,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import type { Role } from '../../types/role';

interface RoleWithUserCount extends Role {
  userCount?: number;
}

interface RolesTableProps {
  roles: RoleWithUserCount[];
  isLoading: boolean;
}

export const RolesTable: React.FC<RolesTableProps> = ({ roles, isLoading }) => {
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
    const name = role.role_name.toLowerCase();
    const tier = role.role_tier;

    if (tier === 1 || name.includes('admin')) {
      return {
        icon: ShieldCheck,
        badgeVariant: 'purple' as const,
        iconBg: 'bg-purple-50 text-purple-700 border-purple-200',
        tierLabel: 'Tier 1 — Full Administration',
        scope: 'System-wide configuration, access control & mutations',
      };
    }

    if (tier === 2 || name.includes('manager')) {
      return {
        icon: Briefcase,
        badgeVariant: 'blue' as const,
        iconBg: 'bg-sky-50 text-sky-700 border-sky-200',
        tierLabel: 'Tier 2 — Department Management',
        scope: 'Team oversight, pipeline management, approvals & reporting',
      };
    }

    if (tier === 3 || name.includes('development') || name.includes('bdo')) {
      return {
        icon: UsersIcon,
        badgeVariant: 'emerald' as const,
        iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        tierLabel: 'Tier 3 — Business Operations',
        scope: 'Lead management, tenant relations & commercial opportunities',
      };
    }

    if (tier === 4 || name.includes('support')) {
      return {
        icon: Headphones,
        badgeVariant: 'amber' as const,
        iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
        tierLabel: 'Tier 4 — Support Operations',
        scope: 'Support tickets, facility SLAs & tenant inquiries',
      };
    }

    return {
      icon: Shield,
      badgeVariant: 'slate' as const,
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
      tierLabel: `Tier ${tier ?? '—'} — Standard Access`,
      scope: 'Standard CRM staff permissions',
    };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Role & Identity</th>
              <th className="py-3 px-4">Security Tier</th>
              <th className="py-3 px-4">Description & Scope</th>
              <th className="py-3 px-4">Assigned Staff</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.map((role) => {
              const visuals = getRoleVisuals(role);
              const Icon = visuals.icon;
              const count = role.userCount ?? 0;

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
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 truncate">
                            {role.role_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            #{role.id}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] block">
                          Tier {role.role_tier ?? 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Security Tier Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant={visuals.badgeVariant} size="sm">
                      {visuals.tierLabel}
                    </Badge>
                  </td>

                  {/* Description & Scope */}
                  <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {role.description || 'No description specified'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {visuals.scope}
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

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant="emerald" size="sm" dot>
                      Active
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/users?role=${role.id}`)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />}
                    >
                      View Staff
                    </Button>
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
