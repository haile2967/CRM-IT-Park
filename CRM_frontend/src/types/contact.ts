export interface ContactAccount {
  id: number;
  organization_name: string;
  industry?: string;
  location?: string;
}

export interface ContactOwner {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Contact {
  id: number;
  account_id: number;
  owner_user_id?: number | null;
  first_name: string;
  last_name: string;
  name: string;
  role_title?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  account?: ContactAccount;
  owner?: ContactOwner;
}

export interface ContactFilters {
  account_id?: number | string;
  search?: string;
  is_primary?: boolean;
  page?: number;
  per_page?: number;
}

export interface ContactsResponse {
  success: boolean;
  data: Contact[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateContactPayload {
  account_id: number;
  first_name: string;
  last_name: string;
  role_title?: string;
  email?: string;
  phone?: string;
  is_primary?: boolean;
  owner_user_id?: number | null;
}

export interface UpdateContactPayload {
  account_id?: number;
  first_name?: string;
  last_name?: string;
  role_title?: string;
  email?: string;
  phone?: string;
  is_primary?: boolean;
  owner_user_id?: number | null;
}
