export interface Role {
  id: number;
  name?: string;
  role_name: string;
  description: string | null;
  role_tier: number | null;
  is_active?: boolean;
  is_system?: boolean;
  user_count?: number;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PermissionItem {
  name: string;
  description: string;
}

export interface PermissionGroup {
  name: string;
  permissions: PermissionItem[];
}

export interface CreateRolePayload {
  name: string;
  role_name?: string;
  description?: string;
  role_tier?: number;
  permissions?: string[];
}

export interface UpdateRolePayload {
  name?: string;
  role_name?: string;
  description?: string;
  role_tier?: number;
  permissions?: string[];
}

export interface RoleResponse {
  data: Role[];
}

export interface PermissionsResponse {
  success: boolean;
  data: PermissionGroup[];
}
