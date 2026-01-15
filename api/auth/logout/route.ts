import { NextRequest } from 'next/server';
import { handleOptions } from '../../lib/cors';
import { sendResponse, sendError } from '../../lib/response';
import { validateToken, revokeUserTokens, extractTokenFromHeader } from '../../lib/auth';
import { logSecurityEvent } from '../../lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/auth/logout
 * Revoga o token do usuário
 */
export async function POST(request: NextRequest) {
  try {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Extrair token do header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return sendError('Token não fornecido', request, 401);
    }

    // Validar token
    const user = await validateToken(token);

    if (!user) {
      return sendError('Token inválido ou expirado', request, 401);
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
      {
        success: true,
        message: 'Logout realizado com sucesso',
      },
      request
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

    return sendError('Erro ao realizar logout', request, 500);
  }
}
