import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '@/lib/vehicleManager';
import type { Vehicle } from '@/types/admin';

// Mock fetch globally
global.fetch = vi.fn();

// Mock authManager
vi.mock('@/lib/authManager', () => ({
  getAuthHeader: () => ({ Authorization: 'Bearer mock-token' }),
}));

describe('vehicleManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getVehicles', () => {
    it('should fetch and transform vehicles correctly', async () => {
      const mockApiResponse = [
        {
          id: 1,
          name: 'Fiat Mobi',
          price: 'R$ 650',
          image: '/uploads/mobi.jpg',
          features: ['Ar condicionado', 'Direção hidráulica'],
          available: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-02',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      const vehicles = await getVehicles();

      expect(vehicles).toHaveLength(1);
      expect(vehicles[0]).toMatchObject({
        id: '1',
        name: 'Fiat Mobi',
        price: 'R$ 650',
        image: '/uploads/mobi.jpg',
        features: ['Ar condicionado', 'Direção hidráulica'],
        available: true,
      });
    });

    it('should handle empty features array', async () => {
      const mockApiResponse = [
        {
          id: 1,
          name: 'Test Car',
          price: 'R$ 500',
          image: '/test.jpg',
          features: null,
          available: true,
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const vehicles = await getVehicles();

      expect(vehicles[0].features).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(getVehicles()).rejects.toThrow('HTTP 500');
    });
  });

  describe('addVehicle', () => {
    it('should create vehicle successfully', async () => {
      const newVehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'New Car',
        price: 'R$ 700',
        image: '/new.jpg',
        features: ['Feature 1'],
        available: true,
      };

      const mockResponse = {
        id: 123,
        ...newVehicle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addVehicle(newVehicle);

      expect(result.id).toBe('123');
      expect(result.name).toBe('New Car');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });
  });

  describe('updateVehicle', () => {
    it('should update vehicle successfully', async () => {
      const vehicleId = '123';
      const updates: Partial<Vehicle> = {
        name: 'Updated Car',
        price: 'R$ 800',
      };

      const mockResponse = {
        id: 123,
        name: 'Updated Car',
        price: 'R$ 800',
        image: '/test.jpg',
        features: [],
        available: true,
        updated_at: new Date().toISOString(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await updateVehicle(vehicleId, updates);

      expect(result?.name).toBe('Updated Car');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });

  describe('deleteVehicle', () => {
    it('should delete vehicle successfully', async () => {
      const vehicleId = '123';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await deleteVehicle(vehicleId);

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should throw error if delete fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      });

      await expect(deleteVehicle('999')).rejects.toThrow('HTTP 404');
    });
  });
});
