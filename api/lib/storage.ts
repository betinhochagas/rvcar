/**
 * Storage Module - Abstração para persistência de dados
 * 
 * Em desenvolvimento: usa arquivos JSON locais
 * Em produção (Vercel): usa Vercel KV (Redis)
 */

import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';

// Detectar ambiente
const isVercel = process.env.VERCEL === '1';
const hasKV = !!process.env.KV_REST_API_URL;

/**
 * Lê dados do storage
 */
export async function getData<T>(key: string, defaultValue: T): Promise<T> {
  // Em produção com KV configurado
  if (isVercel && hasKV) {
    try {
      const data = await kv.get<T>(key);
      if (data !== null && data !== undefined) {
        return data;
      }
      // Se não existe no KV, inicializar com valor padrão
      await kv.set(key, defaultValue);
      return defaultValue;
    } catch (error) {
      console.error(`[Storage] Erro ao ler KV (${key}):`, error);
      return defaultValue;
    }
  }

  // Em desenvolvimento: usar arquivo JSON local
  try {
    const filePath = getLocalPath(key);
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    
    if (!exists) {
      return defaultValue;
    }

    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`[Storage] Erro ao ler arquivo (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Salva dados no storage
 */
export async function setData<T>(key: string, data: T): Promise<boolean> {
  // Em produção com KV configurado
  if (isVercel && hasKV) {
    try {
      await kv.set(key, data);
      return true;
    } catch (error) {
      console.error(`[Storage] Erro ao salvar KV (${key}):`, error);
      return false;
    }
  }

  // Em desenvolvimento: salvar arquivo JSON local
  try {
    const filePath = getLocalPath(key);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`[Storage] Erro ao salvar arquivo (${key}):`, error);
    return false;
  }
}

/**
 * Atualiza dados no storage de forma atômica
 */
export async function updateData<T>(
  key: string, 
  defaultValue: T,
  updater: (current: T) => T | Promise<T>
): Promise<T | null> {
  try {
    const current = await getData<T>(key, defaultValue);
    const updated = await updater(current);
    const success = await setData(key, updated);
    return success ? updated : null;
  } catch (error) {
    console.error(`[Storage] Erro ao atualizar (${key}):`, error);
    return null;
  }
}

/**
 * Remove dados do storage
 */
export async function deleteData(key: string): Promise<boolean> {
  // Em produção com KV configurado
  if (isVercel && hasKV) {
    try {
      await kv.del(key);
      return true;
    } catch (error) {
      console.error(`[Storage] Erro ao deletar KV (${key}):`, error);
      return false;
    }
  }

  // Em desenvolvimento: deletar arquivo
  try {
    const filePath = getLocalPath(key);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`[Storage] Erro ao deletar arquivo (${key}):`, error);
    return false;
  }
}

/**
 * Verifica se o storage está disponível
 */
export async function checkStorage(): Promise<{ 
  available: boolean; 
  type: 'kv' | 'file';
  message: string;
}> {
  if (isVercel && hasKV) {
    try {
      await kv.ping();
      return { available: true, type: 'kv', message: 'Vercel KV conectado' };
    } catch (error) {
      return { 
        available: false, 
        type: 'kv', 
        message: `Erro ao conectar ao KV: ${error}` 
      };
    }
  }

  return { 
    available: true, 
    type: 'file', 
    message: 'Usando arquivos locais' 
  };
}

/**
 * Obtém caminho local do arquivo de dados
 */
function getLocalPath(key: string): string {
  // Converter chave para nome de arquivo
  const filename = `${key.replace(/[^a-zA-Z0-9-_]/g, '-')}.json`;
  return path.join(process.cwd(), 'data', filename);
}

// Storage keys constants
export const STORAGE_KEYS = {
  VEHICLES: 'vehicles',
  SITE_SETTINGS: 'site-settings',
  ADMIN_USERS: 'admin-users',
  ADMIN_TOKENS: 'admin-tokens',
  RATE_LIMITS: 'rate-limits',
} as const;
