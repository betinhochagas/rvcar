import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, isOptionsRequest, applyCorsHeaders } from '../lib/cors.js';
import { sendResponse, sendError, getJsonBody, validateContentType } from '../lib/response.js';
import { updateVehicleSchema, formatZodError } from '../lib/validator.js';
import { validateToken, extractTokenFromHeader } from '../lib/auth.js';
import { logCrudOperation } from '../lib/logger.js';
import { readJsonFile, writeJsonFile, getDataPath } from '../lib/file-ops.js';
import type { Vehicle } from '../types/vehicle.js';

const VEHICLES_FILE = getDataPath('vehicles.json');

/**
 * Handler principal para /api/vehicles/[id]
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (isOptionsRequest(req)) {
    return handleOptions(req, res);
  }

  // Extrair ID da query
  const { id } = req.query;
  const vehicleId = parseInt(id as string);

  if (isNaN(vehicleId)) {
    return sendError(res, req, 'ID inválido', 400);
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, vehicleId);
    case 'PUT':
      return handlePut(req, res, vehicleId);
    case 'DELETE':
      return handleDelete(req, res, vehicleId);
    case 'PATCH':
      return handlePatch(req, res, vehicleId);
    default:
      applyCorsHeaders(res, req);
      return res.status(405).json({ error: true, message: 'Método não permitido' });
  }
}

/**
 * GET /api/vehicles/[id]
 * Busca veículo específico (público)
 */
async function handleGet(req: VercelRequest, res: VercelResponse, id: number) {
  try {
    const vehicles = await readJsonFile<Vehicle[]>(VEHICLES_FILE, []);
    const vehicle = vehicles.find((v: Vehicle) => v.id === id);

    if (!vehicle) {
      return sendError(res, req, 'Veículo não encontrado', 404);
    }

    return sendResponse(res, req, vehicle, 200);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}

/**
 * PUT /api/vehicles/[id]
 * Atualiza veículo (requer autenticação)
 */
async function handlePut(req: VercelRequest, res: VercelResponse, id: number) {
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
    const validation = updateVehicleSchema.safeParse(body);
    if (!validation.success) {
      return sendError(res, req, formatZodError(validation.error), 400);
    }

    const updates = validation.data;

    // Ler veículos
    const vehicles = await readJsonFile<Vehicle[]>(VEHICLES_FILE, []);
    const vehicleIndex = vehicles.findIndex((v: Vehicle) => v.id === id);

    if (vehicleIndex === -1) {
      return sendError(res, req, 'Veículo não encontrado', 404);
    }

    // Atualizar campos
    const vehicle = vehicles[vehicleIndex];
    
    if (updates.name !== undefined) vehicle.name = updates.name;
    if (updates.price !== undefined) vehicle.price = updates.price;
    if (updates.image !== undefined) vehicle.image = updates.image;
    if (updates.features !== undefined) vehicle.features = updates.features;
    if (updates.available !== undefined) vehicle.available = updates.available;
    if (updates.featured !== undefined) vehicle.featured = updates.featured;
    
    vehicle.updated_at = new Date().toISOString();

    await writeJsonFile(VEHICLES_FILE, vehicles, 0o600);

    // Log da operação
    await logCrudOperation('vehicle', 'update', id, user.id, req);

    return sendResponse(res, req, vehicle, 200);
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}

/**
 * DELETE /api/vehicles/[id]
 * Remove veículo (requer autenticação)
 */
async function handleDelete(req: VercelRequest, res: VercelResponse, id: number) {
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

    // Ler veículos
    const vehicles = await readJsonFile<Vehicle[]>(VEHICLES_FILE, []);
    const filteredVehicles = vehicles.filter((v: Vehicle) => v.id !== id);

    if (filteredVehicles.length === vehicles.length) {
      return sendError(res, req, 'Veículo não encontrado', 404);
    }

    await writeJsonFile(VEHICLES_FILE, filteredVehicles, 0o600);

    // Log da operação
    await logCrudOperation('vehicle', 'delete', id, user.id, req);

    return sendResponse(res, req, { success: true, message: 'Veículo removido com sucesso' }, 200);
  } catch (error) {
    console.error('Erro ao remover veículo:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}

/**
 * PATCH /api/vehicles/[id]
 * Toggle disponibilidade (requer autenticação)
 */
async function handlePatch(req: VercelRequest, res: VercelResponse, id: number) {
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

    // Ler veículos
    const vehicles = await readJsonFile<Vehicle[]>(VEHICLES_FILE, []);
    const vehicleIndex = vehicles.findIndex((v: Vehicle) => v.id === id);

    if (vehicleIndex === -1) {
      return sendError(res, req, 'Veículo não encontrado', 404);
    }

    // Toggle disponibilidade
    vehicles[vehicleIndex].available = !vehicles[vehicleIndex].available;
    vehicles[vehicleIndex].updated_at = new Date().toISOString();

    await writeJsonFile(VEHICLES_FILE, vehicles, 0o600);

    // Log da operação
    await logCrudOperation('vehicle', 'patch', id, user.id, req);

    return sendResponse(res, req, vehicles[vehicleIndex], 200);
  } catch (error) {
    console.error('Erro ao alternar disponibilidade:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}
