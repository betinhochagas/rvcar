import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, isOptionsRequest } from './lib/cors.js';
import { sendResponse, sendError, getJsonBody } from './lib/response.js';
import { 
  loginSchema, 
  verifyTokenSchema, 
  changePasswordSchema, 
  formatZodError 
} from './lib/validator.js';
import { 
  findUserByUsername, 
  verifyPassword, 
  createToken,
  validateToken,
  revokeUserTokens,
  extractTokenFromHeader,
  updateUserPassword
} from './lib/auth.js';
import { 
  checkRateLimit, 
  recordAttempt, 
  getRateLimitIdentifier 
} from './lib/rate-limiter.js';
import { logLoginAttempt, logSecurityEvent, logPasswordChange } from './lib/logger.js';

/**
 * Handler principal para /api/auth
 * Usa query param 'action' para determinar a ação: login, logout, verify, change-password
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (isOptionsRequest(req)) {
    return handleOptions(req, res);
  }

  if (req.method !== 'POST') {
    return sendError(res, req, 'Método não permitido', 405);
  }

  // Determinar ação pela query string
  const action = req.query.action as string;

  switch (action) {
    case 'login':
      return handleLogin(req, res);
    case 'logout':
      return handleLogout(req, res);
    case 'verify':
      return handleVerify(req, res);
    case 'change-password':
      return handleChangePassword(req, res);
    default:
      return sendError(res, req, 'Ação não especificada. Use ?action=login|logout|verify|change-password', 400);
  }
}

/**
 * POST /api/auth?action=login
 * Autentica usuário e retorna token
 */
async function handleLogin(req: VercelRequest, res: VercelResponse) {
  try {
    const body = getJsonBody(req);
    
    if (!body) {
      return sendError(res, req, 'Dados inválidos', 400);
    }

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
      await recordAttempt(rateLimitId, false, req);
      await logLoginAttempt(username, false, 'Usuário não encontrado', req);
      return sendError(res, req, 'Usuário ou senha incorretos', 401);
    }

    // Verificar senha
    const passwordValid = await verifyPassword(password, user.password);

    if (!passwordValid) {
      await recordAttempt(rateLimitId, false, req);
      await logLoginAttempt(username, false, 'Senha incorreta', req);
      return sendError(res, req, 'Usuário ou senha incorretos', 401);
    }

    // Login bem-sucedido
    await recordAttempt(rateLimitId, true, req);
    await logLoginAttempt(username, true, '', req);

    // Gerar token
    const token = await createToken(user.id);
    const mustChangePassword = user.must_change_password === true;

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

/**
 * POST /api/auth?action=logout
 * Revoga o token do usuário
 */
async function handleLogout(req: VercelRequest, res: VercelResponse) {
  try {
    const authHeader = req.headers.authorization as string | undefined;
    const token = extractTokenFromHeader(authHeader || null);

    if (!token) {
      return sendError(res, req, 'Token não fornecido', 401);
    }

    const user = await validateToken(token);

    if (!user) {
      return sendError(res, req, 'Token inválido ou expirado', 401);
    }

    await revokeUserTokens(user.id);

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

/**
 * POST /api/auth?action=verify
 * Verifica validade de um token
 */
async function handleVerify(req: VercelRequest, res: VercelResponse) {
  try {
    const body = getJsonBody(req);
    
    if (!body) {
      return sendError(res, req, 'Dados inválidos', 400);
    }

    const validation = verifyTokenSchema.safeParse(body);
    if (!validation.success) {
      return sendError(res, req, formatZodError(validation.error), 400);
    }

    const { token } = validation.data;
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

/**
 * POST /api/auth?action=change-password
 * Altera senha do usuário autenticado
 */
async function handleChangePassword(req: VercelRequest, res: VercelResponse) {
  try {
    const body = getJsonBody(req);
    
    if (!body) {
      return sendError(res, req, 'Dados inválidos', 400);
    }

    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return sendError(res, req, formatZodError(validation.error), 400);
    }

    const { token, current_password, new_password } = validation.data;
    const user = await validateToken(token);

    if (!user) {
      return sendError(res, req, 'Token inválido ou expirado', 401);
    }

    const passwordValid = await verifyPassword(current_password, user.password);

    if (!passwordValid) {
      return sendError(res, req, 'Senha atual incorreta', 401);
    }

    const updated = await updateUserPassword(user.id, new_password);

    if (!updated) {
      return sendError(res, req, 'Erro ao atualizar senha', 500);
    }

    await revokeUserTokens(user.id);
    const newToken = await createToken(user.id);
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
