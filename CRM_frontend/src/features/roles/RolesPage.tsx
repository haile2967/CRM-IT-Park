import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import DeleteRoleModal from './DeleteRoleModal';
import roleService from '../../services/roleService';
import userService from '../../services/userService';
import type { Role } from '../../types/role';
import type { User } from '../../types/user';

export const RolesPage: React.FC = () => {
  const navigate = useNavigate();

  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

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
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                System Role Directory
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                {roles.length} Active Roles
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Overview of system roles, permissions, and staff member allocations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-500" />}
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/users')}
              leftIcon={<UsersIcon className="w-3.5 h-3.5 text-slate-500" />}
            >
              Staff Directory
            </Button>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Roles</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                <Key className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
              {metrics.totalRoles}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Configured roles</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Staff Assigned</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <UsersIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono">
              {metrics.totalAssignedStaff}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              Active CRM accounts
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">System Roles</span>
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-purple-900 font-mono">
              {metrics.systemRoles}
            </div>
            <span className="text-[11px] text-purple-600 font-medium mt-0.5 block">
              Protected administrator
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Custom Roles</span>
              <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-sky-800 font-mono">
              {metrics.customRoles}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              User-defined roles
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search roles by title or description..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Filter:</span>
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-8.5 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
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
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium px-2 py-1 hover:underline cursor-pointer"
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
        />

        {/* Role Builder & Permission Matrix Modal */}
        <RoleModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          roleToEdit={editingRole}
          onSaved={handleRoleSaved}
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
