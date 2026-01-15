import { NextRequest } from 'next/server';
import { handleOptions } from '../../lib/cors';
import { sendResponse, sendError, parseJsonBody, validateContentType } from '../../lib/response';
import { validateToken, extractTokenFromHeader } from '../../lib/auth';
import { logCrudOperation } from '../../lib/logger';
import { readJsonFile, writeJsonFile, getDataPath } from '../../lib/file-ops';
import type { SiteSettingsData } from '../../types/settings';


const SETTINGS_FILE = getDataPath('site-settings.json');

/**
 * GET /api/site-settings/[key]
 * Busca configuração específica (público)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const data = await readJsonFile<SiteSettingsData>(SETTINGS_FILE);
    const key = params.key;

    if (!(key in data)) {
      return sendError('Configuração não encontrada', request, 404);
    }

    const setting = {
      config_key: key,
      config_value: data[key].value,
      config_type: data[key].type,
      description: data[key].description,
    };

    return sendResponse(setting, request, 200);
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * PUT /api/site-settings/[key]
 * Atualiza configuração (requer autenticação)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const key = params.key;

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
    const body = await parseJsonBody(request) as Record<string, any>;
    
    if (!body) {
      return sendError('Dados inválidos', request, 400);
    }

    // Ler dados atuais
    const data = await readJsonFile<SiteSettingsData>(SETTINGS_FILE);

    // Atualizar ou criar configuração
    data[key] = {
      value: body.config_value ?? body.value ?? '',
      type: body.config_type ?? body.type ?? 'text',
      description: body.description ?? (data[key]?.description || ''),
    };

    // Salvar
    await writeJsonFile(SETTINGS_FILE, data, 0o600);

    // Log da operação
    await logCrudOperation('site-settings', 'update', key, user.id, request);

    const setting = {
      config_key: key,
      config_value: data[key].value,
      config_type: data[key].type,
      description: data[key].description,
    };

    return sendResponse(setting, request, 200);
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * DELETE /api/site-settings/[key]
 * Remove configuração (requer autenticação)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const key = params.key;

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

    // Ler dados atuais
    const data = await readJsonFile<SiteSettingsData>(SETTINGS_FILE);

    if (!(key in data)) {
      return sendError('Configuração não encontrada', request, 404);
    }

    // Remover configuração
    delete data[key];

    // Salvar
    await writeJsonFile(SETTINGS_FILE, data, 0o600);

    // Log da operação
    await logCrudOperation('site-settings', 'delete', key, user.id, request);

    return sendResponse(
      { success: true, message: 'Configuração removida com sucesso' },
      request,
      200
    );
  } catch (error) {
    console.error('Erro ao remover configuração:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * OPTIONS /api/site-settings/[key]
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}
