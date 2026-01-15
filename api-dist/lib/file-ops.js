import fs from 'fs/promises';
import path from 'path';
import { getData, setData, STORAGE_KEYS } from './storage.js';
// Detectar ambiente
const isVercel = process.env.VERCEL === '1';
const hasKV = !!process.env.KV_REST_API_URL;
// Lockfile alternativo - implementação simplificada
const locks = new Map();
async function lock(_lockPath) {
    while (locks.has(_lockPath)) {
        await locks.get(_lockPath);
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    const lockPromise = new Promise(resolve => {
        setTimeout(() => resolve(), 10000); // Timeout de 10s
    });
    locks.set(_lockPath, lockPromise);
}
async function unlock(_lockPath) {
    locks.delete(_lockPath);
}
/**
 * Converte caminho de arquivo para chave de storage
 */
function filePathToStorageKey(filePath) {
    const basename = path.basename(filePath, '.json');
    // Mapear nomes de arquivo para chaves de storage
    const keyMap = {
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
export async function readJsonFile(filePath) {
    // Em produção com KV: usar storage abstrato
    if (isVercel && hasKV) {
        const key = filePathToStorageKey(filePath);
        const defaultValue = [];
        return await getData(key, defaultValue);
    }
    // Em desenvolvimento ou sem KV: usar arquivo local
    try {
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        if (!exists) {
            return [];
        }
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        return data;
    }
    catch (error) {
        console.error(`Erro ao ler arquivo ${filePath}:`, error);
        return [];
    }
}
/**
 * Escreve arquivo JSON - usa KV em produção, arquivo local em dev
 */
export async function writeJsonFile(filePath, data, permissions = 0o600) {
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
        }
        finally {
            await unlock(lockPath);
        }
    }
    catch (error) {
        console.error(`Erro ao escrever arquivo ${filePath}:`, error);
        return false;
    }
}
/**
 * Atualiza arquivo JSON de forma atômica
 */
export async function updateJsonFile(filePath, callback, permissions = 0o600) {
    // Em produção com KV: usar storage abstrato
    if (isVercel && hasKV) {
        const key = filePathToStorageKey(filePath);
        const defaultValue = [];
        try {
            const current = await getData(key, defaultValue);
            const result = await callback(current);
            await setData(key, current);
            return result;
        }
        catch (error) {
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
            let data;
            const exists = await fs.access(filePath).then(() => true).catch(() => false);
            if (exists) {
                const content = await fs.readFile(filePath, 'utf-8');
                data = JSON.parse(content);
            }
            else {
                data = (Array.isArray({}) ? [] : {});
            }
            // Executar callback
            const result = await callback(data);
            // Escrever dados atualizados
            const json = JSON.stringify(data, null, 2);
            await fs.writeFile(filePath, json, { encoding: 'utf-8', mode: permissions });
            return result;
        }
        finally {
            // Sempre liberar lock
            await unlock(lockPath);
        }
    }
    catch (error) {
        console.error(`Erro ao atualizar arquivo ${filePath}:`, error);
        return null;
    }
}
/**
 * Retorna o caminho absoluto para arquivos de dados
 */
export function getDataPath(filename) {
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
export function getLogPath(filename) {
    const isVercel = process.env.VERCEL === '1';
    if (isVercel) {
        return path.join('/tmp', 'logs', filename);
    }
    return path.join(process.cwd(), 'logs', filename);
}
/**
 * Retorna o caminho absoluto para arquivos de upload
 */
export function getUploadPath(...segments) {
    const isVercel = process.env.VERCEL === '1';
    if (isVercel) {
        // No Vercel, uploads devem ir para /tmp (temporário)
        // ou usar Vercel Blob Storage para persistência
        return path.join('/tmp', 'uploads', ...segments);
    }
    return path.join(process.cwd(), 'uploads', ...segments);
}
