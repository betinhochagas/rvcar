import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, isOptionsRequest } from '../lib/cors.js';
import { sendResponse, sendError, getJsonBody } from '../lib/response.js';
import { verifyTokenSchema, formatZodError } from '../lib/validator.js';
import { validateToken } from '../lib/auth.js';

/**
 * Handler principal para /api/auth/verify
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
 * POST /api/auth/verify
 * Verifica validade de um token
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  try {
    // Parse do body
    const body = getJsonBody(req);
    
    if (!body) {
      return sendError(res, req, 'Dados inválidos', 400);
    }

    // Validar com Zod
    const validation = verifyTokenSchema.safeParse(body);
    if (!validation.success) {
      return sendError(res, req, formatZodError(validation.error), 400);
    }

    const { token } = validation.data;

    // Validar token
    const user = await validateToken(token);

    if (!user) {
      return sendError(res, req, 'Token inválido ou expirado', 401);
    }

    return sendResponse(
      res, req,
      {
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
        },
      },
      200
    );
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}
