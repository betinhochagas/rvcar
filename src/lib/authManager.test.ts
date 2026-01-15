import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockResponse } from '@/test/setup';
import { 
  login, 
  logout, 
  getToken, 
  getUser, 
  isAuthenticated, 
  verifyToken,
  changePassword,
  getAuthHeader 
} from '@/lib/authManager';

// Mock fetch globally
global.fetch = vi.fn();

describe('authManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        success: true,
        token: 'mock-jwt-token',
        user: { id: 1, username: 'admin', name: 'Admin User' },
        expires_at: '2025-12-31',
      };

      (global.fetch as any).mockResolvedValueOnce(
        createMockResponse(mockResponse, { status: 200 })
      );

      const result = await login('admin', 'password');

      expect(result).toEqual(mockResponse);
      expect(localStorage.setItem).toHaveBeenCalledWith('admin_token', 'mock-jwt-token');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'admin_user',
        JSON.stringify({ id: 1, username: 'admin', name: 'Admin User' })
      );
    });

    it('should throw error on invalid credentials', async () => {
      const errorResponse = { error: 'Credenciais inválidas' };
      
      (global.fetch as any).mockResolvedValueOnce(
        createMockResponse(errorResponse, { status: 401 })
      );

      await expect(login('wrong', 'credentials')).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw error on network failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(login('admin', 'password')).rejects.toThrow('Network error');
    });
  });

  describe('logout', () => {
    it('should clear localStorage on logout', () => {
      localStorage.setItem('admin_token', 'some-token');
      localStorage.setItem('admin_user', JSON.stringify({ username: 'admin' }));

      logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('admin_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('admin_user');
    });
  });

  describe('getToken', () => {
    it('should return token if exists', () => {
      (localStorage.getItem as any).mockReturnValueOnce('mock-token');

      const token = getToken();

      expect(token).toBe('mock-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('admin_token');
    });

    it('should return null if no token', () => {
      (localStorage.getItem as any).mockReturnValueOnce(null);

      const token = getToken();

      expect(token).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return parsed user object', () => {
      const mockUser = { username: 'admin', role: 'admin' };
      (localStorage.getItem as any).mockReturnValueOnce(JSON.stringify(mockUser));

      const user = getUser();

      expect(user).toEqual(mockUser);
    });

    it('should return null if no user data', () => {
      (localStorage.getItem as any).mockReturnValueOnce(null);

      const user = getUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists', () => {
      (localStorage.getItem as any).mockReturnValueOnce('mock-token');

      expect(isAuthenticated()).toBe(true);
    });

    it('should return false if no token', () => {
      (localStorage.getItem as any).mockReturnValueOnce(null);

      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token successfully', async () => {
      const mockResponse = {
        valid: true,
        user: { id: 1, username: 'admin', name: 'Admin User' },
        expires_at: '2025-12-31',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verifyToken('valid-token');

      expect(result).toEqual(mockResponse);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid token', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Token inválido' }),
      });

      await expect(verifyToken('invalid-token')).rejects.toThrow('Token inválido');
    });

    it('should handle expired token', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Token expirado' }),
      });

      await expect(verifyToken('expired-token')).rejects.toThrow('Token expirado');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      (localStorage.getItem as any).mockReturnValueOnce('current-token');

      const mockResponse = {
        success: true,
        message: 'Senha alterada com sucesso',
        token: 'new-token',
        expires_at: '2025-12-31',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await changePassword('oldPass123', 'newPass456');

      expect(result).toEqual(mockResponse);
      expect(localStorage.setItem).toHaveBeenCalledWith('admin_token', 'new-token');
    });

    it('should reject wrong current password', async () => {
      (localStorage.getItem as any).mockReturnValueOnce('current-token');

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Senha atual incorreta' }),
      });

      await expect(changePassword('wrongPass', 'newPass456')).rejects.toThrow('Senha atual incorreta');
    });

    it('should throw error if not authenticated', async () => {
      (localStorage.getItem as any).mockReturnValueOnce(null);

      await expect(changePassword('oldPass', 'newPass')).rejects.toThrow('Usuário não autenticado');
    });

    it('should update token after password change', async () => {
      (localStorage.getItem as any).mockReturnValueOnce('old-token');

      const mockResponse = {
        success: true,
        message: 'Senha alterada',
        token: 'updated-token',
        expires_at: '2025-12-31',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await changePassword('current', 'new');

      expect(localStorage.setItem).toHaveBeenCalledWith('admin_token', 'updated-token');
    });
  });

  describe('getAuthHeader', () => {
    it('should return authorization header when token exists', () => {
      (localStorage.getItem as any).mockReturnValueOnce('bearer-token');

      const headers = getAuthHeader();

      expect(headers).toEqual({ Authorization: 'Bearer bearer-token' });
    });

    it('should return empty object when no token', () => {
      (localStorage.getItem as any).mockReturnValueOnce(null);

      const headers = getAuthHeader();

      expect(headers).toEqual({});
    });
  });
});
