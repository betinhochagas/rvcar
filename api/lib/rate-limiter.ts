import crypto from 'crypto';
import type { RateLimits, RateLimitResult } from '../types/security';
import { readJsonFile, writeJsonFile, getDataPath } from './file-ops';
import { logRateLimitBlock } from './logger';

const RATE_LIMIT_FILE = getDataPath('rate-limits.json');

// Configurações padrão
const MAX_ATTEMPTS = parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5');
const WINDOW_MINUTES = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15');

/**
 * Verifica se o identificador está dentro do limite de tentativas
 */
export async function checkRateLimit(
  identifier: string,
  maxAttempts: number = MAX_ATTEMPTS,
  windowMinutes: number = WINDOW_MINUTES
): Promise<RateLimitResult> {
  const rateLimits = await readJsonFile<RateLimits>(RATE_LIMIT_FILE);
  const now = Math.floor(Date.now() / 1000); // Unix timestamp
  const windowSeconds = windowMinutes * 60;

  // Limpar registros expirados
  for (const key in rateLimits) {
    if (now - rateLimits[key].first_attempt > windowSeconds) {
      delete rateLimits[key];
    }
  }

  // Verificar limite para este identificador
  if (identifier in rateLimits) {
    const attempts = rateLimits[identifier];

    // Se ainda está no período de bloqueio
    if (now - attempts.first_attempt <= windowSeconds) {
      if (attempts.count >= maxAttempts) {
        const remainingTime = windowSeconds - (now - attempts.first_attempt);
        const remainingMinutes = Math.ceil(remainingTime / 60);

        return {
          allowed: false,
          remaining_minutes: remainingMinutes,
          attempts: attempts.count,
        };
      }
    } else {
      // Período expirou, resetar
      delete rateLimits[identifier];
    }
  }

  return {
    allowed: true,
    attempts: rateLimits[identifier]?.count || 0,
  };
}

/**
 * Registra uma tentativa (login, upload, etc)
 */
export async function recordAttempt(
  identifier: string,
  success: boolean = false,
  request?: Request
): Promise<void> {
  const rateLimits = await readJsonFile<RateLimits>(RATE_LIMIT_FILE);
  const now = Math.floor(Date.now() / 1000);

  if (success) {
    // Sucesso: limpar rate limit
    if (identifier in rateLimits) {
      delete rateLimits[identifier];
    }
  } else {
    // Falha: incrementar contador
    if (!(identifier in rateLimits)) {
      rateLimits[identifier] = {
        count: 1,
        first_attempt: now,
        last_attempt: now,
      };
    } else {
      rateLimits[identifier].count++;
      rateLimits[identifier].last_attempt = now;

      // Se atingiu o limite, logar
      if (rateLimits[identifier].count >= MAX_ATTEMPTS) {
        await logRateLimitBlock(identifier, rateLimits[identifier].count, request);
      }
    }
  }

  // Salvar com file locking
  await writeJsonFile(RATE_LIMIT_FILE, rateLimits, 0o600);
}

/**
 * Obtém identificador único para rate limit (IP + User-Agent)
 */
export function getRateLimitIdentifier(request: Request, username: string = ''): string {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Combinar IP, user agent e username para criar identificador único
  let identifier = ip + '|' + crypto.createHash('md5').update(userAgent).digest('hex').substring(0, 8);
  
  if (username) {
    identifier += '|' + username;
  }

  return crypto.createHash('sha256').update(identifier).digest('hex');
}

/**
 * Limpa rate limits antigos (manutenção)
 */
export async function cleanOldRateLimits(): Promise<void> {
  const rateLimits = await readJsonFile<RateLimits>(RATE_LIMIT_FILE);
  const windowSeconds = WINDOW_MINUTES * 60;
  const now = Math.floor(Date.now() / 1000);
  let cleaned = false;

  for (const key in rateLimits) {
    if (now - rateLimits[key].first_attempt > windowSeconds * 2) {
      delete rateLimits[key];
      cleaned = true;
    }
  }

  if (cleaned) {
    await writeJsonFile(RATE_LIMIT_FILE, rateLimits, 0o600);
  }
}

// Executar limpeza ocasionalmente (10% de chance)
if (Math.random() < 0.1) {
  cleanOldRateLimits().catch(console.error);
}
