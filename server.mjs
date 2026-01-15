import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper para importar e executar handlers TypeScript
async function handleRoute(routePath, method) {
  return async (req, res) => {
    try {
      // Importar o módulo TypeScript
      const modulePath = join(__dirname, 'api', routePath, 'route.ts');
      const module = await import(modulePath);
      
      // Obter função do método HTTP
      const handler = module[method];
      
      if (!handler) {
        return res.status(405).json({ error: 'Método não permitido' });
      }

      // Criar mock do VercelRequest
      const mockRequest = {
        method: req.method,
        url: req.url,
        headers: {
          get: (name) => req.get(name) || null,
          authorization: req.get('authorization'),
        },
        query: req.query,
        body: req.body,
        json: async () => req.body,
        formData: async () => {
          // Simplificado - multipart não implementado
          throw new Error('FormData requer middleware adicional');
        },
      };

      // Executar handler
      const response = await handler(mockRequest);

      // Verificar se response tem método json()
      let data;
      if (typeof response.json === 'function') {
        data = await response.json();
      } else {
        data = response;
      }

      // Enviar resposta
      res.status(response.status || 200).json(data);

    } catch (error) {
      console.error(`Erro ao processar ${method} ${routePath}:`, error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };
}

// ============================================================================
// ROTAS DE AUTENTICAÇÃO
// ============================================================================
app.post('/api/auth/login', handleRoute('auth/login', 'POST'));
app.post('/api/auth/verify', handleRoute('auth/verify', 'POST'));
app.post('/api/auth/change-password', handleRoute('auth/change-password', 'POST'));
app.post('/api/auth/logout', handleRoute('auth/logout', 'POST'));

// ============================================================================
// ROTAS DE VEÍCULOS
// ============================================================================
app.get('/api/vehicles', handleRoute('vehicles', 'GET'));
app.post('/api/vehicles', handleRoute('vehicles', 'POST'));

// Rotas dinâmicas [id]
app.get('/api/vehicles/:id', async (req, res) => {
  req.url = `/api/vehicles/${req.params.id}`;
  return handleRoute('vehicles/[id]', 'GET')(req, res);
});
app.put('/api/vehicles/:id', async (req, res) => {
  req.url = `/api/vehicles/${req.params.id}`;
  return handleRoute('vehicles/[id]', 'PUT')(req, res);
});
app.delete('/api/vehicles/:id', async (req, res) => {
  req.url = `/api/vehicles/${req.params.id}`;
  return handleRoute('vehicles/[id]', 'DELETE')(req, res);
});
app.patch('/api/vehicles/:id', async (req, res) => {
  req.url = `/api/vehicles/${req.params.id}`;
  return handleRoute('vehicles/[id]', 'PATCH')(req, res);
});

// ============================================================================
// ROTAS DE CONFIGURAÇÕES
// ============================================================================
app.get('/api/site-settings', handleRoute('site-settings', 'GET'));
app.post('/api/site-settings', handleRoute('site-settings', 'POST'));

// Rotas dinâmicas [key]
app.get('/api/site-settings/:key', async (req, res) => {
  req.url = `/api/site-settings/${req.params.key}`;
  return handleRoute('site-settings/[key]', 'GET')(req, res);
});
app.put('/api/site-settings/:key', async (req, res) => {
  req.url = `/api/site-settings/${req.params.key}`;
  return handleRoute('site-settings/[key]', 'PUT')(req, res);
});
app.delete('/api/site-settings/:key', async (req, res) => {
  req.url = `/api/site-settings/${req.params.key}`;
  return handleRoute('site-settings/[key]', 'DELETE')(req, res);
});

// ============================================================================
// ROTA DE UPLOAD
// ============================================================================
app.post('/api/upload', handleRoute('upload', 'POST'));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n✅ Servidor TypeScript rodando em http://localhost:${PORT}`);
  console.log(`\n📍 Endpoints disponíveis:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   POST   /api/auth/verify`);
  console.log(`   POST   /api/auth/change-password`);
  console.log(`   POST   /api/auth/logout`);
  console.log(`   GET    /api/vehicles`);
  console.log(`   POST   /api/vehicles`);
  console.log(`   GET    /api/vehicles/:id`);
  console.log(`   PUT    /api/vehicles/:id`);
  console.log(`   DELETE /api/vehicles/:id`);
  console.log(`   PATCH  /api/vehicles/:id`);
  console.log(`   GET    /api/site-settings`);
  console.log(`   POST   /api/site-settings`);
  console.log(`   GET    /api/site-settings/:key`);
  console.log(`   PUT    /api/site-settings/:key`);
  console.log(`   DELETE /api/site-settings/:key`);
  console.log(`   POST   /api/upload`);
  console.log(`\n🔧 Use Ctrl+C para parar o servidor\n`);
});
