/**
 * UploadManager - Gerenciador de Upload de Imagens
 */

import { fetchWithRetry } from './fetchWithRetry';

import { getToken } from './authManager';

const getUploadApiUrl = (): string => {
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

const UPLOAD_API_BASE = getUploadApiUrl();

interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  type: string;
}

interface UploadOptions {
  type?: 'vehicle' | 'logo' | 'favicon' | 'og-image';
}

/**
 * Fazer upload de imagem
 */
export const uploadImage = async (file: File, options: UploadOptions = {}): Promise<string> => {
  const { type = 'vehicle' } = options;
  
  // Validar tipo de arquivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WebP.');
  }

  // Validar tamanho (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Máximo: 5MB');
  }

  // Criar FormData
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', type);

  // Obter token de autenticação
  const token = getToken();
  if (!token) {
    throw new Error('Autenticação necessária para upload');
  }

  // Fazer upload
  const response = await fetch(`${UPLOAD_API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao fazer upload');
  }

  const data: UploadResponse = await response.json();
  
  // Retornar URL completa da imagem
  return data.url;
};

/**
 * Validar imagem antes do upload
 */
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Arquivo muito grande. Máximo: 5MB' };
  }

  return { valid: true };
};

/**
 * Criar preview da imagem
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsDataURL(file);
  });
};
