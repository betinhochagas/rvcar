import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { readJsonFile, writeJsonFile, getDataPath } from './file-ops.js';
const USERS_FILE = getDataPath('admin-users.json');
const TOKENS_FILE = getDataPath('admin-tokens.json');
/**
 * Lê usuários do arquivo
 */
export async function readUsers() {
    const users = await readJsonFile(USERS_FILE);
    // Se não existir usuário, criar admin padrão
    if (!users || users.length === 0) {
        // Usar ADMIN_PASSWORD da variável de ambiente ou gerar aleatória
        const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const defaultUser = {
            id: 1,
            username: 'admin',
            password: hashedPassword,
            name: 'Administrador',
            must_change_password: !process.env.ADMIN_PASSWORD, // Só exige troca se for senha gerada
            created_at: new Date().toISOString(),
        };
        await writeUsers([defaultUser]);
        // Log da senha (apenas se foi gerada automaticamente)
        console.log('=== ATENÇÃO: Usuário admin criado ===');
        console.log('Username: admin');
        if (process.env.ADMIN_PASSWORD) {
            console.log('Senha: definida via ADMIN_PASSWORD');
        }
        else {
            console.log('Senha temporária:', adminPassword);
            console.log('IMPORTANTE: Troque a senha no primeiro login!');
        }
        console.log('=====================================');
        return [defaultUser];
    }
    // Se ADMIN_PASSWORD está definida, verificar se precisa atualizar a senha
    if (process.env.ADMIN_PASSWORD && users.length > 0) {
        const admin = users.find(u => u.username === 'admin');
        if (admin) {
            // Verificar se a senha atual é diferente da variável de ambiente
            const passwordMatches = await bcrypt.compare(process.env.ADMIN_PASSWORD, admin.password);
            if (!passwordMatches) {
                // Atualizar senha do admin com a da variável de ambiente
                admin.password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
                admin.must_change_password = false;
                await writeUsers(users);
                console.log('🔐 Senha do admin atualizada via ADMIN_PASSWORD');
            }
        }
    }
    return users;
}
/**
 * Escreve usuários no arquivo
 */
export async function writeUsers(users) {
    await writeJsonFile(USERS_FILE, users, 0o600);
}
/**
 * Lê tokens do arquivo
 */
export async function readTokens() {
    return await readJsonFile(TOKENS_FILE);
}
/**
 * Escreve tokens no arquivo
 */
export async function writeTokens(tokens) {
    await writeJsonFile(TOKENS_FILE, tokens, 0o600);
}
/**
 * Busca usuário por username
 */
export async function findUserByUsername(username) {
    const users = await readUsers();
    return users.find((u) => u.username === username) || null;
}
/**
 * Busca usuário por ID
 */
export async function findUserById(id) {
    const users = await readUsers();
    return users.find((u) => u.id === id) || null;
}
/**
 * Verifica senha
 */
export async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}
/**
 * Gera hash de senha
 */
export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}
/**
 * Gera token aleatório
 */
export function generateToken() {
    return crypto.randomBytes(32).toString('hex'); // 64 caracteres
}
/**
 * Cria e salva novo token para usuário
 */
export async function createToken(adminId) {
    const token = generateToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    const newToken = {
        admin_id: adminId,
        token,
        expires_at: expiresAt.toISOString(),
        created_at: now.toISOString(),
    };
    const tokens = await readTokens();
    tokens.push(newToken);
    await writeTokens(tokens);
    // Limpar tokens expirados
    await cleanExpiredTokens();
    return newToken;
}
/**
 * Valida token e retorna dados do usuário
 */
export async function validateToken(token) {
    const tokens = await readTokens();
    const validToken = tokens.find((t) => t.token === token);
    if (!validToken) {
        return null;
    }
    // Verificar se expirou
    if (new Date(validToken.expires_at) < new Date()) {
        return null;
    }
    // Buscar usuário
    return await findUserById(validToken.admin_id);
}
/**
 * Revoga todos os tokens de um usuário
 */
export async function revokeUserTokens(adminId) {
    const tokens = await readTokens();
    const filteredTokens = tokens.filter((t) => t.admin_id !== adminId);
    await writeTokens(filteredTokens);
}
/**
 * Limpa tokens expirados
 */
export async function cleanExpiredTokens() {
    const tokens = await readTokens();
    const now = new Date();
    const validTokens = tokens.filter((t) => new Date(t.expires_at) > now);
    if (validTokens.length < tokens.length) {
        await writeTokens(validTokens);
    }
}
/**
 * Extrai token do header Authorization
 */
export function extractTokenFromHeader(authHeader) {
    if (!authHeader) {
        return null;
    }
    return authHeader.replace('Bearer ', '');
}
/**
 * Atualiza senha do usuário
 */
export async function updateUserPassword(userId, newPassword) {
    const users = await readUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
        return false;
    }
    const hashedPassword = await hashPassword(newPassword);
    users[userIndex].password = hashedPassword;
    users[userIndex].must_change_password = false;
    users[userIndex].updated_at = new Date().toISOString();
    await writeUsers(users);
    return true;
}
