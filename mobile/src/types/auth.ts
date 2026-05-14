export interface Tenant {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  locale: string | null;
  is_active: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  tenant: Tenant | null;
  roles: string[];
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
