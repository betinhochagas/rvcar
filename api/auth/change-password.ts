import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, isOptionsRequest } from '../lib/cors.js';
import { sendResponse, sendError, getJsonBody } from '../lib/response.js';
import { changePasswordSchema, formatZodError } from '../lib/validator.js';
import { 
  validateToken,
  verifyPassword,
  updateUserPassword,
  revokeUserTokens,
  createToken
} from '../lib/auth.js';
import { logPasswordChange } from '../lib/logger.js';

/**
 * Handler principal para /api/auth/change-password
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
 * POST /api/auth/change-password
 * Altera senha do usuário autenticado
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  try {
    // Parse do body
    const body = getJsonBody(req);
    
    if (!body) {
      return sendError(res, req, 'Dados inválidos', 400);
    }

    // Validar com Zod
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return sendError(res, req, formatZodError(validation.error), 400);
    }

    const { token, current_password, new_password } = validation.data;

    // Validar token
    const user = await validateToken(token);

    if (!user) {
      return sendError(res, req, 'Token inválido ou expirado', 401);
    }

    // Verificar senha atual
    const passwordValid = await verifyPassword(current_password, user.password);

    if (!passwordValid) {
      return sendError(res, req, 'Senha atual incorreta', 401);
    }

    // Atualizar senha
    const updated = await updateUserPassword(user.id, new_password);

    if (!updated) {
      return sendError(res, req, 'Erro ao atualizar senha', 500);
    }

    // Revogar todos os tokens antigos
    await revokeUserTokens(user.id);

    // Gerar novo token
    const newToken = await createToken(user.id);

    // Log de segurança
    await logPasswordChange(user.id, user.username, req);

    return sendResponse(
      res, req,
      {
        success: true,
        message: 'Senha alterada com sucesso',
        token: newToken.token,
        expires_at: newToken.expires_at,
      },
      200
    );
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}
