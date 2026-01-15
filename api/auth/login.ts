import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, isOptionsRequest } from '../lib/cors.js';
import { sendResponse, sendError, getJsonBody } from '../lib/response.js';
import { loginSchema, formatZodError } from '../lib/validator.js';
import { 
  findUserByUsername, 
  verifyPassword, 
  createToken 
} from '../lib/auth.js';
import { 
  checkRateLimit, 
  recordAttempt, 
  getRateLimitIdentifier 
} from '../lib/rate-limiter.js';
import { logLoginAttempt } from '../lib/logger.js';

/**
 * Handler principal para /api/auth/login
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
 * POST /api/auth/login
 * Autentica usuário e retorna token
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  try {
    // Parse do body
    const body = getJsonBody(req);
    
    if (!body) {
      return sendError(res, req, 'Dados inválidos', 400);
    }

    // Validar com Zod
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return sendError(res, req, formatZodError(validation.error), 400);
    }

    const { username, password } = validation.data;

    // Verificar rate limiting
    const rateLimitId = getRateLimitIdentifier(req, username);
    const rateCheck = await checkRateLimit(rateLimitId);

    if (!rateCheck.allowed) {
      return sendError(
        res, req,
        `Muitas tentativas de login. Tente novamente em ${rateCheck.remaining_minutes} minuto(s).`,
        429
      );
    }

    // Buscar usuário
    const user = await findUserByUsername(username);

    if (!user) {
      // Registrar tentativa falha
      await recordAttempt(rateLimitId, false, req);
      await logLoginAttempt(username, false, 'Usuário não encontrado', req);
      
      return sendError(res, req, 'Usuário ou senha incorretos', 401);
    }

    // Verificar senha
    const passwordValid = await verifyPassword(password, user.password);

    if (!passwordValid) {
      // Registrar tentativa falha
      await recordAttempt(rateLimitId, false, req);
      await logLoginAttempt(username, false, 'Senha incorreta', req);
      
      return sendError(res, req, 'Usuário ou senha incorretos', 401);
    }

    // Login bem-sucedido: limpar rate limit
    await recordAttempt(rateLimitId, true, req);
    await logLoginAttempt(username, true, '', req);

    // Gerar token
    const token = await createToken(user.id);

    // Verificar se precisa trocar senha
    const mustChangePassword = user.must_change_password === true;

    // Retornar dados do usuário e token
    return sendResponse(
      res, req,
      {
        success: true,
        token: token.token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          must_change_password: mustChangePassword,
        },
        expires_at: token.expires_at,
      },
      200
    );
  } catch (error) {
    console.error('Erro no login:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}
