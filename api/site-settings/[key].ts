import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, isOptionsRequest, applyCorsHeaders } from '../lib/cors.js';
import { sendResponse, sendError, getJsonBody, validateContentType } from '../lib/response.js';
import { validateToken, extractTokenFromHeader } from '../lib/auth.js';
import { logCrudOperation } from '../lib/logger.js';
import { readJsonFile, writeJsonFile, getDataPath } from '../lib/file-ops.js';
import type { SiteSettingsData } from '../types/settings.js';

const SETTINGS_FILE = getDataPath('site-settings.json');

/**
 * Handler principal para /api/site-settings/[key]
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (isOptionsRequest(req)) {
    return handleOptions(req, res);
  }

  // Extrair key da query
  const { key } = req.query;

  if (!key || typeof key !== 'string') {
    return sendError(res, req, 'Key inválida', 400);
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, key);
    case 'PUT':
      return handlePut(req, res, key);
    case 'DELETE':
      return handleDelete(req, res, key);
    default:
      applyCorsHeaders(res, req);
      return res.status(405).json({ error: true, message: 'Método não permitido' });
  }
}

/**
 * GET /api/site-settings/[key]
 * Busca configuração específica (público)
 */
async function handleGet(req: VercelRequest, res: VercelResponse, key: string) {
  try {
    const data = await readJsonFile<SiteSettingsData>(SETTINGS_FILE, {});

    if (!(key in data)) {
      return sendError(res, req, 'Configuração não encontrada', 404);
    }

    const setting = {
      config_key: key,
      config_value: data[key].value,
      config_type: data[key].type,
      description: data[key].description,
    };

    return sendResponse(res, req, setting, 200);
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}

/**
 * PUT /api/site-settings/[key]
 * Atualiza configuração (requer autenticação)
 */
async function handlePut(req: VercelRequest, res: VercelResponse, key: string) {
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
    const body = getJsonBody<Record<string, any>>(req);
    
    if (!body) {
      return sendError(res, req, 'Dados inválidos', 400);
    }

    // Ler dados atuais
    const data = await readJsonFile<SiteSettingsData>(SETTINGS_FILE, {});

    // Atualizar ou criar configuração
    data[key] = {
      value: body.config_value ?? body.value ?? '',
      type: body.config_type ?? body.type ?? 'text',
      description: body.description ?? (data[key]?.description || ''),
    };

    // Salvar
    await writeJsonFile(SETTINGS_FILE, data, 0o600);

    // Log da operação
    await logCrudOperation('site-settings', 'update', key, user.id, req);

    const setting = {
      config_key: key,
      config_value: data[key].value,
      config_type: data[key].type,
      description: data[key].description,
    };

    return sendResponse(res, req, setting, 200);
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}

/**
 * DELETE /api/site-settings/[key]
 * Remove configuração (requer autenticação)
 */
async function handleDelete(req: VercelRequest, res: VercelResponse, key: string) {
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

    // Ler dados atuais
    const data = await readJsonFile<SiteSettingsData>(SETTINGS_FILE, {});

    if (!(key in data)) {
      return sendError(res, req, 'Configuração não encontrada', 404);
    }

    // Remover configuração
    delete data[key];

    // Salvar
    await writeJsonFile(SETTINGS_FILE, data, 0o600);

    // Log da operação
    await logCrudOperation('site-settings', 'delete', key, user.id, req);

    return sendResponse(
      res, req,
      { success: true, message: 'Configuração removida com sucesso' },
      200
    );
  } catch (error) {
    console.error('Erro ao remover configuração:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}
