import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCorsHeaders } from './cors';

/**
 * Envia resposta de sucesso com CORS
 */
export function sendResponse<T>(
  res: VercelResponse,
  req: VercelRequest,
  data: T,
  statusCode: number = 200
): void {
  applyCorsHeaders(res, req);
  res.status(statusCode).json(data);
}

/**
 * Envia resposta de erro com CORS
 */
export function sendError(
  res: VercelResponse,
  req: VercelRequest,
  message: string,
  statusCode: number = 400
): void {
  applyCorsHeaders(res, req);
  res.status(statusCode).json({
    error: true,
    message,
  });
}

/**
 * Valida Content-Type para métodos que requerem JSON
 */
export function validateContentType(req: VercelRequest): boolean {
  const contentType = (req.headers['content-type'] as string) || '';
  return contentType.includes('application/json');
}

/**
 * Obtém body JSON da requisição (já parseado pelo Vercel)
 */
export function getJsonBody<T>(req: VercelRequest): T | null {
  try {
    // Vercel já faz parse automático do body JSON
    if (req.body && typeof req.body === 'object') {
      return req.body as T;
    }
    return null;
  } catch {
    return null;
  }
}
