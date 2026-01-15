import type { NextRequest } from 'next/server';
import { getCorsHeaders } from './cors';

/**
 * Envia resposta de sucesso com CORS
 */
export function sendResponse<T>(
  data: T,
  request: NextRequest,
  statusCode: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: getCorsHeaders(request),
  });
}

/**
 * Envia resposta de erro com CORS
 */
export function sendError(
  message: string,
  request: NextRequest,
  statusCode: number = 400
): Response {
  return new Response(
    JSON.stringify({
      error: true,
      message,
    }),
    {
      status: statusCode,
      headers: getCorsHeaders(request),
    }
  );
}

/**
 * Valida Content-Type para métodos que requerem JSON
 */
export function validateContentType(request: NextRequest): boolean {
  const contentType = request.headers.get('content-type') || '';
  return contentType.includes('application/json');
}

/**
 * Parse body JSON com tratamento de erros
 */
export async function parseJsonBody<T>(request: NextRequest): Promise<T | null> {
  try {
    const body = await request.json();
    return body as T;
  } catch {
    return null;
  }
}
