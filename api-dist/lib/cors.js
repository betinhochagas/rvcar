// Lista completa de headers permitidos
const ALLOWED_HEADERS = [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Cache-Control',
    'Pragma',
    'Expires',
    'X-Seed-Secret',
    'X-CSRF-Token',
    'Accept',
    'Accept-Language',
    'Accept-Encoding',
    'Origin',
    'Host',
    'Referer',
    'User-Agent',
    'DNT',
    'Connection',
    'Keep-Alive',
].join(', ');
/**
 * Configura headers CORS - versão simplificada e permissiva
 */
export function getCorsHeaders(req) {
    const origin = req.headers.origin || '*';
    return {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': ALLOWED_HEADERS,
        'Access-Control-Max-Age': '86400',
    };
}
/**
 * Aplica headers CORS na resposta
 */
export function applyCorsHeaders(res, req) {
    const headers = getCorsHeaders(req);
    for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value);
    }
}
/**
 * Handler para requisições OPTIONS (preflight)
 */
export function handleOptions(req, res) {
    applyCorsHeaders(res, req);
    res.status(204).end();
}
/**
 * Verifica se a requisição é OPTIONS
 */
export function isOptionsRequest(req) {
    return req.method === 'OPTIONS';
}
