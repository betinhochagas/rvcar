import { applyCorsHeaders } from './cors.js';
/**
 * Envia resposta de sucesso com CORS
 */
export function sendResponse(res, req, data, statusCode = 200) {
    applyCorsHeaders(res, req);
    res.status(statusCode).json(data);
}
/**
 * Envia resposta de erro com CORS
 */
export function sendError(res, req, message, statusCode = 400) {
    applyCorsHeaders(res, req);
    res.status(statusCode).json({
        error: true,
        message,
    });
}
/**
 * Valida Content-Type para métodos que requerem JSON
 */
export function validateContentType(req) {
    const contentType = req.headers['content-type'] || '';
    return contentType.includes('application/json');
}
/**
 * Obtém body JSON da requisição (já parseado pelo Vercel)
 */
export function getJsonBody(req) {
    try {
        // Vercel já faz parse automático do body JSON
        if (req.body && typeof req.body === 'object') {
            return req.body;
        }
        return null;
    }
    catch {
        return null;
    }
}
