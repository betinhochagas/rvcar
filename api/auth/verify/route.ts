import { NextRequest } from 'next/server';
import { handleOptions } from '../../lib/cors';
import { sendResponse, sendError, parseJsonBody } from '../../lib/response';
import { verifyTokenSchema, formatZodError } from '../../lib/validator';
import { validateToken } from '../../lib/auth';

/**
 * POST /api/auth/verify
 * Verifica validade de um token
 */
export async function POST(request: NextRequest) {
  try {
    // Parse do body
    const body = await parseJsonBody(request);
    
    if (!body) {
      return sendError('Dados inválidos', request, 400);
    }

    // Validar com Zod
    const validation = verifyTokenSchema.safeParse(body);
    if (!validation.success) {
      return sendError(formatZodError(validation.error), request, 400);
    }

    const { token } = validation.data;

    // Validar token
    const user = await validateToken(token);

    if (!user) {
      return sendError('Token inválido ou expirado', request, 401);
    }

    return sendResponse(
      {
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
        },
      },
      request,
      200
    );
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * OPTIONS /api/auth/verify
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}
