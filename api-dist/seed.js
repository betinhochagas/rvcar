import { handleOptions, isOptionsRequest, applyCorsHeaders } from './lib/cors.js';
import { sendResponse, sendError } from './lib/response.js';
import { validateToken, extractTokenFromHeader } from './lib/auth.js';
import { readJsonFile, writeJsonFile, getDataPath } from './lib/file-ops.js';
import bcrypt from 'bcryptjs';
// Dados iniciais
const INITIAL_VEHICLES = [
    {
        id: 1,
        name: "Renault Kwid",
        price: 550,
        image: "/uploads/vehicles/vehicle_default_1.jpeg",
        features: ["Econômico", "Ar Condicionado", "Direção hidráulica", "Seguro"],
        available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        name: "Fiat Mobi",
        price: 450,
        image: "/uploads/vehicles/vehicle_default_2.jpeg",
        features: ["Econômico", "Ar Condicionado", "Direção hidráulica", "Seguro"],
        available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
const INITIAL_SETTINGS = {
    site_name: { value: "RV Car Solutions", type: "text", description: "Nome do site" },
    site_title: { value: "RV Car Solutions - Locação de Veículos", type: "text", description: "Título do site" },
    site_tagline: { value: "Soluções em locação de veículos", type: "text", description: "Tagline do site" },
    contact_phone: { value: "(11) 99999-9999", type: "text", description: "Telefone de contato" },
    contact_whatsapp: { value: "5511999999999", type: "text", description: "WhatsApp de contato" },
    contact_email: { value: "contato@rvcarsolutions.com.br", type: "text", description: "E-mail de contato" },
    contact_address: { value: "São Paulo, SP", type: "text", description: "Endereço" },
    site_logo: { value: "/logo.svg", type: "image", description: "Logo do site" },
    site_favicon: { value: "/favicon.ico", type: "image", description: "Favicon do site" },
    og_title: { value: "RV Car Solutions - Aluguel de Veículos", type: "text", description: "Título Open Graph" },
    og_description: { value: "Aluguel de veículos com as melhores condições do mercado.", type: "text", description: "Descrição Open Graph" }
};
const VEHICLES_FILE = getDataPath('vehicles.json');
const SETTINGS_FILE = getDataPath('site-settings.json');
const USERS_FILE = getDataPath('admin-users.json');
const TOKENS_FILE = getDataPath('admin-tokens.json');
const RATE_LIMITS_FILE = getDataPath('rate-limits.json');
/**
 * Handler principal para /api/seed
 */
export default async function handler(req, res) {
    // CORS preflight
    if (isOptionsRequest(req)) {
        return handleOptions(req, res);
    }
    switch (req.method) {
        case 'GET':
            return handleGet(req, res);
        case 'POST':
            return handlePost(req, res);
        default:
            applyCorsHeaders(res, req);
            return res.status(405).json({ error: true, message: 'Método não permitido' });
    }
}
/**
 * POST /api/seed
 * Inicializa dados usando arquivos JSON
 */
async function handlePost(req, res) {
    try {
        // Verificar secret key ou autenticação
        const secretKey = req.headers['x-seed-secret'];
        const expectedSecret = process.env.SEED_SECRET_KEY;
        // Se não tiver secret, verificar autenticação admin
        if (!secretKey || secretKey !== expectedSecret) {
            const authHeader = req.headers.authorization;
            const token = extractTokenFromHeader(authHeader || null);
            if (!token) {
                return sendError(res, req, 'Não autorizado. Use X-Seed-Secret header ou autenticação admin.', 401);
            }
            const user = await validateToken(token);
            if (!user) {
                return sendError(res, req, 'Token inválido', 401);
            }
        }
        // Verificar parâmetro force
        const force = req.query.force === 'true';
        // Verificar se já existem dados
        const existingVehicles = await readJsonFile(VEHICLES_FILE);
        if (existingVehicles.length > 0 && !force) {
            return sendResponse(res, req, {
                success: false,
                message: 'Dados já existem. Use ?force=true para sobrescrever.',
                existing: {
                    vehicles: existingVehicles.length
                }
            }, 200);
        }
        // Criar usuário admin padrão se não existir
        const existingUsers = await readJsonFile(USERS_FILE);
        let adminCreated = false;
        if (existingUsers.length === 0 || force) {
            const hashedPassword = await bcrypt.hash('rvcar2024', 10);
            const adminUser = {
                id: 1,
                username: 'admin',
                password: hashedPassword,
                name: 'Administrador',
                must_change_password: true,
                created_at: new Date().toISOString()
            };
            await writeJsonFile(USERS_FILE, [adminUser]);
            adminCreated = true;
        }
        // Salvar dados iniciais
        await writeJsonFile(VEHICLES_FILE, INITIAL_VEHICLES);
        await writeJsonFile(SETTINGS_FILE, INITIAL_SETTINGS);
        await writeJsonFile(TOKENS_FILE, []);
        await writeJsonFile(RATE_LIMITS_FILE, {});
        return sendResponse(res, req, {
            success: true,
            message: 'Dados inicializados com sucesso',
            data: {
                vehicles: INITIAL_VEHICLES.length,
                settings: Object.keys(INITIAL_SETTINGS).length,
                admin_created: adminCreated
            },
            credentials: adminCreated ? {
                username: 'admin',
                password: 'rvcar2024',
                note: 'Troque a senha no primeiro login!'
            } : undefined
        }, 200);
    }
    catch (error) {
        console.error('Erro ao inicializar dados:', error);
        return sendError(res, req, `Erro ao inicializar: ${error instanceof Error ? error.message : error}`, 500);
    }
}
/**
 * GET /api/seed
 * Verifica status do seed
 */
async function handleGet(req, res) {
    try {
        // Verificar dados existentes
        const vehicles = await readJsonFile(VEHICLES_FILE);
        const settings = await readJsonFile(SETTINGS_FILE);
        const users = await readJsonFile(USERS_FILE);
        return sendResponse(res, req, {
            success: true,
            storage: 'file',
            data: {
                vehicles: vehicles.length,
                settings: settings ? Object.keys(settings).length : 0,
                users: users.length
            }
        }, 200);
    }
    catch (error) {
        console.error('Erro ao verificar seed:', error);
        return sendError(res, req, `Erro: ${error instanceof Error ? error.message : error}`, 500);
    }
}
