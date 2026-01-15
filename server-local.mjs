// Servidor de Desenvolvimento Local - Express + TypeScript
// Simula o ambiente Vercel sem usar vercel dev

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Configurar multer para upload
const upload = multer({ storage: multer.memoryStorage() });

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir uploads
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Importar e registrar rotas dinamicamente
async function registerRoutes() {
  const routes = [
    { path: '/api/auth/login', file: './api/auth/login/route.ts' },
    { path: '/api/auth/logout', file: './api/auth/logout/route.ts' },
    { path: '/api/auth/verify', file: './api/auth/verify/route.ts' },
    { path: '/api/auth/change-password', file: './api/auth/change-password/route.ts' },
    { path: '/api/vehicles', file: './api/vehicles/route.ts' },
    { path: '/api/vehicles/:id', file: './api/vehicles/[id]/route.ts' },
    { path: '/api/site-settings', file: './api/site-settings/route.ts' },
    { path: '/api/site-settings/:key', file: './api/site-settings/[key]/route.ts' },
    { path: '/api/upload', file: './api/upload/route.ts' }
  ];

  for (const route of routes) {
    try {
      const module = await import(route.file);
      
      // Registrar métodos HTTP
      ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].forEach(method => {
        const handler = module[method];
        if (handler) {
          // Para rota de upload, usar multer
          const middleware = route.path === '/api/upload' ? upload.single('image') : (req, res, next) => next();
          
          app[method.toLowerCase()](route.path, middleware, async (req, res) => {
            try {
              // Criar mock do NextRequest
              const mockRequest = {
                method: req.method,
                url: `http://localhost:${PORT}${req.url}`,
                headers: new Map(Object.entries(req.headers)),
                json: async () => req.body,
                formData: async () => {
                  // Mock FormData para uploads
                  if (req.file) {
                    return {
                      get: (key) => {
                        if (key === 'image') {
                          return new File([req.file.buffer], req.file.originalname, {
                            type: req.file.mimetype
                          });
                        }
                        return req.body[key] || null;
                      }
                    };
                  }
                  return req.body;
                },
                nextUrl: {
                  searchParams: new URLSearchParams(req.query)
                }
              };

              // Executar handler com parâmetros de rota (para rotas com :id ou :key)
              const params = {};
              if (req.params) {
                Object.assign(params, req.params);
              }
              
              const response = await handler(mockRequest, { params });
              
              // Enviar resposta
              const data = await response.json();
              res.status(response.status).json(data);
            } catch (error) {
              console.error(`Error in ${method} ${route.path}:`, error);
              res.status(500).json({ error: 'Internal Server Error' });
            }
          });
        }
      });
      
      console.log(`✅ Registrada: ${route.path}`);
    } catch (error) {
      console.error(`❌ Erro ao registrar ${route.path}:`, error.message);
    }
  }
}

// Iniciar servidor
async function start() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  RV CAR - Backend Local (Express)     ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  await registerRoutes();
  
  app.listen(PORT, () => {
    console.log('\n✅ Backend rodando em: http://localhost:' + PORT);
    console.log('📡 API: http://localhost:' + PORT + '/api');
    console.log('🔐 Pronto para receber requisições!\n');
  });
}

start().catch(console.error);
