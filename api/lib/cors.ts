import type { VercelRequest, VercelResponse } from '@vercel/node';

// Type definition for headers
type CorsHeaders = Record<string, string>;

// Lista de origens permitidas em produção
const ALLOWED_ORIGINS = [
  'https://rvcar.vercel.app',
  'https://www.rvcarlocacoes.com.br',
  'https://rvcarlocacoes.com.br',
  'https://rvcar-production.up.railway.app',
];

/**
 * Configura headers CORS baseado no ambiente
 */
export function getCorsHeaders(req: VercelRequest): CorsHeaders {
  const origin = (req.headers.origin as string) || '';
  const host = req.headers.host || '';
  
  // Detectar ambiente de produção
  const isProduction = 
    !host.includes('localhost') &&
    !host.includes('127.0.0.1') &&
    !host.match(/192\.168\.\d+\.\d+/) &&
    !host.match(/10\.\d+\.\d+\.\d+/);

  const headers: CorsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, X-CSRF-Token, X-Seed-Secret',
    'Access-Control-Max-Age': '86400',
  };

  if (isProduction) {
    // Verificar se a origem está na lista de permitidas
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    } else if (origin) {
      // Se não está na lista mas tem origin, usar a primeira origem permitida
      headers['Access-Control-Allow-Origin'] = ALLOWED_ORIGINS[0];
    } else {
      // Sem origin (ex: curl, Postman)
      headers['Access-Control-Allow-Origin'] = '*';
    }
  } else {
    // Desenvolvimento: permitir origens locais
    const isLocal = origin.match(/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/);
    
    if (origin && isLocal) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    } else {
      headers['Access-Control-Allow-Origin'] = '*';
    }
  }

  return headers;
}

/**
 * Aplica headers CORS na resposta
 */
export function applyCorsHeaders(res: VercelResponse, req: VercelRequest): void {
  const headers = getCorsHeaders(req);
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
}

/**
 * Handler para requisições OPTIONS (preflight)
 */
export function handleOptions(req: VercelRequest, res: VercelResponse): void {
  applyCorsHeaders(res, req);
  res.status(204).end();
}

/**
 * Verifica se a requisição é OPTIONS
 */
export function isOptionsRequest(req: VercelRequest): boolean {
  return req.method === 'OPTIONS';
}
