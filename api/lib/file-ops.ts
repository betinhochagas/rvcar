/**
 * File Operations - Operações com arquivos JSON
 * 
 * Versão simplificada para Railway usando arquivos locais
 */

import fs from 'fs/promises';
import path from 'path';

// Lock simples em memória
const locks = new Map<string, Promise<void>>();

async function lock(lockPath: string): Promise<void> {
  while (locks.has(lockPath)) {
    await locks.get(lockPath);
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  let resolver: () => void;
  const lockPromise = new Promise<void>(resolve => {
    resolver = resolve;
  });
  locks.set(lockPath, lockPromise);
  
  // Auto-unlock após 10s (safety)
  setTimeout(() => {
    unlock(lockPath);
  }, 10000);
}

async function unlock(lockPath: string): Promise<void> {
  locks.delete(lockPath);
}

/**
 * Obtém caminho base para dados
 */
export function getDataPath(filename?: string): string {
  const dataDir = path.join(process.cwd(), 'data');
  return filename ? path.join(dataDir, filename) : dataDir;
}

/**
 * Obtém caminho base para uploads
 */
export function getUploadPath(subdir?: string): string {
  const uploadDir = path.join(process.cwd(), 'uploads');
  return subdir ? path.join(uploadDir, subdir) : uploadDir;
}

/**
 * Lê arquivo JSON
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
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
 * Escreve arquivo JSON com lock
 */
export async function writeJsonFile<T>(
  filePath: string,
  data: T,
  permissions: number = 0o600
): Promise<boolean> {
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
 * Atualiza arquivo JSON de forma segura
 */
export async function updateJsonFile<T>(
  filePath: string,
  updater: (current: T) => T | Promise<T>,
  defaultValue: T
): Promise<T | null> {
  const lockPath = `${filePath}.lock`;
  
  try {
    await lock(lockPath);

    try {
      const current = await readJsonFile<T>(filePath) || defaultValue;
      const updated = await updater(current);
      
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true, mode: 0o700 });
      
      const json = JSON.stringify(updated, null, 2);
      await fs.writeFile(filePath, json, { encoding: 'utf-8', mode: 0o600 });
      
      return updated;
    } finally {
      await unlock(lockPath);
    }
  } catch (error) {
    console.error(`Erro ao atualizar arquivo ${filePath}:`, error);
    return null;
  }
}

/**
 * Remove arquivo se existir
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    // Ignora erro se arquivo não existe
    return false;
  }
}

/**
 * Verifica se arquivo existe
 */
export async function fileExists(filePath: string): Promise<boolean> {
  return fs.access(filePath).then(() => true).catch(() => false);
}

/**
 * Lista arquivos em diretório
 */
export async function listFiles(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath);
    return entries;
  } catch {
    return [];
  }
}

/**
 * Cria diretórios necessários
 */
export async function ensureDirectories(): Promise<void> {
  const dirs = [
    getDataPath(),
    getUploadPath(),
    getUploadPath('vehicles'),
    getUploadPath('site'),
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true, mode: 0o755 });
  }
}
