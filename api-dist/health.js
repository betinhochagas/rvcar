import { handleOptions, isOptionsRequest } from './lib/cors.js';
import { sendResponse } from './lib/response.js';
import { checkStorage } from './lib/storage.js';
/**
 * GET /api/health
 * Endpoint de verificação de saúde da API
 */
export default async function handler(req, res) {
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
        // Info do ambiente
        const envInfo = {
            NODE_ENV: process.env.NODE_ENV || 'development',
            RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT || 'none',
            PORT: process.env.PORT || '3000',
        };
        const isHealthy = storageStatus.available;
        return sendResponse(res, req, {
            status: isHealthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            storage: storageStatus,
            env: envInfo,
            version: '1.0.1', // Updated to track deploy
        }, isHealthy ? 200 : 503);
    }
    catch (error) {
        console.error('Health check failed:', error);
        return res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
