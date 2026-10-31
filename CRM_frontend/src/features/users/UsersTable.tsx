import React from 'react';
import {
  Edit2,
  UserCheck,
  UserX,
  Clock,
  Phone,
  Mail,
  Users as UsersIcon,
  Shield,
} from 'lucide-react';
import { UserRoleBadge, UserStatusBadge } from './UserBadges';
import Button from '../../components/ui/Button';
import Can from '../../components/auth/Can';
import type { User } from '../../types/user';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  currentUserId?: number;
  onEditUser: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  currentUserId,
  onEditUser,
  onToggleStatus,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center text-xs text-slate-400 shadow-2xs">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading team members & user directory...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center text-xs text-slate-500 space-y-2 shadow-2xs">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
          <UsersIcon className="w-5 h-5" />
        </div>
        <p className="font-semibold text-slate-800 text-sm">No users found</p>
        <p className="text-slate-400 max-w-sm mx-auto">
          No team members match your active search or filter criteria. Try clearing filters or create a new user.
        </p>
      </div>
    );
  }

  const getInitials = (user: User) => {
    const f = user.first_name?.[0] || '';
    const l = user.last_name?.[0] || '';
    return (f + l).toUpperCase() || 'U';
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never logged in';
    try {
      const date = new Date(lastLogin);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return lastLogin;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role & Tier</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Activity</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isSelf = currentUserId === user.id;
              const isActive = user.status === 'active';

              return (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* User Avatar & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-700 to-slate-800 text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0 shadow-2xs">
                        {getInitials(user)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 truncate">
                            {user.full_name}
                          </span>
                          {isSelf && (
                            <span className="px-1.5 py-0.2 rounded-sm bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 font-mono text-[11px] block truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4">
                    <UserRoleBadge
                      roleName={user.role?.role_name}
                      roleTier={user.role?.role_tier}
                    />
                  </td>

                  {/* Contact */}
                  <td className="py-3 px-4 text-slate-600">
                    {user.phone ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {user.phone}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No phone</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <UserStatusBadge status={user.status} />
                  </td>

                  {/* Last Login */}
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{formatLastLogin(user.last_login_at)}</span>
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Can permission="users.edit">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditUser(user)}
                          title="Edit profile & role"
                          leftIcon={<Edit2 className="w-3.5 h-3.5 text-slate-500" />}
                        >
                          Edit
                        </Button>
                      </Can>

                      <Can permission="users.deactivate">
                        <Button
                          variant={isActive ? 'ghost' : 'outline'}
                          size="sm"
                          onClick={() => onToggleStatus(user)}
                          disabled={isSelf && isActive}
                          title={
                            isSelf && isActive
                              ? 'You cannot deactivate your own account'
                              : isActive
                                ? 'Deactivate user account'
                                : 'Reactivate user account'
                          }
                          className={
                            isActive
                              ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                              : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50'
                          }
                          leftIcon={
                            isActive ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )
                          }
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </Can>
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

export default UsersTable;
