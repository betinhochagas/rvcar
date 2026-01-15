import { NextRequest } from 'next/server';
import { handleOptions } from '../lib/cors';
import { sendResponse, sendError, parseJsonBody, validateContentType } from '../lib/response';
import { siteSettingSchema, formatZodError } from '../lib/validator';
import { validateToken, extractTokenFromHeader } from '../lib/auth';
import { logCrudOperation } from '../lib/logger';
import { readJsonFile, writeJsonFile, getDataPath } from '../lib/file-ops';
import type { SiteSetting, SiteSettingsData } from '../types/settings';

export const runtime = 'nodejs';

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
      config_type: data[key].type as any,
      description: data[key].description,
    });
  }
  
  return settings;
}

/**
 * GET /api/site-settings
 * Lista todas as configurações (público para GET)
 */
export async function GET(request: NextRequest) {
  try {
    const data = await readJsonFile<SiteSettingsData>(SETTINGS_FILE);
    const settings = convertToResponseFormat(data);
    
    // Filtros opcionais
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const category = searchParams.get('category');

    if (key) {
      const setting = settings.find((s) => s.config_key === key);
      if (!setting) {
        return sendError('Configuração não encontrada', request, 404);
      }
      return sendResponse(setting, request, 200);
    }

    if (category) {
      const filtered = settings.filter((s) => s.config_key.startsWith(category + '_'));
      return sendResponse(filtered, request, 200);
    }

    return sendResponse(settings, request, 200);
  } catch (error) {
    console.error('Erro ao listar configurações:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * POST /api/site-settings
 * Cria configurações (batch ou single) - requer autenticação
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return sendError('Token de autenticação necessário', request, 401);
    }

    const user = await validateToken(token);

    if (!user) {
      return sendError('Token inválido ou expirado', request, 401);
    }

    // Validar Content-Type
    if (!validateContentType(request)) {
      return sendError('Content-Type deve ser application/json', request, 415);
    }

    // Parse do body
    const body = await parseJsonBody(request);
    
    if (!body) {
      return sendError('Dados inválidos', request, 400);
    }

    // Detectar se é batch ou single
    const isBatch = Array.isArray(body);
    const settingsToCreate = isBatch ? body : [body];

    // Validar cada configuração
    for (const setting of settingsToCreate) {
      const validation = siteSettingSchema.safeParse(setting);
      if (!validation.success) {
        return sendError(formatZodError(validation.error), request, 400);
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
      request
    );

    return sendResponse(
      {
        success: true,
        message: isBatch ? 'Configurações salvas com sucesso' : 'Configuração salva',
        data: settingsToCreate,
      },
      request,
      200
    );
  } catch (error) {
    console.error('Erro ao criar configurações:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * OPTIONS /api/site-settings
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}
