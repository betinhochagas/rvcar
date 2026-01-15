/**
 * File Operations - Operações com arquivos JSON
 *
 * Versão simplificada para Railway usando arquivos locais
 */
import fs from 'fs/promises';
import path from 'path';
// Lock simples em memória
const locks = new Map();
// Caminho base para storage (em produção usa volume persistente)
const STORAGE_BASE = process.env.NODE_ENV === 'production'
    ? '/app/storage'
    : process.cwd();
async function lock(lockPath) {
    while (locks.has(lockPath)) {
        await locks.get(lockPath);
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    let resolver;
    const lockPromise = new Promise(resolve => {
        resolver = resolve;
    });
    locks.set(lockPath, lockPromise);
    // Auto-unlock após 10s (safety)
    setTimeout(() => {
        unlock(lockPath);
    }, 10000);
}
async function unlock(lockPath) {
    locks.delete(lockPath);
}
/**
 * Obtém caminho base para dados
 */
export function getDataPath(filename) {
    const dataDir = path.join(STORAGE_BASE, 'data');
    return filename ? path.join(dataDir, filename) : dataDir;
}
/**
 * Obtém caminho base para uploads
 */
export function getUploadPath(subdir) {
    const uploadDir = path.join(STORAGE_BASE, 'uploads');
    return subdir ? path.join(uploadDir, subdir) : uploadDir;
}
/**
 * Lê arquivo JSON
 */
export async function readJsonFile(filePath, defaultValue) {
    console.log(`[readJsonFile] Lendo: ${filePath}`);
    try {
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        console.log(`[readJsonFile] Arquivo existe: ${exists}`);
        if (!exists) {
            // Se defaultValue foi fornecido, usar ele; senão retornar objeto ou array vazio
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            return {};
        }
        const content = await fs.readFile(filePath, 'utf-8');
        console.log(`[readJsonFile] Conteúdo lido: ${content.length} bytes`);
        if (!content || content.trim() === '') {
            return defaultValue !== undefined ? defaultValue : {};
        }
        let data = JSON.parse(content);
        // CORREÇÃO: Se defaultValue é objeto e data é array, converter para objeto
        if (defaultValue !== undefined && !Array.isArray(defaultValue) && Array.isArray(data)) {
            console.log(`[readJsonFile] Convertendo array para objeto`);
            data = {};
        }
        console.log(`[readJsonFile] Parse OK, tipo: ${Array.isArray(data) ? 'array' : 'object'}`);
        return data;
    }
    catch (error) {
        console.error(`[readJsonFile] ERRO ao ler arquivo ${filePath}:`, error);
        return defaultValue !== undefined ? defaultValue : {};
    }
}
/**
 * Escreve arquivo JSON com lock
 */
export async function writeJsonFile(filePath, data, permissions = 0o600) {
    const lockPath = `${filePath}.lock`;
    console.log(`[writeJsonFile] Iniciando escrita em: ${filePath}`);
    try {
        const dir = path.dirname(filePath);
        console.log(`[writeJsonFile] Criando diretório: ${dir}`);
        await fs.mkdir(dir, { recursive: true, mode: 0o700 });
        await lock(lockPath);
        try {
            const json = JSON.stringify(data, null, 2);
            console.log(`[writeJsonFile] Escrevendo ${json.length} bytes`);
            await fs.writeFile(filePath, json, { encoding: 'utf-8', mode: permissions });
            // Verificar se foi escrito
            const written = await fs.readFile(filePath, 'utf-8');
            console.log(`[writeJsonFile] Verificação: ${written.length} bytes lidos`);
            return true;
        }
        finally {
            await unlock(lockPath);
        }
    }
    catch (error) {
        console.error(`[writeJsonFile] ERRO ao escrever arquivo ${filePath}:`, error);
        return false;
    }
}
/**
 * Atualiza arquivo JSON de forma segura
 */
export async function updateJsonFile(filePath, updater, defaultValue) {
    const lockPath = `${filePath}.lock`;
    try {
        await lock(lockPath);
        try {
            const current = await readJsonFile(filePath) || defaultValue;
            const updated = await updater(current);
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true, mode: 0o700 });
            const json = JSON.stringify(updated, null, 2);
            await fs.writeFile(filePath, json, { encoding: 'utf-8', mode: 0o600 });
            return updated;
        }
        finally {
            await unlock(lockPath);
        }
    }
    catch (error) {
        console.error(`Erro ao atualizar arquivo ${filePath}:`, error);
        return null;
    }
}
/**
 * Remove arquivo se existir
 */
export async function deleteFile(filePath) {
    try {
        await fs.unlink(filePath);
        return true;
    }
    catch (error) {
        // Ignora erro se arquivo não existe
        return false;
    }
}
/**
 * Verifica se arquivo existe
 */
export async function fileExists(filePath) {
    return fs.access(filePath).then(() => true).catch(() => false);
}
/**
 * Lista arquivos em diretório
 */
export async function listFiles(dirPath) {
    try {
        const entries = await fs.readdir(dirPath);
        return entries;
    }
    catch {
        return [];
    }
}
/**
 * Cria diretórios necessários
 */
export async function ensureDirectories() {
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
