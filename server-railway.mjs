import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Criar diretórios necessários
async function ensureDirectories() {
  // Em produção, usar /app/storage para persistência
  const baseDir = process.env.NODE_ENV === 'production' 
    ? '/app/storage' 
    : __dirname;
    
  const dirs = [
    join(baseDir, 'data'),
    join(baseDir, 'uploads'),
    join(baseDir, 'uploads', 'vehicles'),
    join(baseDir, 'uploads', 'site'),
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true }).catch(() => {});
  }
  console.log('📁 Diretórios de dados criados em:', baseDir);
}

// Inicializar diretórios
await ensureDirectories();

// Caminho base para storage
const STORAGE_BASE = process.env.NODE_ENV === 'production' 
  ? '/app/storage' 
  : __dirname;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'X-Seed-Secret']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static(join(STORAGE_BASE, 'uploads')));

// Helper para criar mock de VercelRequest/Response
function createVercelMocks(req, res) {
  const vercelReq = {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    query: req.query,
    body: req.body,
  };

  const vercelRes = {
    statusCode: 200,
    _headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this._headers[name] = value;
      res.setHeader(name, value);
      return this;
    },
    json(data) {
      res.status(this.statusCode).json(data);
      return this;
    },
    send(data) {
      res.status(this.statusCode).send(data);
      return this;
    },
    end() {
      res.status(this.statusCode).end();
      return this;
    }
  };

  return { vercelReq, vercelRes };
}

// Helper para carregar handlers
const handlers = {};
const API_DIR = process.env.NODE_ENV === 'production' ? './api-dist' : './api';

async function loadHandler(name) {
  if (!handlers[name]) {
    const module = await import(`${API_DIR}/${name}.js`);
    handlers[name] = module.default;
  }
  return handlers[name];
}

// ============================================================================
// HEALTH CHECK
// ============================================================================
app.get('/api/health', async (req, res) => {
  try {
    const handler = await loadHandler('health');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// AUTENTICAÇÃO (consolidado)
// ============================================================================
app.post('/api/auth', async (req, res) => {
  try {
    const handler = await loadHandler('auth');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rotas de compatibilidade (redirecionam para ?action=xxx)
app.post('/api/auth/login', async (req, res) => {
  try {
    req.query.action = 'login';
    const handler = await loadHandler('auth');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    vercelReq.query = { action: 'login' };
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    req.query.action = 'logout';
    const handler = await loadHandler('auth');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    vercelReq.query = { action: 'logout' };
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    req.query.action = 'verify';
    const handler = await loadHandler('auth');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    vercelReq.query = { action: 'verify' };
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/change-password', async (req, res) => {
  try {
    req.query.action = 'change-password';
    const handler = await loadHandler('auth');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    vercelReq.query = { action: 'change-password' };
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// SEED (inicialização de dados)
// ============================================================================
app.post('/api/seed', async (req, res) => {
  try {
    const handler = await loadHandler('seed');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// VEÍCULOS
// ============================================================================
app.get('/api/vehicles', async (req, res) => {
  try {
    const handler = await loadHandler('vehicles');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const handler = await loadHandler('vehicles');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.options('/api/vehicles', async (req, res) => {
  try {
    const handler = await loadHandler('vehicles');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    await handler(vercelReq, vercelRes);
  } catch (error) {
    res.status(204).end();
  }
});

// Rotas dinâmicas [id]
async function handleVehicleById(req, res) {
  try {
    const module = await import(`${API_DIR}/vehicles/[id].js`);
    const handler = module.default;
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    vercelReq.query = { ...req.query, id: req.params.id };
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Vehicle by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

app.get('/api/vehicles/:id', handleVehicleById);
app.put('/api/vehicles/:id', handleVehicleById);
app.delete('/api/vehicles/:id', handleVehicleById);
app.patch('/api/vehicles/:id', handleVehicleById);
app.options('/api/vehicles/:id', handleVehicleById);

// ============================================================================
// CONFIGURAÇÕES DO SITE
// ============================================================================
app.get('/api/site-settings', async (req, res) => {
  try {
    const handler = await loadHandler('site-settings');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Get site settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/site-settings', async (req, res) => {
  try {
    const handler = await loadHandler('site-settings');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Create site setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.options('/api/site-settings', async (req, res) => {
  try {
    const handler = await loadHandler('site-settings');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    await handler(vercelReq, vercelRes);
  } catch (error) {
    res.status(204).end();
  }
});

// Rotas dinâmicas [key]
async function handleSiteSettingByKey(req, res) {
  try {
    const module = await import(`${API_DIR}/site-settings/[key].js`);
    const handler = module.default;
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    vercelReq.query = { ...req.query, key: req.params.key };
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Site setting by key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

app.get('/api/site-settings/:key', handleSiteSettingByKey);
app.put('/api/site-settings/:key', handleSiteSettingByKey);
app.delete('/api/site-settings/:key', handleSiteSettingByKey);
app.options('/api/site-settings/:key', handleSiteSettingByKey);

// ============================================================================
// UPLOAD
// ============================================================================
app.post('/api/upload', async (req, res) => {
  try {
    const handler = await loadHandler('upload');
    const { vercelReq, vercelRes } = createVercelMocks(req, res);
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.options('/api/upload', (req, res) => {
  res.status(204).end();
});

// ============================================================================
// FRONTEND (servir arquivos estáticos em produção)
// ============================================================================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
  
  // SPA fallback (Express 5.x syntax)
  app.get('/{*splat}', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Servidor rodando na porta ${PORT}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📍 Endpoints disponíveis:`);
  console.log(`   GET    /api/health`);
  console.log(`   POST   /api/auth?action=login|logout|verify|change-password`);
  console.log(`   POST   /api/auth/login (compatibilidade)`);
  console.log(`   POST   /api/auth/logout (compatibilidade)`);
  console.log(`   POST   /api/auth/verify (compatibilidade)`);
  console.log(`   POST   /api/auth/change-password (compatibilidade)`);
  console.log(`   POST   /api/seed`);
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
});

export default app;
