import fs from 'fs/promises';
import path from 'path';
import { getData, setData, STORAGE_KEYS } from './storage';

// Detectar ambiente
const isVercel = process.env.VERCEL === '1';
const hasKV = !!process.env.KV_REST_API_URL;

// Lockfile alternativo - implementação simplificada
const locks = new Map<string, Promise<void>>();

async function lock(_lockPath: string): Promise<void> {
  while (locks.has(_lockPath)) {
    await locks.get(_lockPath);
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  const lockPromise = new Promise<void>(resolve => {
    setTimeout(() => resolve(), 10000); // Timeout de 10s
  });
  locks.set(_lockPath, lockPromise);
}

async function unlock(_lockPath: string): Promise<void> {
  locks.delete(_lockPath);
}

/**
 * Converte caminho de arquivo para chave de storage
 */
function filePathToStorageKey(filePath: string): string {
  const basename = path.basename(filePath, '.json');
  
  // Mapear nomes de arquivo para chaves de storage
  const keyMap: Record<string, string> = {
    'vehicles': STORAGE_KEYS.VEHICLES,
    'site-settings': STORAGE_KEYS.SITE_SETTINGS,
    'admin-users': STORAGE_KEYS.ADMIN_USERS,
    'admin-tokens': STORAGE_KEYS.ADMIN_TOKENS,
    'rate-limits': STORAGE_KEYS.RATE_LIMITS,
  };

  return keyMap[basename] || basename;
}

/**
 * Lê arquivo JSON - usa KV em produção, arquivo local em dev
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  // Em produção com KV: usar storage abstrato
  if (isVercel && hasKV) {
    const key = filePathToStorageKey(filePath);
    const defaultValue = [] as unknown as T;
    return await getData<T>(key, defaultValue);
  }

  // Em desenvolvimento ou sem KV: usar arquivo local
  try {
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!exists) {
      return [] as unknown as T;
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data as T;
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}:`, error);
    return [] as unknown as T;
  }
}

/**
 * Escreve arquivo JSON - usa KV em produção, arquivo local em dev
 */
export async function writeJsonFile<T>(
  filePath: string,
  data: T,
  permissions: number = 0o600
): Promise<boolean> {
  // Em produção com KV: usar storage abstrato
  if (isVercel && hasKV) {
    const key = filePathToStorageKey(filePath);
    return await setData(key, data);
  }

  // Em desenvolvimento ou sem KV: usar arquivo local
  const lockPath = `${filePath}.lock`;
  
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });

    await lock(lockPath);

    try {
      const json = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, json, { encoding: 'utf-8', mode: permissions });
      return true;
    } finally {
      await unlock(lockPath);
    }
  } catch (error) {
    console.error(`Erro ao escrever arquivo ${filePath}:`, error);
    return false;
  }
}

/**
 * Atualiza arquivo JSON de forma atômica
 */
export async function updateJsonFile<T, R>(
  filePath: string,
  callback: (data: T) => R | Promise<R>,
  permissions: number = 0o600
): Promise<R | null> {
  // Em produção com KV: usar storage abstrato
  if (isVercel && hasKV) {
    const key = filePathToStorageKey(filePath);
    const defaultValue = [] as unknown as T;
    
    try {
      const current = await getData<T>(key, defaultValue);
      const result = await callback(current);
      await setData(key, current);
      return result;
    } catch (error) {
      console.error(`Erro ao atualizar KV (${key}):`, error);
      return null;
    }
  }

  // Em desenvolvimento ou sem KV: usar arquivo local
  const lockPath = `${filePath}.lock`;
  
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });

    await lock(lockPath);

    try {
      let data: T;
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      
      if (exists) {
        const content = await fs.readFile(filePath, 'utf-8');
        data = JSON.parse(content);
      } else {
        data = (Array.isArray({}) ? [] : {}) as T;
      }

      // Executar callback
      const result = await callback(data);

      // Escrever dados atualizados
      const json = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, json, { encoding: 'utf-8', mode: permissions });

      return result;
    } finally {
      // Sempre liberar lock
      await unlock(lockPath);
    }
  } catch (error) {
    console.error(`Erro ao atualizar arquivo ${filePath}:`, error);
    return null;
  }
}

/**
 * Retorna o caminho absoluto para arquivos de dados
 */
export function getDataPath(filename: string): string {
  // Em produção Vercel, usar /tmp para dados temporários
  // Em desenvolvimento, usar ./data
  const isVercel = process.env.VERCEL === '1';
  
  if (isVercel) {
    return path.join('/tmp', 'data', filename);
  }
  
  return path.join(process.cwd(), 'data', filename);
}

/**
 * Retorna o caminho absoluto para arquivos de logs
 */
export function getLogPath(filename: string): string {
  const isVercel = process.env.VERCEL === '1';
  
  if (isVercel) {
    return path.join('/tmp', 'logs', filename);
  }
  
  return path.join(process.cwd(), 'logs', filename);
}

/**
 * Retorna o caminho absoluto para arquivos de upload
 */
export function getUploadPath(...segments: string[]): string {
  const isVercel = process.env.VERCEL === '1';
  
  if (isVercel) {
    // No Vercel, uploads devem ir para /tmp (temporário)
    // ou usar Vercel Blob Storage para persistência
    return path.join('/tmp', 'uploads', ...segments);
  }
  
  return path.join(process.cwd(), 'uploads', ...segments);
}
