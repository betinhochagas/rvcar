import type { NextRequest } from 'next/server';

// Type definition for headers
type HeadersInit = Record<string, string>;

/**
 * Configura headers CORS baseado no ambiente
 */
export function getCorsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get('origin') || '';
  const host = request.headers.get('host') || '';
  
  // Detectar ambiente de produção
  const isProduction = 
    !host.includes('localhost') &&
    !host.includes('127.0.0.1') &&
    !host.match(/192\.168\.\d+\.\d+/) &&
    !host.match(/10\.\d+\.\d+\.\d+/);

  const headers: HeadersInit = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, X-CSRF-Token',
    'Access-Control-Max-Age': '86400',
  };

  if (isProduction) {
    // Produção: apenas permitir origem do próprio domínio
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const allowedOrigins = [
      `${protocol}://${host}`,
      `https://${host}`,
      `http://${host}`,
    ];

    if (origin && allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    } else {
      headers['Access-Control-Allow-Origin'] = `${protocol}://${host}`;
    }
  } else {
    // Desenvolvimento: permitir origens locais
    const isLocal = origin.match(/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/);
    
    if (origin && isLocal) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    } else {
      headers['Access-Control-Allow-Origin'] = '*';
    }
  }

  return headers;
}

/**
 * Handler para requisições OPTIONS (preflight)
 */
export function handleOptions(request: NextRequest): Response {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
