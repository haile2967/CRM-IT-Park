import React, { useState, useEffect, useMemo } from 'react';
import {
  Key,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Users as UsersIcon,
  Plus,
  Layers,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Can from '../../components/auth/Can';
import RolesTable from './RolesTable';
import RoleModal from './RoleModal';
import RolePermissionsModal from './RolePermissionsModal';
import DeleteRoleModal from './DeleteRoleModal';
import roleService from '../../services/roleService';
import userService from '../../services/userService';
import type { Role } from '../../types/role';
import type { User } from '../../types/user';

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [permissionsTargetRole, setPermissionsTargetRole] = useState<Role | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesData, usersData] = await Promise.all([
        roleService.getRoles(),
        userService.getUsers().catch(() => [] as User[]),
      ]);
      setRoles(rolesData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load roles data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute user count per role
  const userCountsByRoleId = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const u of users) {
      if (u.role?.id) {
        counts[u.role.id] = (counts[u.role.id] || 0) + 1;
      }
    }
    return counts;
  }, [users]);

  // Combine roles with user counts and filter
  const filteredRoles = useMemo(() => {
    return roles
      .map((r) => ({
        ...r,
        userCount: r.user_count ?? userCountsByRoleId[r.id] ?? 0,
      }))
      .filter((r) => {
        // Search term filter
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchesName = (r.name || r.role_name || '').toLowerCase().includes(query);
          const matchesDesc = r.description?.toLowerCase().includes(query);
          if (!matchesName && !matchesDesc) return false;
        }

        // Type filter (all, system, custom)
        if (selectedType === 'system') {
          const isSys = Boolean(
            r.is_system || (r.name || r.role_name || '').toLowerCase() === 'system administrator'
          );
          if (!isSys) return false;
        } else if (selectedType === 'custom') {
          const isSys = Boolean(
            r.is_system || (r.name || r.role_name || '').toLowerCase() === 'system administrator'
          );
          if (isSys) return false;
        }

        return true;
      });
  }, [roles, userCountsByRoleId, searchTerm, selectedType]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const totalRoles = roles.length;
    const systemRoles = roles.filter(
      (r) => r.is_system || (r.name || r.role_name || '').toLowerCase() === 'system administrator'
    ).length;
    const customRoles = totalRoles - systemRoles;
    const totalAssignedStaff = users.filter((u) => Boolean(u.role)).length;

    return {
      totalRoles,
      systemRoles,
      customRoles,
      totalAssignedStaff,
    };
  }, [roles, users]);

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setIsRoleModalOpen(true);
  };

  const handleOpenEditModal = (role: Role) => {
    setEditingRole(role);
    setIsRoleModalOpen(true);
  };

  const handleOpenDeleteModal = (role: Role) => {
    setDeletingRole(role);
  };

  const handleRoleSaved = () => {
    fetchData();
  };

  const handlePermissionsSaved = () => {
    fetchData();
  };

  const handleRoleDeleted = () => {
    fetchData();
  };

  return (
    <AppShell
      title="Role Management"
      subtitle="System Administration, Access Levels & Security Permissions"
    >
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Role Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overview of system roles, permissions, and access allocations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
            >
              Refresh
            </Button>

            <Can permission="roles.create">
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreateModal}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create New Role
              </Button>
            </Can>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Roles</span>
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60">
                <Key className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {metrics.totalRoles}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">Configured roles</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Users Assigned</span>
              <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/50">
                <UsersIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono">
              {metrics.totalAssignedStaff}
            </div>
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium mt-0.5 block">
              Active CRM accounts
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">System Roles</span>
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/40">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-purple-900 dark:text-purple-300 font-mono">
              {metrics.systemRoles}
            </div>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5 block">
              Protected administrator
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Custom Roles</span>
              <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/40">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-sky-800 dark:text-sky-300 font-mono">
              {metrics.customRoles}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              User-defined roles
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search roles by title or description..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Filter:</span>
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-8.5 px-2.5 py-1 text-xs bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            >
              <option value="all">All Roles</option>
              <option value="system">System Protected</option>
              <option value="custom">Custom Roles</option>
            </select>

            {(searchTerm || selectedType !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                }}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium px-2 py-1 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Roles Table */}
        <RolesTable
          roles={filteredRoles}
          isLoading={isLoading}
          onEditRole={handleOpenEditModal}
          onDeleteRole={handleOpenDeleteModal}
          onManagePermissions={(role) => setPermissionsTargetRole(role)}
        />

        {/* Role Create / Basic Edit Modal */}
        <RoleModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          roleToEdit={editingRole}
          onSaved={handleRoleSaved}
        />

        {/* Dedicated Permissions & Grants Modal */}
        <RolePermissionsModal
          isOpen={Boolean(permissionsTargetRole)}
          onClose={() => setPermissionsTargetRole(null)}
          role={permissionsTargetRole}
          onSaved={handlePermissionsSaved}
        />

        {/* Delete Role Modal */}
        <DeleteRoleModal
          isOpen={Boolean(deletingRole)}
          onClose={() => setDeletingRole(null)}
          role={deletingRole}
          onDeleted={handleRoleDeleted}
        />
      </div>
    </AppShell>
  );
};

export default RolesPage;
