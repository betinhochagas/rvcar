import { NextRequest } from 'next/server';
import { handleOptions } from '../lib/cors';
import { sendResponse, sendError, parseJsonBody, validateContentType } from '../lib/response';
import { createVehicleSchema, formatZodError } from '../lib/validator';
import { validateToken, extractTokenFromHeader } from '../lib/auth';
import { logCrudOperation } from '../lib/logger';
import { readJsonFile, writeJsonFile, getDataPath } from '../lib/file-ops';
import type { Vehicle } from '../types/vehicle';

export const runtime = 'nodejs';

const VEHICLES_FILE = getDataPath('vehicles.json');

/**
 * GET /api/vehicles
 * Lista todos os veículos (público)
 */
export async function GET(request: NextRequest) {
  try {
    const vehicles = await readJsonFile<Vehicle[]>(VEHICLES_FILE);
    
    // Filtros opcionais
    const { searchParams } = new URL(request.url);
    const availableOnly = searchParams.get('available') === 'true';

    let filteredVehicles = vehicles;

    if (availableOnly) {
      filteredVehicles = vehicles.filter((v: Vehicle) => v.available === true);
    }

    return sendResponse(filteredVehicles, request, 200);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * POST /api/vehicles
 * Cria novo veículo (requer autenticação)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return sendError('Token de autenticação necessário', request, 401);
    }

    const user = await validateToken(token);

    if (!user) {
      return sendError('Token inválido ou expirado', request, 401);
    }

    // Validar Content-Type
    if (!validateContentType(request)) {
      return sendError('Content-Type deve ser application/json', request, 415);
    }

    // Parse do body
    const body = await parseJsonBody(request);
    
    if (!body) {
      return sendError('Dados inválidos', request, 400);
    }

    // Validar com Zod
    const validation = createVehicleSchema.safeParse(body);
    if (!validation.success) {
      return sendError(formatZodError(validation.error), request, 400);
    }

    const vehicleData = validation.data;

    // Ler veículos existentes
    const vehicles = await readJsonFile<Vehicle[]>(VEHICLES_FILE);

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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vehicles.push(newVehicle);
    await writeJsonFile(VEHICLES_FILE, vehicles, 0o600);

    // Log da operação
    await logCrudOperation('vehicle', 'create', id, user.id, request);

    return sendResponse(newVehicle, request, 201);
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * OPTIONS /api/vehicles
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}
