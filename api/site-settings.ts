import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, isOptionsRequest, applyCorsHeaders } from './lib/cors';
import { sendResponse, sendError, getJsonBody, validateContentType } from './lib/response';
import { siteSettingSchema, formatZodError } from './lib/validator';
import { validateToken, extractTokenFromHeader } from './lib/auth';
import { logCrudOperation } from './lib/logger';
import { readJsonFile, writeJsonFile, getDataPath } from './lib/file-ops';
import type { SiteSetting, SiteSettingsData } from './types/settings';

const SETTINGS_FILE = getDataPath('site-settings.json');

/**
 * Converte formato interno para formato de resposta
 */
function convertToResponseFormat(data: SiteSettingsData): SiteSetting[] {
  const settings: SiteSetting[] = [];
  
  for (const key in data) {
    settings.push({
      config_key: key,
      config_value: data[key].value,
      config_type: data[key].type as SiteSetting['config_type'],
      description: data[key].description,
    });
  }
  
  return settings;
}

/**
 * Handler principal para /api/site-settings
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
 * GET /api/site-settings
 * Lista todas as configurações (público para GET)
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
  try {
    const data = await readJsonFile<SiteSettingsData>(SETTINGS_FILE);
    const settings = convertToResponseFormat(data);
    
    // Filtros opcionais via query params
    const key = req.query.key as string | undefined;
    const category = req.query.category as string | undefined;

    if (key) {
      const setting = settings.find((s) => s.config_key === key);
      if (!setting) {
        return sendError(res, req, 'Configuração não encontrada', 404);
      }
      return sendResponse(res, req, setting, 200);
    }

    if (category) {
      const filtered = settings.filter((s) => s.config_key.startsWith(category + '_'));
      return sendResponse(res, req, filtered, 200);
    }

    return sendResponse(res, req, settings, 200);
  } catch (error) {
    console.error('Erro ao listar configurações:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}

/**
 * POST /api/site-settings
 * Cria configurações (batch ou single) - requer autenticação
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  try {
    // Verificar autenticação
    const authHeader = req.headers.authorization as string | undefined;
    const token = extractTokenFromHeader(authHeader || null);

    if (!token) {
      return sendError(res, req, 'Token de autenticação necessário', 401);
    }

    const user = await validateToken(token);

    if (!user) {
      return sendError(res, req, 'Token inválido ou expirado', 401);
    }

    // Validar Content-Type
    if (!validateContentType(req)) {
      return sendError(res, req, 'Content-Type deve ser application/json', 415);
    }

    // Parse do body
    const body = getJsonBody(req);
    
    if (!body) {
      return sendError(res, req, 'Dados inválidos', 400);
    }

    // Detectar se é batch ou single
    const isBatch = Array.isArray(body);
    const settingsToCreate = isBatch ? body : [body];

    // Validar cada configuração
    for (const setting of settingsToCreate) {
      const validation = siteSettingSchema.safeParse(setting);
      if (!validation.success) {
        return sendError(res, req, formatZodError(validation.error), 400);
      }
    }

    // Ler dados atuais
    const data = await readJsonFile<SiteSettingsData>(SETTINGS_FILE);

    // Atualizar/criar configurações
    for (const setting of settingsToCreate) {
      data[setting.config_key] = {
        value: setting.config_value,
        type: setting.config_type || 'text',
        description: setting.description || (data[setting.config_key]?.description || ''),
      };
    }

    // Salvar
    await writeJsonFile(SETTINGS_FILE, data, 0o600);

    // Log da operação
    await logCrudOperation(
      'site-settings',
      isBatch ? 'create-batch' : 'create',
      isBatch ? undefined : settingsToCreate[0].config_key,
      user.id,
      req
    );

    return sendResponse(
      res, req,
      {
        success: true,
        message: isBatch ? 'Configurações salvas com sucesso' : 'Configuração salva',
        data: settingsToCreate,
      },
      200
    );
  } catch (error) {
    console.error('Erro ao criar configurações:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}
