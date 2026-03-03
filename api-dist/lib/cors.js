/**
 * Configura headers CORS baseado no ambiente
 */
export function getCorsHeaders(req) {
    const origin = req.headers.origin || '';
    const host = req.headers.host || '';
    // Detectar ambiente de produção
    const isProduction = !host.includes('localhost') &&
        !host.includes('127.0.0.1') &&
        !host.match(/192\.168\.\d+\.\d+/) &&
        !host.match(/10\.\d+\.\d+\.\d+/);
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, X-CSRF-Token, X-Seed-Secret',
        'Access-Control-Max-Age': '86400',
    };
    if (isProduction) {
        // Produção: apenas permitir origem do próprio domínio
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const allowedOrigins = [
            `${protocol}://${host}`,
            `https://${host}`,
            `http://${host}`,
        ];
        if (origin && allowedOrigins.includes(origin)) {
            headers['Access-Control-Allow-Origin'] = origin;
            headers['Access-Control-Allow-Credentials'] = 'true';
        }
        else {
            headers['Access-Control-Allow-Origin'] = `${protocol}://${host}`;
        }
    }
    else {
        // Desenvolvimento: permitir origens locais
        const isLocal = origin.match(/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/);
        if (origin && isLocal) {
            headers['Access-Control-Allow-Origin'] = origin;
            headers['Access-Control-Allow-Credentials'] = 'true';
        }
        else {
            headers['Access-Control-Allow-Origin'] = '*';
        }
    }
    return headers;
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
