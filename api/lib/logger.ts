import type { VercelRequest } from '@vercel/node';

type Severity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

interface SecurityEventDetails {
  [key: string]: unknown;
}

/**
 * Obtém header de forma segura do VercelRequest
 */
function getHeader(req: VercelRequest | undefined, name: string): string {
  if (!req) return 'unknown';
  const value = req.headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] || 'unknown';
  return value || 'unknown';
}

/**
 * Registra evento de segurança
 */
export async function logSecurityEvent(
  event: string,
  severity: Severity = 'INFO',
  details: SecurityEventDetails = {},
  req?: VercelRequest
): Promise<void> {
  try {
    // Coletar informações do contexto
    const timestamp = new Date().toISOString();
    const ip = getHeader(req, 'x-forwarded-for') || getHeader(req, 'x-real-ip');
    const userAgent = getHeader(req, 'user-agent');
    const method = req?.method || 'unknown';
    const url = req?.url || 'unknown';

    // Montar mensagem de log
    const logEntry = `[${timestamp}] [${severity}] ${event} | IP: ${ip} | Method: ${method} | URL: ${url} | UA: ${userAgent.substring(0, 100)}${
      Object.keys(details).length > 0 ? ' | Details: ' + JSON.stringify(details) : ''
    }`;

    // Em serverless, usar console.log (Vercel captura automaticamente)
    if (severity === 'CRITICAL' || severity === 'ERROR') {
      console.error(`SECURITY [${severity}]: ${logEntry}`);
    } else if (severity === 'WARNING') {
      console.warn(`SECURITY [${severity}]: ${logEntry}`);
    } else {
      console.log(`SECURITY [${severity}]: ${logEntry}`);
    }
  } catch (error) {
    // Falha ao logar não deve quebrar a aplicação
    console.error('Erro ao registrar log de segurança:', error);
  }
}

/**
 * Log de tentativa de login
 */
export async function logLoginAttempt(
  username: string,
  success: boolean,
  reason: string = '',
  req?: VercelRequest
): Promise<void> {
  const event = success ? 'Login bem-sucedido' : 'Tentativa de login falhou';
  const severity = success ? 'INFO' : 'WARNING';

  await logSecurityEvent(event, severity, {
    username,
    success,
    reason,
  }, req);
}

/**
 * Log de alteração de senha
 */
export async function logPasswordChange(
  userId: number,
  username: string,
  req?: VercelRequest
): Promise<void> {
  await logSecurityEvent('Senha alterada', 'INFO', {
    user_id: userId,
    username,
  }, req);
}

/**
 * Log de operação CRUD
 */
export async function logCrudOperation(
  entity: string,
  operation: string,
  entityId?: number | string,
  userId?: number,
  req?: VercelRequest
): Promise<void> {
  const event = `${operation.toUpperCase()} ${entity}`;

  await logSecurityEvent(event, 'INFO', {
    entity,
    operation,
    entity_id: entityId,
    user_id: userId,
  }, req);
}

/**
 * Log de upload de arquivo
 */
export async function logFileUpload(
  filename: string,
  filesize: number,
  mimetype: string,
  userId?: number,
  req?: VercelRequest
): Promise<void> {
  await logSecurityEvent('Upload de arquivo', 'INFO', {
    filename,
    filesize,
    mimetype,
    user_id: userId,
  }, req);
}

/**
 * Log de bloqueio por rate limit
 */
export async function logRateLimitBlock(
  identifier: string,
  attempts: number,
  req?: VercelRequest
): Promise<void> {
  await logSecurityEvent('Rate limit atingido', 'WARNING', {
    identifier: identifier.substring(0, 16), // Apenas parte do hash
    attempts,
  }, req);
}

/**
 * Log de token CSRF inválido
 */
export async function logCsrfViolation(
  userId?: number,
  req?: VercelRequest
): Promise<void> {
  await logSecurityEvent('Token CSRF inválido', 'WARNING', {
    user_id: userId,
  }, req);
}

/**
 * Log de acesso não autorizado
 */
export async function logUnauthorizedAccess(
  resource: string,
  userId?: number,
  req?: VercelRequest
): Promise<void> {
  await logSecurityEvent('Acesso não autorizado', 'WARNING', {
    resource,
    user_id: userId,
  }, req);
}

/**
 * Log de erro de validação
 */
export async function logValidationError(
  field: string,
  value: string,
  req?: VercelRequest
): Promise<void> {
  await logSecurityEvent('Erro de validação', 'INFO', {
    field,
    value: value.substring(0, 50), // Apenas início do valor
  }, req);
}
