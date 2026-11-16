import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users as UsersIcon,
  UserPlus,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  UserX,
  Shield,
  Key,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Can from '../../components/auth/Can';
import UsersTable from './UsersTable';
import UserModal from './UserModal';
import UserStatusModal from './UserStatusModal';
import userService from '../../services/userService';
import roleService from '../../services/roleService';
import { useAuth } from '../../hooks/useAuth';
import type { User, Role } from '../../types/user';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>(() => searchParams.get('role') || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTargetUser, setStatusTargetUser] = useState<User | null>(null);

  const fetchUsersAndRoles = async () => {
    setIsLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        userService.getUsers(),
        roleService.getRoles().catch(() => [] as Role[]),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      console.error('Failed to load user management data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search by name, email, or phone
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = u.full_name?.toLowerCase().includes(query);
        const matchesEmail = u.email?.toLowerCase().includes(query);
        const matchesPhone = u.phone?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }

      // Filter by role
      if (selectedRole !== 'all') {
        if (String(u.role?.id) !== selectedRole) return false;
      }

      // Filter by status
      if (selectedStatus !== 'all') {
        if (u.status !== selectedStatus) return false;
      }

      return true;
    });
  }, [users, searchTerm, selectedRole, selectedStatus]);

  // Metric summaries
  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const inactive = total - active;
    const admins = users.filter((u) => u.role?.role_name?.toLowerCase().includes('admin')).length;
    return { total, active, inactive, admins };
  }, [users]);

  // Handle User Modal Save (Create or Update)
  const handleUserSaved = (savedUser: User) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === savedUser.id);
      if (exists) {
        return prev.map((u) => (u.id === savedUser.id ? savedUser : u));
      }
      return [savedUser, ...prev];
    });
  };

  // Handle Status Update
  const handleStatusUpdated = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleOpenCreateModal = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditModal = (targetUser: User) => {
    setUserToEdit(targetUser);
    setIsUserModalOpen(true);
  };

  const handleOpenToggleStatus = (targetUser: User) => {
    setStatusTargetUser(targetUser);
    setIsStatusModalOpen(true);
  };

  return (
    <AppShell
      title="User Management"
      subtitle="System Administration, Staff Directory & Role-Based Access"
    >
      <div className="space-y-6">
        {/* Top Header Banner & Actions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Staff & User Management
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50 font-mono">
                {users.length} registered
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage CRM staff identities, allocate system roles, and configure portal access policies.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsersAndRoles}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
            >
              Refresh
            </Button>
            <Can permission="users.create">
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreateModal}
                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              >
                Add New User
              </Button>
            </Can>
          </div>
        </div>

        {/* 4 Metric Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Users</span>
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60">
                <UsersIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {metrics.total}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">Staff accounts</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Accounts</span>
              <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/50">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono">
              {metrics.active}
            </div>
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium mt-0.5 block">
              Authorized to sign in
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Inactive Accounts</span>
              <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                <UserX className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-700 dark:text-rose-400 font-mono">
              {metrics.inactive}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">Access suspended</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">System Administrators</span>
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/40">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-purple-900 dark:text-purple-300 font-mono">
              {metrics.admins}
            </div>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5 block">
              Full authority superusers
            </span>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Role & Status Filter dropdowns */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Filters:</span>
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-8.5 px-2.5 py-1 text-xs bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            >
              <option value="all">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.role_name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8.5 px-2.5 py-1 text-xs bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>

            {(searchTerm || selectedRole !== 'all' || selectedStatus !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('all');
                  setSelectedStatus('all');
                }}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium px-2 py-1 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <UsersTable
          users={filteredUsers}
          isLoading={isLoading}
          currentUserId={currentUser?.id}
          onEditUser={handleOpenEditModal}
          onToggleStatus={handleOpenToggleStatus}
        />
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        userToEdit={userToEdit}
        onSaved={handleUserSaved}
      />

      <UserStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        user={statusTargetUser}
        currentUserId={currentUser?.id}
        onStatusUpdated={handleStatusUpdated}
      />
    </AppShell>
  );
};

export default UsersPage;
