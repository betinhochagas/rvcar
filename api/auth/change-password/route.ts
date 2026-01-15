import { NextRequest } from 'next/server';
import { handleOptions } from '../../lib/cors';
import { sendResponse, sendError, parseJsonBody } from '../../lib/response';
import { changePasswordSchema, formatZodError } from '../../lib/validator';
import { 
  validateToken,
  verifyPassword,
  updateUserPassword,
  revokeUserTokens,
  createToken
} from '../../lib/auth';
import { logPasswordChange } from '../../lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/auth/change-password
 * Altera senha do usuário autenticado
 */
export async function POST(request: NextRequest) {
  try {
    // Parse do body
    const body = await parseJsonBody(request);
    
    if (!body) {
      return sendError('Dados inválidos', request, 400);
    }

    // Validar com Zod
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return sendError(formatZodError(validation.error), request, 400);
    }

    const { token, current_password, new_password } = validation.data;

    // Validar token
    const user = await validateToken(token);

    if (!user) {
      return sendError('Token inválido ou expirado', request, 401);
    }

    // Verificar senha atual
    const passwordValid = await verifyPassword(current_password, user.password);

    if (!passwordValid) {
      return sendError('Senha atual incorreta', request, 401);
    }

    // Atualizar senha
    const updated = await updateUserPassword(user.id, new_password);

    if (!updated) {
      return sendError('Erro ao atualizar senha', request, 500);
    }

    // Revogar todos os tokens antigos
    await revokeUserTokens(user.id);

    // Gerar novo token
    const newToken = await createToken(user.id);

    // Log de segurança
    await logPasswordChange(user.id, user.username, request);

    return sendResponse(
      {
        success: true,
        message: 'Senha alterada com sucesso',
        token: newToken.token,
        expires_at: newToken.expires_at,
      },
      request,
      200
    );
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * OPTIONS /api/auth/change-password
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}
