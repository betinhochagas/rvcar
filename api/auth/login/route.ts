import { NextRequest } from 'next/server';
import { handleOptions } from '../../lib/cors';
import { sendResponse, sendError, parseJsonBody } from '../../lib/response';
import { loginSchema, formatZodError } from '../../lib/validator';
import { 
  findUserByUsername, 
  verifyPassword, 
  createToken 
} from '../../lib/auth';
import { 
  checkRateLimit, 
  recordAttempt, 
  getRateLimitIdentifier 
} from '../../lib/rate-limiter';
import { logLoginAttempt } from '../../lib/logger';

export const runtime = 'nodejs'; // Usar Node.js runtime para file system

/**
 * POST /api/auth/login
 * Autentica usuário e retorna token
 */
export async function POST(request: NextRequest) {
  try {
    // Parse do body
    const body = await parseJsonBody(request);
    
    if (!body) {
      return sendError('Dados inválidos', request, 400);
    }

    // Validar com Zod
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return sendError(formatZodError(validation.error), request, 400);
    }

    const { username, password } = validation.data;

    // Verificar rate limiting
    const rateLimitId = getRateLimitIdentifier(request, username);
    const rateCheck = await checkRateLimit(rateLimitId);

    if (!rateCheck.allowed) {
      return sendError(
        `Muitas tentativas de login. Tente novamente em ${rateCheck.remaining_minutes} minuto(s).`,
        request,
        429
      );
    }

    // Buscar usuário
    const user = await findUserByUsername(username);

    if (!user) {
      // Registrar tentativa falha
      await recordAttempt(rateLimitId, false, request);
      await logLoginAttempt(username, false, 'Usuário não encontrado', request);
      
      return sendError('Usuário ou senha incorretos', request, 401);
    }

    // Verificar senha
    const passwordValid = await verifyPassword(password, user.password);

    if (!passwordValid) {
      // Registrar tentativa falha
      await recordAttempt(rateLimitId, false, request);
      await logLoginAttempt(username, false, 'Senha incorreta', request);
      
      return sendError('Usuário ou senha incorretos', request, 401);
    }

    // Login bem-sucedido: limpar rate limit
    await recordAttempt(rateLimitId, true, request);
    await logLoginAttempt(username, true, '', request);

    // Gerar token
    const token = await createToken(user.id);

    // Verificar se precisa trocar senha
    const mustChangePassword = user.must_change_password === true;

    // Retornar dados do usuário e token
    return sendResponse(
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
      request,
      200
    );
  } catch (error) {
    console.error('Erro no login:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * OPTIONS /api/auth/login
 * Preflight CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}
