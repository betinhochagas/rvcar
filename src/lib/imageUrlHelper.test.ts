import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getAbsoluteImageUrl, normalizeVehicleImages } from './imageUrlHelper';

describe('imageUrlHelper', () => {
  // Salvar valores originais
  const originalLocation = window.location;
  const originalEnv = import.meta.env;

  beforeEach(() => {
    // Mock window.location
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      hostname: 'localhost',
    };
  });

  afterEach(() => {
    // Restaurar valores originais
    window.location = originalLocation;
    vi.unstubAllEnvs();
  });

  describe('getAbsoluteImageUrl', () => {
    it('should return empty string for empty input', () => {
      expect(getAbsoluteImageUrl('')).toBe('');
      expect(getAbsoluteImageUrl(null as any)).toBe('');
      expect(getAbsoluteImageUrl(undefined as any)).toBe('');
    });

    it('should return absolute HTTP URLs unchanged', () => {
      const httpUrl = 'http://example.com/image.jpg';
      expect(getAbsoluteImageUrl(httpUrl)).toBe(httpUrl);
    });

    it('should return absolute HTTPS URLs unchanged', () => {
      const httpsUrl = 'https://example.com/image.jpg';
      expect(getAbsoluteImageUrl(httpsUrl)).toBe(httpsUrl);
    });

    it('should return local asset paths unchanged', () => {
      expect(getAbsoluteImageUrl('@/assets/logo.svg')).toBe('@/assets/logo.svg');
      expect(getAbsoluteImageUrl('src/assets/image.png')).toBe('src/assets/image.png');
    });

    it('should add leading slash if missing', () => {
      vi.stubEnv('DEV', true);
      window.location.hostname = 'localhost';
      
      const result = getAbsoluteImageUrl('uploads/image.jpg');
      expect(result).toBe('http://localhost:3000/uploads/image.jpg');
    });

    describe('in development mode', () => {
      beforeEach(() => {
        vi.stubEnv('DEV', true);
        vi.stubEnv('PROD', false);
      });

      it('should use localhost:3000 for localhost hostname', () => {
        window.location.hostname = 'localhost';
        const result = getAbsoluteImageUrl('/uploads/image.jpg');
        expect(result).toBe('http://localhost:3000/uploads/image.jpg');
      });

      it('should use localhost:3000 for 127.0.0.1 hostname', () => {
        window.location.hostname = '127.0.0.1';
        const result = getAbsoluteImageUrl('/uploads/image.jpg');
        expect(result).toBe('http://localhost:3000/uploads/image.jpg');
      });

      it('should use same IP for 192.168.x.x network', () => {
        window.location.hostname = '192.168.1.100';
        const result = getAbsoluteImageUrl('/uploads/image.jpg');
        expect(result).toBe('http://192.168.1.100:3000/uploads/image.jpg');
      });

      it('should use same IP for 10.x.x.x network', () => {
        window.location.hostname = '10.0.0.50';
        const result = getAbsoluteImageUrl('/uploads/image.jpg');
        expect(result).toBe('http://10.0.0.50:3000/uploads/image.jpg');
      });

      it('should fallback to localhost for unknown hostnames', () => {
        window.location.hostname = 'example.com';
        const result = getAbsoluteImageUrl('/uploads/image.jpg');
        expect(result).toBe('http://localhost:3000/uploads/image.jpg');
      });
    });

    describe('in production mode', () => {
      beforeEach(() => {
        vi.stubEnv('DEV', false);
        vi.stubEnv('PROD', true);
      });

      it('should return relative path for production', () => {
        const result = getAbsoluteImageUrl('/uploads/image.jpg');
        expect(result).toBe('/uploads/image.jpg');
      });

      it('should add leading slash in production if missing', () => {
        const result = getAbsoluteImageUrl('uploads/image.jpg');
        expect(result).toBe('/uploads/image.jpg');
      });
    });
  });

  describe('normalizeVehicleImages', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', true);
      vi.stubEnv('PROD', false);
      window.location.hostname = 'localhost';
    });

    it('should normalize image URLs for array of vehicles', () => {
      const vehicles = [
        { id: '1', name: 'Car 1', image: '/uploads/car1.jpg' },
        { id: '2', name: 'Car 2', image: '/uploads/car2.jpg' },
      ];

      const result = normalizeVehicleImages(vehicles);

      expect(result[0].image).toBe('http://localhost:3000/uploads/car1.jpg');
      expect(result[1].image).toBe('http://localhost:3000/uploads/car2.jpg');
    });

    it('should preserve other vehicle properties', () => {
      const vehicles = [
        { id: '1', name: 'Car 1', image: '/uploads/car1.jpg', price: 'R$ 500' },
      ];

      const result = normalizeVehicleImages(vehicles);

      expect(result[0].id).toBe('1');
      expect(result[0].name).toBe('Car 1');
      expect(result[0].price).toBe('R$ 500');
    });

    it('should handle empty array', () => {
      const result = normalizeVehicleImages([]);
      expect(result).toEqual([]);
    });

    it('should handle vehicles with absolute URLs', () => {
      const vehicles = [
        { id: '1', name: 'Car 1', image: 'https://example.com/car.jpg' },
      ];

      const result = normalizeVehicleImages(vehicles);

      expect(result[0].image).toBe('https://example.com/car.jpg');
    });
  });
});
