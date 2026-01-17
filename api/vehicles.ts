import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, isOptionsRequest, applyCorsHeaders } from './lib/cors.js';
import { sendResponse, sendError, getJsonBody, validateContentType } from './lib/response.js';
import { createVehicleSchema, formatZodError } from './lib/validator.js';
import { validateToken, extractTokenFromHeader } from './lib/auth.js';
import { logCrudOperation } from './lib/logger.js';
import { readJsonFile, writeJsonFile, getDataPath } from './lib/file-ops.js';
import type { Vehicle } from './types/vehicle.js';

const VEHICLES_FILE = getDataPath('vehicles.json');

/**
 * Handler principal para /api/vehicles
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (isOptionsRequest(req)) {
    return handleOptions(req, res);
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      applyCorsHeaders(res, req);
      return res.status(405).json({ error: true, message: 'Método não permitido' });
  }
}

/**
 * GET /api/vehicles
 * Lista todos os veículos (público)
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
  try {
    const vehicles = await readJsonFile<Vehicle[]>(VEHICLES_FILE, []);
    
    // Filtros opcionais via query params
    const availableOnly = req.query.available === 'true';

    let filteredVehicles = vehicles;

    if (availableOnly) {
      filteredVehicles = vehicles.filter((v: Vehicle) => v.available === true);
    }

    return sendResponse(res, req, filteredVehicles, 200);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}

/**
 * POST /api/vehicles
 * Cria novo veículo (requer autenticação)
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  try {
    // Verificar autenticação
    const authHeader = req.headers.authorization as string | undefined;
    const token = extractTokenFromHeader(authHeader || null);

    if (!token) {
      return sendError(res, req, 'Token de autenticação necessário', 401);
    }

    const user = await validateToken(token);

    if (!user) {
      return sendError(res, req, 'Token inválido ou expirado', 401);
    }

    // Validar Content-Type
    if (!validateContentType(req)) {
      return sendError(res, req, 'Content-Type deve ser application/json', 415);
    }

    // Parse do body
    const body = getJsonBody(req);
    
    if (!body) {
      return sendError(res, req, 'Dados inválidos', 400);
    }

    // Validar com Zod
    const validation = createVehicleSchema.safeParse(body);
    if (!validation.success) {
      return sendError(res, req, formatZodError(validation.error), 400);
    }

    const vehicleData = validation.data;

    // Ler veículos existentes
    const vehicles = await readJsonFile<Vehicle[]>(VEHICLES_FILE, []);

    // Gerar novo ID
    const maxId = vehicles.length > 0 ? Math.max(...vehicles.map((v: Vehicle) => v.id)) : 0;
    const id = maxId + 1;

    // Criar novo veículo
    const newVehicle: Vehicle = {
      id,
      name: vehicleData.name,
      price: vehicleData.price,
      image: vehicleData.image || '',
      features: vehicleData.features || [],
      available: vehicleData.available !== undefined ? vehicleData.available : true,
      featured: vehicleData.featured !== undefined ? vehicleData.featured : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vehicles.push(newVehicle);
    await writeJsonFile(VEHICLES_FILE, vehicles, 0o600);

    // Log da operação
    await logCrudOperation('vehicle', 'create', id, user.id, req);

    return sendResponse(res, req, newVehicle, 201);
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}
