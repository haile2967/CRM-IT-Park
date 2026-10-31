import type { Role } from './role';

export type { Role };
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  last_login_at: string | null;
  created_at?: string;
  role?: Role;
  is_admin?: boolean;
  roles?: string[];
  permissions?: string[];
}

export interface CreateUserPayload {
  role_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface UpdateUserPayload {
  role_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  phone?: string;
  status?: UserStatus;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
}

export interface AssignRolePayload {
  role_id: number;
}

export interface UserFilters {
  search?: string;
  role_id?: string;
  status?: string;
}
