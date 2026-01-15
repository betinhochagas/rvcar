/**
 * AuthManager - Gerenciador de Autenticação
 */

import { fetchWithRetry } from './fetchWithRetry';

const getAuthApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // Em desenvolvimento, detectar se está acessando via IP da rede local
  const hostname = window.location.hostname;
  
  // Se for localhost ou 127.0.0.1, usar localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  
  // Se for IP da rede local (192.168.x.x, 10.x.x.x), usar o mesmo IP
  if (hostname.match(/^(192\.168\.|10\.)/)) {
    return `http://${hostname}:3000/api`;
  }
  
  // Fallback para localhost
  return 'http://localhost:3000/api';
};

const AUTH_API_BASE = getAuthApiUrl();

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    username: string;
    name: string;
  };
  expires_at: string;
}

interface VerifyResponse {
  valid: boolean;
  user: {
    id: number;
    username: string;
    name: string;
  };
  expires_at: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
  token: string;
  expires_at: string;
}

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

/**
 * Realizar login
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const data = await fetchWithRetry<LoginResponse>(`${AUTH_API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }, {
    retries: 3,
    backoff: 1000,
    retryOn: [408, 429, 500, 502, 503, 504]
  });
  
  // Salvar token e dados do usuário
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  
  return data;
};

/**
 * Verificar se token é válido
 */
export const verifyToken = async (token: string): Promise<VerifyResponse> => {
  const data = await fetchWithRetry<VerifyResponse>(`${AUTH_API_BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  }, {
    retries: 2,
    backoff: 500,
    retryOn: [408, 429, 500, 502, 503, 504]
  });
  
  return data;
};

/**
 * Alterar senha
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const data = await fetchWithRetry<ChangePasswordResponse>(`${AUTH_API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  }, {
    retries: 3,
    backoff: 1000,
    retryOn: [408, 429, 500, 502, 503, 504]
  });
  
  // Atualizar token
  localStorage.setItem(TOKEN_KEY, data.token);
  
  return data;
};

/**
 * Fazer logout
 */
export const logout = async (): Promise<void> => {
  const token = getToken();
  
  // Chamar endpoint de logout se tiver token
  if (token) {
    try {
      await fetch(`${AUTH_API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
      });
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
      // Continue com logout local mesmo se falhar
    }
  }
  
  // Limpar dados locais
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('admin_auth'); // Remover flag antiga
};

/**
 * Obter token armazenado
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Obter dados do usuário armazenado
 */
export interface User {
  username: string;
  role?: string;
  [key: string]: unknown;
}

export const getUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Verificar se está autenticado
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Obter header de autorização
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
