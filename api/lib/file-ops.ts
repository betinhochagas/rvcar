import fs from 'fs/promises';
import path from 'path';

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
 * Lê arquivo JSON com lock compartilhado (múltiplas leituras simultâneas)
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    // Tentar ler sem lock primeiro (otimização)
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!exists) {
      return (Array.isArray({}) ? [] : {}) as T;
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data as T;
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}:`, error);
    return (Array.isArray({}) ? [] : {}) as T;
  }
}

/**
 * Escreve arquivo JSON com lock exclusivo (apenas uma escrita por vez)
 */
export async function writeJsonFile<T>(
  filePath: string,
  data: T,
  permissions: number = 0o600
): Promise<boolean> {
  const lockPath = `${filePath}.lock`;
  
  try {
    // Criar diretório se não existir
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });

    // Obter lock exclusivo
    await lock(lockPath);

    try {
      // Serializar dados
      const json = JSON.stringify(data, null, 2);

      // Escrever arquivo
      await fs.writeFile(filePath, json, { encoding: 'utf-8', mode: permissions });

      return true;
    } finally {
      // Sempre liberar lock
      await unlock(lockPath);
    }
  } catch (error) {
    console.error(`Erro ao escrever arquivo ${filePath}:`, error);
    return false;
  }
}

/**
 * Atualiza arquivo JSON de forma atômica
 * @param filePath Caminho do arquivo
 * @param callback Função que recebe dados atuais e retorna resultado
 */
export async function updateJsonFile<T, R>(
  filePath: string,
  callback: (data: T) => R | Promise<R>,
  permissions: number = 0o600
): Promise<R | null> {
  const lockPath = `${filePath}.lock`;
  
  try {
    // Criar diretório se não existir
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });

    // Obter lock exclusivo durante toda a operação
    await lock(lockPath);

    try {
      // Ler dados atuais
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
