export interface ContactInformation {
  email?: string;
  phone?: string;
  website?: string;
}

export interface AccountType {
  id: number;
  category_group: string;
  category_name: string;
  description?: string;
}

export interface AccountOwner {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface AccountPrimaryContact {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  role_title?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
}

export interface Account {
  id: number;
  organization_name: string;
  account_type_id: number;
  industry?: string;
  location?: string;
  contact_information?: ContactInformation;
  engagement_history?: string;
  owner_user_id?: number | null;
  created_at: string;
  updated_at: string;
  owner?: AccountOwner;
  account_type?: AccountType;
  primary_contact?: AccountPrimaryContact;
  contacts_count?: number;
  opportunities_count?: number;
  tickets_count?: number;
}

export interface AccountMetrics {
  total: number;
  commercial_tenants: number;
  startup_incubatees: number;
  partners_investors: number;
  unassigned: number;
}

export interface AccountFilters {
  search?: string;
  account_type_id?: string | number;
  owner_user_id?: string | number;
  industry?: string;
  sort_by?: 'organization_name' | 'created_at' | 'industry' | 'location';
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface AccountsResponse {
  success: boolean;
  data: Account[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateAccountPayload {
  organization_name: string;
  account_type_id: number;
  industry?: string;
  location?: string;
  owner_user_id?: number | null;
  contact_information?: ContactInformation;
  engagement_history?: string;
  primary_contact?: {
    first_name: string;
    last_name: string;
    role_title?: string;
    email?: string;
    phone?: string;
  };
}

export interface UpdateAccountPayload {
  organization_name?: string;
  account_type_id?: number;
  industry?: string;
  location?: string;
  owner_user_id?: number | null;
  contact_information?: ContactInformation;
  engagement_history?: string;
}
