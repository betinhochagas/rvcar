import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, isOptionsRequest } from '../lib/cors';
import { sendResponse, sendError } from '../lib/response';
import { validateToken, revokeUserTokens, extractTokenFromHeader } from '../lib/auth';
import { logSecurityEvent } from '../lib/logger';

/**
 * Handler principal para /api/auth/logout
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (isOptionsRequest(req)) {
    return handleOptions(req, res);
  }

  if (req.method !== 'POST') {
    return sendError(res, req, 'Método não permitido', 405);
  }

  return handlePost(req, res);
}

/**
 * POST /api/auth/logout
 * Revoga o token do usuário
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  try {
    // Extrair token do header
    const authHeader = req.headers.authorization as string | undefined;
    const token = extractTokenFromHeader(authHeader || null);

    if (!token) {
      return sendError(res, req, 'Token não fornecido', 401);
    }

    // Validar token
    const user = await validateToken(token);

    if (!user) {
      return sendError(res, req, 'Token inválido ou expirado', 401);
    }

    // Revogar todos os tokens do usuário
    await revokeUserTokens(user.id);

    // Log de segurança
    await logSecurityEvent(
      'Logout realizado',
      'INFO',
      {
        user_id: user.id,
        username: user.username,
        timestamp: new Date().toISOString(),
      }
    );

    return sendResponse(
      res, req,
      {
        success: true,
        message: 'Logout realizado com sucesso',
      },
      200
    );
  } catch (error) {
    console.error('Erro no logout:', error);
    
    await logSecurityEvent(
      'Erro no logout',
      'ERROR',
      {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }
    );

    return sendError(res, req, 'Erro ao realizar logout', 500);
  }
}
