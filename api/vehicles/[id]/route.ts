import { NextRequest } from 'next/server';
import { handleOptions } from '../../lib/cors';
import { sendResponse, sendError, parseJsonBody, validateContentType } from '../../lib/response';
import { updateVehicleSchema, formatZodError } from '../../lib/validator';
import { validateToken, extractTokenFromHeader } from '../../lib/auth';
import { logCrudOperation } from '../../lib/logger';
import { readJsonFile, writeJsonFile, getDataPath } from '../../lib/file-ops';
import type { Vehicle } from '../../types/vehicle';

export const runtime = 'nodejs';

const VEHICLES_FILE = getDataPath('vehicles.json');

/**
 * GET /api/vehicles/[id]
 * Busca veículo específico (público)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return sendError('ID inválido', request, 400);
    }

    const vehicles = await readJsonFile<Vehicle[]>(VEHICLES_FILE);
    const vehicle = vehicles.find((v: Vehicle) => v.id === id);

    if (!vehicle) {
      return sendError('Veículo não encontrado', request, 404);
    }

    return sendResponse(vehicle, request, 200);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * PUT /api/vehicles/[id]
 * Atualiza veículo (requer autenticação)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return sendError('ID inválido', request, 400);
    }

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
    const validation = updateVehicleSchema.safeParse(body);
    if (!validation.success) {
      return sendError(formatZodError(validation.error), request, 400);
    }

    const updates = validation.data;

    // Ler veículos
    const vehicles = await readJsonFile<Vehicle[]>(VEHICLES_FILE);
    const vehicleIndex = vehicles.findIndex((v) => v.id === id);

    if (vehicleIndex === -1) {
      return sendError('Veículo não encontrado', request, 404);
    }

    // Atualizar campos
    const vehicle = vehicles[vehicleIndex];
    
    if (updates.name !== undefined) vehicle.name = updates.name;
    if (updates.price !== undefined) vehicle.price = updates.price;
    if (updates.image !== undefined) vehicle.image = updates.image;
    if (updates.features !== undefined) vehicle.features = updates.features;
    if (updates.available !== undefined) vehicle.available = updates.available;
    
    vehicle.updated_at = new Date().toISOString();

    await writeJsonFile(VEHICLES_FILE, vehicles, 0o600);

    // Log da operação
    await logCrudOperation('vehicle', 'update', id, user.id, request);

    return sendResponse(vehicle, request, 200);
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * DELETE /api/vehicles/[id]
 * Remove veículo (requer autenticação)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return sendError('ID inválido', request, 400);
    }

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

    // Ler veículos
    const vehicles = await readJsonFile<Vehicle[]>(VEHICLES_FILE);
    const filteredVehicles = vehicles.filter((v: Vehicle) => v.id !== id);

    if (filteredVehicles.length === vehicles.length) {
      return sendError('Veículo não encontrado', request, 404);
    }

    await writeJsonFile(VEHICLES_FILE, filteredVehicles, 0o600);

    // Log da operação
    await logCrudOperation('vehicle', 'delete', id, user.id, request);

    return sendResponse(
      { success: true, message: 'Veículo removido com sucesso' },
      request,
      200
    );
  } catch (error) {
    console.error('Erro ao remover veículo:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * PATCH /api/vehicles/[id]
 * Toggle disponibilidade (requer autenticação)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return sendError('ID inválido', request, 400);
    }

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

    // Ler veículos
    const vehicles = await readJsonFile<Vehicle[]>(VEHICLES_FILE);
    const vehicleIndex = vehicles.findIndex((v: Vehicle) => v.id === id);

    if (vehicleIndex === -1) {
      return sendError('Veículo não encontrado', request, 404);
    }

    // Toggle disponibilidade
    vehicles[vehicleIndex].available = !vehicles[vehicleIndex].available;
    vehicles[vehicleIndex].updated_at = new Date().toISOString();

    await writeJsonFile(VEHICLES_FILE, vehicles, 0o600);

    // Log da operação
    await logCrudOperation('vehicle', 'patch', id, user.id, request);

    return sendResponse(vehicles[vehicleIndex], request, 200);
  } catch (error) {
    console.error('Erro ao alternar disponibilidade:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * OPTIONS /api/vehicles/[id]
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}
