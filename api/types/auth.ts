// Tipos de Usuário Admin
export interface AdminUser {
  id: number;
  username: string;
  password: string; // bcrypt hash
  name: string;
  must_change_password?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AdminToken {
  admin_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface LoginRequest {
  action: 'login';
  username: string;
  password: string;
}

export interface VerifyTokenRequest {
  action: 'verify_token';
  token: string;
}

export interface ChangePasswordRequest {
  action: 'change_password';
  token: string;
  current_password: string;
  new_password: string;
}

export interface LoginResponse {
  success: true;
  token: string;
  user: {
    id: number;
    username: string;
    name: string;
    must_change_password: boolean;
  };
  expires_at: string;
}

export interface VerifyTokenResponse {
  valid: true;
  user: {
    id: number;
    username: string;
    name: string;
  };
  expires_at: string;
}

export interface ChangePasswordResponse {
  success: true;
  message: string;
  token: string;
  expires_at: string;
}
