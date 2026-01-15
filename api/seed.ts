import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { handleOptions, isOptionsRequest, applyCorsHeaders } from './lib/cors';
import { sendResponse, sendError } from './lib/response';
import { validateToken, extractTokenFromHeader } from './lib/auth';
import { STORAGE_KEYS } from './lib/storage';
import bcrypt from 'bcryptjs';

// Dados iniciais
const INITIAL_VEHICLES = [
  {
    id: 1,
    name: "Renault Kwid",
    price: 550,
    image: "/uploads/vehicles/vehicle_6967f6694743b0.51458340.jpeg",
    features: ["Econômico", "Ar Condicionado", "Direção hidráulica", "Seguro"],
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Renault Kwid",
    price: 450,
    image: "/uploads/vehicles/vehicle_6967f6807684d8.55573768.jpeg",
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

/**
 * Handler principal para /api/seed
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
 * Inicializa dados no Vercel KV
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  try {
    // Verificar se KV está disponível
    if (!process.env.KV_REST_API_URL) {
      return sendError(res, req, 'Vercel KV não configurado', 500);
    }

    // Verificar secret key ou autenticação
    const secretKey = req.headers['x-seed-secret'] as string | undefined;
    const expectedSecret = process.env.SEED_SECRET_KEY;

    // Se não tiver secret, verificar autenticação admin
    if (!secretKey || secretKey !== expectedSecret) {
      const authHeader = req.headers.authorization as string | undefined;
      const token = extractTokenFromHeader(authHeader || null);

      if (!token) {
        return sendError(res, req, 'Não autorizado', 401);
      }

      const user = await validateToken(token);
      if (!user) {
        return sendError(res, req, 'Token inválido', 401);
      }
    }

    // Verificar se já existem dados
    const existingVehicles = await kv.get(STORAGE_KEYS.VEHICLES);
    
    if (existingVehicles && Array.isArray(existingVehicles) && existingVehicles.length > 0) {
      return sendResponse(res, req, {
        success: false,
        message: 'Dados já existem. Use force=true para sobrescrever.',
        existing: {
          vehicles: (existingVehicles as unknown[]).length
        }
      }, 200);
    }

    // Criar usuário admin padrão se não existir
    const existingUsers = await kv.get(STORAGE_KEYS.ADMIN_USERS);
    
    if (!existingUsers || !Array.isArray(existingUsers) || existingUsers.length === 0) {
      const hashedPassword = await bcrypt.hash('rvcar2024', 10);
      const adminUser = {
        id: 1,
        username: 'admin',
        password: hashedPassword,
        name: 'Administrador',
        must_change_password: true,
        created_at: new Date().toISOString()
      };
      await kv.set(STORAGE_KEYS.ADMIN_USERS, [adminUser]);
    }

    // Salvar dados iniciais
    await kv.set(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
    await kv.set(STORAGE_KEYS.SITE_SETTINGS, INITIAL_SETTINGS);
    await kv.set(STORAGE_KEYS.ADMIN_TOKENS, []);
    await kv.set(STORAGE_KEYS.RATE_LIMITS, {});

    return sendResponse(res, req, {
      success: true,
      message: 'Dados inicializados com sucesso',
      data: {
        vehicles: INITIAL_VEHICLES.length,
        settings: Object.keys(INITIAL_SETTINGS).length,
        admin_created: true
      }
    }, 200);

  } catch (error) {
    console.error('Erro ao inicializar dados:', error);
    return sendError(res, req, `Erro ao inicializar: ${error}`, 500);
  }
}

/**
 * GET /api/seed
 * Verifica status do seed
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
  try {
    const hasKV = !!process.env.KV_REST_API_URL;

    if (!hasKV) {
      return sendResponse(res, req, {
        success: false,
        message: 'Vercel KV não configurado',
        kvConfigured: false
      }, 200);
    }

    // Verificar dados existentes
    const vehicles = await kv.get(STORAGE_KEYS.VEHICLES);
    const settings = await kv.get(STORAGE_KEYS.SITE_SETTINGS);
    const users = await kv.get(STORAGE_KEYS.ADMIN_USERS);

    return sendResponse(res, req, {
      success: true,
      kvConfigured: true,
      data: {
        vehicles: Array.isArray(vehicles) ? vehicles.length : 0,
        settings: settings ? Object.keys(settings as object).length : 0,
        users: Array.isArray(users) ? users.length : 0
      }
    }, 200);

  } catch (error) {
    console.error('Erro ao verificar seed:', error);
    return sendError(res, req, `Erro: ${error}`, 500);
  }
}
