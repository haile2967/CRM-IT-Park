export interface Role {
  id: number;
  role_name: string;
  description: string | null;
  role_tier?: number | null;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  avatar?: string | null;
  phone: string | null;
  status: 'active' | 'deactivated' | 'suspended';
  last_login_at: string | null;
  created_at?: string;
  role?: Role;
  is_admin?: boolean;
  roles?: string[];
  permissions?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    token_type: string;
    user: User;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
