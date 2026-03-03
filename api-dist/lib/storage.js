/**
 * Storage Module - Persistência de dados usando arquivos JSON
 *
 * Para Railway: usa arquivos JSON locais com persistência em volume
 */
import fs from 'fs/promises';
import path from 'path';
// Caminho base para storage (em produção usa volume persistente)
const STORAGE_BASE = process.env.NODE_ENV === 'production'
    ? '/app/storage'
    : process.cwd();
/**
 * Obtém caminho local do arquivo de dados
 */
function getLocalPath(key) {
    const filename = `${key.replace(/[^a-zA-Z0-9-_]/g, '-')}.json`;
    return path.join(STORAGE_BASE, 'data', filename);
}
/**
 * Lê dados do storage (arquivo JSON)
 */
export async function getData(key, defaultValue) {
    try {
        const filePath = getLocalPath(key);
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        if (!exists) {
            return defaultValue;
        }
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        console.error(`[Storage] Erro ao ler arquivo (${key}):`, error);
        return defaultValue;
    }
}
/**
 * Salva dados no storage (arquivo JSON)
 */
export async function setData(key, data) {
    try {
        const filePath = getLocalPath(key);
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    }
    catch (error) {
        console.error(`[Storage] Erro ao salvar arquivo (${key}):`, error);
        return false;
    }
}
/**
 * Atualiza dados no storage de forma atômica
 */
export async function updateData(key, defaultValue, updater) {
    try {
        const current = await getData(key, defaultValue);
        const updated = await updater(current);
        const success = await setData(key, updated);
        return success ? updated : null;
    }
    catch (error) {
        console.error(`[Storage] Erro ao atualizar (${key}):`, error);
        return null;
    }
}
/**
 * Remove dados do storage
 */
export async function deleteData(key) {
    try {
        const filePath = getLocalPath(key);
        await fs.unlink(filePath);
        return true;
    }
    catch (error) {
        console.error(`[Storage] Erro ao deletar arquivo (${key}):`, error);
        return false;
    }
}
/**
 * Verifica se o storage está disponível
 */
export async function checkStorage() {
    try {
        const dataDir = path.join(process.cwd(), 'data');
        await fs.mkdir(dataDir, { recursive: true });
        // Testar escrita
        const testFile = path.join(dataDir, '.storage-test');
        await fs.writeFile(testFile, 'ok');
        await fs.unlink(testFile);
        return {
            available: true,
            type: 'file',
            message: 'Storage de arquivos funcionando'
        };
    }
    catch (error) {
        return {
            available: false,
            type: 'file',
            message: `Erro no storage: ${error}`
        };
    }
}
// Storage keys constants
export const STORAGE_KEYS = {
    VEHICLES: 'vehicles',
    SITE_SETTINGS: 'site-settings',
    ADMIN_USERS: 'admin-users',
    ADMIN_TOKENS: 'admin-tokens',
    RATE_LIMITS: 'rate-limits',
};
