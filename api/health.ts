import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, isOptionsRequest } from './lib/cors';
import { sendResponse } from './lib/response';
import { checkStorage } from './lib/storage';

/**
 * GET /api/health
 * Endpoint de verificação de saúde da API
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (isOptionsRequest(req)) {
    return handleOptions(req, res);
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: true, message: 'Method Not Allowed' });
  }

  try {
    // Verificar storage
    const storageStatus = await checkStorage();

    // Verificar variáveis de ambiente críticas
    const envStatus = {
      KV_REST_API_URL: !!process.env.KV_REST_API_URL,
      BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
      VERCEL: process.env.VERCEL === '1',
    };

    const isHealthy = storageStatus.available;

    return sendResponse(res, req, {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL === '1' ? 'production' : 'development',
      storage: storageStatus,
      env: envStatus,
      version: '1.0.0',
    }, isHealthy ? 200 : 503);
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
