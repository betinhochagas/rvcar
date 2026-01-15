/**
 * Servidor de teste local para endpoints TypeScript
 * Simula o ambiente Vercel Serverless localmente
 */

const http = require('http');
const { parse } = require('url');
const path = require('path');

const PORT = 3000;

// Importar handlers TypeScript compilados (ou usar tsx para executar diretamente)
const importHandler = async (filePath) => {
  try {
    // Usar dynamic import para carregar módulos ES
    const module = await import(filePath);
    return module;
  } catch (error) {
    console.error(`Erro ao importar ${filePath}:`, error);
    return null;
  }
};

// Mapear rotas para handlers
const routeMap = {
  '/api/auth/login': './api/auth/login/route.ts',
  '/api/auth/verify': './api/auth/verify/route.ts',
  '/api/auth/change-password': './api/auth/change-password/route.ts',
  '/api/auth/logout': './api/auth/logout/route.ts',
  '/api/vehicles': './api/vehicles/route.ts',
  '/api/site-settings': './api/site-settings/route.ts',
  '/api/upload': './api/upload/route.ts',
};

// Criar mock do VercelRequest
const createMockRequest = (req) => {
  const url = parse(req.url, true);
  
  return {
    method: req.method,
    url: req.url,
    headers: {
      get: (name) => req.headers[name.toLowerCase()],
    },
    query: url.query,
    body: null, // Será preenchido ao ler o body
    json: async () => {
      if (!req.body) {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        req.body = Buffer.concat(chunks).toString();
      }
      return JSON.parse(req.body);
    },
    formData: async () => {
      // Simplificado - para upload precisaria de parser multipart
      throw new Error('FormData não implementado neste mock');
    },
  };
};

// Criar servidor HTTP
const server = http.createServer(async (req, res) => {
  const url = parse(req.url, true);
  const pathname = url.pathname;

  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Encontrar handler para a rota
  let handler = null;
  let handlerPath = null;

  // Verificar rotas exatas
  if (routeMap[pathname]) {
    handlerPath = routeMap[pathname];
  }
  // Verificar rotas dinâmicas (vehicles/[id], site-settings/[key])
  else if (pathname.startsWith('/api/vehicles/')) {
    handlerPath = './api/vehicles/[id]/route.ts';
  }
  else if (pathname.startsWith('/api/site-settings/')) {
    handlerPath = './api/site-settings/[key]/route.ts';
  }

  if (!handlerPath) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
    return;
  }

  try {
    // Carregar handler
    const module = await importHandler(path.resolve(__dirname, handlerPath));
    
    if (!module) {
      throw new Error('Handler não encontrado');
    }

    // Obter função do método HTTP
    const methodHandler = module[req.method];
    
    if (!methodHandler) {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Método não permitido' }));
      return;
    }

    // Criar mock request
    const mockRequest = createMockRequest(req);

    // Executar handler
    const response = await methodHandler(mockRequest);

    // Enviar resposta
    res.writeHead(response.status || 200, {
      'Content-Type': 'application/json',
      ...response.headers,
    });
    
    const body = await response.json();
    res.end(JSON.stringify(body));

  } catch (error) {
    console.error('Erro ao processar request:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Erro interno do servidor',
      message: error.message 
    }));
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ Servidor de teste rodando em http://localhost:${PORT}`);
  console.log(`\nEndpoints disponíveis:`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  POST   /api/auth/verify`);
  console.log(`  POST   /api/auth/change-password`);
  console.log(`  POST   /api/auth/logout`);
  console.log(`  GET    /api/vehicles`);
  console.log(`  POST   /api/vehicles`);
  console.log(`  GET    /api/vehicles/:id`);
  console.log(`  PUT    /api/vehicles/:id`);
  console.log(`  DELETE /api/vehicles/:id`);
  console.log(`  PATCH  /api/vehicles/:id`);
  console.log(`  GET    /api/site-settings`);
  console.log(`  POST   /api/site-settings`);
  console.log(`  GET    /api/site-settings/:key`);
  console.log(`  PUT    /api/site-settings/:key`);
  console.log(`  DELETE /api/site-settings/:key`);
  console.log(`  POST   /api/upload`);
  console.log(`\nUse Ctrl+C para parar o servidor\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});
