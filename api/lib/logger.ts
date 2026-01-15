import fs from 'fs/promises';
import { getLogPath } from './file-ops';

type Severity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

interface SecurityEventDetails {
  [key: string]: unknown;
}

/**
 * Registra evento de segurança
 */
export async function logSecurityEvent(
  event: string,
  severity: Severity = 'INFO',
  details: SecurityEventDetails = {},
  request?: Request
): Promise<void> {
  try {
    const logPath = getLogPath('security.log');
    
    // Coletar informações do contexto
    const timestamp = new Date().toISOString();
    const ip = request?.headers.get('x-forwarded-for') || 
               request?.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';
    const method = request?.method || 'unknown';
    const url = request?.url || 'unknown';

    // Montar mensagem de log
    const logEntry = `[${timestamp}] [${severity}] ${event} | IP: ${ip} | Method: ${method} | URL: ${url} | UA: ${userAgent.substring(0, 100)}${
      Object.keys(details).length > 0 ? ' | Details: ' + JSON.stringify(details) : ''
    }\n`;

    // Escrever no arquivo (append)
    await fs.appendFile(logPath, logEntry, { encoding: 'utf-8' });

    // Garantir permissões restritas
    await fs.chmod(logPath, 0o600).catch(() => {});

    // Em produção, também enviar para console em casos críticos
    if (severity === 'CRITICAL' || severity === 'ERROR') {
      console.error(`SECURITY [${severity}]: ${event} - IP: ${ip}`);
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
  request?: Request
): Promise<void> {
  const event = success ? 'Login bem-sucedido' : 'Tentativa de login falhou';
  const severity = success ? 'INFO' : 'WARNING';

  await logSecurityEvent(event, severity, {
    username,
    success,
    reason,
  }, request);
}

/**
 * Log de alteração de senha
 */
export async function logPasswordChange(
  userId: number,
  username: string,
  request?: Request
): Promise<void> {
  await logSecurityEvent('Senha alterada', 'INFO', {
    user_id: userId,
    username,
  }, request);
}

/**
 * Log de operação CRUD
 */
export async function logCrudOperation(
  entity: string,
  operation: string,
  entityId?: number | string,
  userId?: number,
  request?: Request
): Promise<void> {
  const event = `${operation.toUpperCase()} ${entity}`;

  await logSecurityEvent(event, 'INFO', {
    entity,
    operation,
    entity_id: entityId,
    user_id: userId,
  }, request);
}

/**
 * Log de upload de arquivo
 */
export async function logFileUpload(
  filename: string,
  filesize: number,
  mimetype: string,
  userId?: number,
  request?: Request
): Promise<void> {
  await logSecurityEvent('Upload de arquivo', 'INFO', {
    filename,
    filesize,
    mimetype,
    user_id: userId,
  }, request);
}

/**
 * Log de bloqueio por rate limit
 */
export async function logRateLimitBlock(
  identifier: string,
  attempts: number,
  request?: Request
): Promise<void> {
  await logSecurityEvent('Rate limit atingido', 'WARNING', {
    identifier: identifier.substring(0, 16), // Apenas parte do hash
    attempts,
  }, request);
}

/**
 * Log de token CSRF inválido
 */
export async function logCsrfViolation(
  userId?: number,
  request?: Request
): Promise<void> {
  await logSecurityEvent('Token CSRF inválido', 'WARNING', {
    user_id: userId,
  }, request);
}

/**
 * Log de acesso não autorizado
 */
export async function logUnauthorizedAccess(
  resource: string,
  userId?: number,
  request?: Request
): Promise<void> {
  await logSecurityEvent('Acesso não autorizado', 'WARNING', {
    resource,
    user_id: userId,
  }, request);
}

/**
 * Log de erro de validação
 */
export async function logValidationError(
  field: string,
  value: string,
  request?: Request
): Promise<void> {
  await logSecurityEvent('Erro de validação', 'INFO', {
    field,
    value: value.substring(0, 50), // Apenas início do valor
  }, request);
}
