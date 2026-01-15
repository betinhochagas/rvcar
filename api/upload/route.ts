import { NextRequest } from 'next/server';
import { handleOptions } from '../lib/cors';
import { sendResponse, sendError } from '../lib/response';
import { validateToken, extractTokenFromHeader } from '../lib/auth';
import { checkRateLimit, recordAttempt, getRateLimitIdentifier } from '../lib/rate-limiter';
import { logFileUpload, logSecurityEvent } from '../lib/logger';
import { getUploadPath } from '../lib/file-ops';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

// Configurações
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB

/**
 * Calcula tamanho total dos uploads
 */
async function calculateTotalSize(baseDir: string): Promise<number> {
  let totalSize = 0;
  
  try {
    const exists = await fs.access(baseDir).then(() => true).catch(() => false);
    if (!exists) return 0;

    async function scanDir(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scanDir(fullPath);
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
    }
    
    await scanDir(baseDir);
  } catch (error) {
    console.error('Erro ao calcular tamanho total:', error);
  }
  
  return totalSize;
}

/**
 * POST /api/upload
 * Upload de imagens
 */
export async function POST(request: NextRequest) {
  try {
    // 1. CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // 2. Autenticação OBRIGATÓRIA (segurança crítica)
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      await logSecurityEvent('Tentativa de upload sem autenticação', 'WARNING', 
        { ip: request.headers.get('x-forwarded-for') || 'unknown' });
      return sendError('Autenticação obrigatória para upload', request, 401);
    }

    const user = await validateToken(token);
    if (!user) {
      await logSecurityEvent('Tentativa de upload com token inválido', 'WARNING',
        { ip: request.headers.get('x-forwarded-for') || 'unknown' });
      return sendError('Token inválido ou expirado', request, 401);
    }

    // 3. Rate limiting (após autenticação)
    const uploadIdentifier = getRateLimitIdentifier(request, 'upload');
    const rateCheck = await checkRateLimit(uploadIdentifier, 2, 1); // 2 uploads em 1 minuto

    if (!rateCheck.allowed) {
      await logSecurityEvent('Rate limit excedido no upload', 'WARNING',
        { user_id: user.id, username: user.username });
      return sendError('Muitos uploads. Aguarde um momento.', request, 429);
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const type = (formData.get('type') as string) || 'vehicle';

    if (!file) {
      return sendError('Nenhuma imagem foi enviada', request, 400);
    }

    // Validar tipo
    if (!['vehicle', 'logo', 'favicon', 'og-image'].includes(type)) {
      return sendError('Tipo de upload inválido', request, 400);
    }

    // Verificar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return sendError('Imagem muito grande. Máximo: 5MB', request, 400);
    }

    // Verificar MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return sendError('Tipo de arquivo não permitido. Use: JPG, PNG ou WebP', request, 400);
    }

    // Verificar extensão
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return sendError('Extensão de arquivo não permitida. Use: JPG, PNG ou WebP', request, 400);
    }

    // Verificar espaço total ocupado
    const baseUploadDir = getUploadPath();
    const currentSize = await calculateTotalSize(baseUploadDir);

    if (currentSize + file.size > MAX_TOTAL_SIZE) {
      return sendError('Limite de armazenamento atingido. Remova arquivos antigos.', request, 507);
    }

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validação profunda com sharp (verifica se é imagem válida)
    let metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch (error) {
      return sendError('Arquivo não é uma imagem válida', request, 400);
    }

    // Verificar se o formato real corresponde ao declarado
    if (metadata.format && !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
      return sendError('Formato de imagem inválido', request, 400);
    }

    // Definir diretório baseado no tipo
    const uploadDir = type === 'vehicle' 
      ? getUploadPath('vehicles')
      : getUploadPath('site');

    // Criar diretório se não existir
    await fs.mkdir(uploadDir, { recursive: true, mode: 0o755 });

    // Gerar nome único
    const uniqueId = nanoid(10);
    const filename = `${uniqueId}.${metadata.format || extension}`;
    const filepath = path.join(uploadDir, filename);

    // Salvar arquivo
    await sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true }) // Otimizar tamanho
      .jpeg({ quality: 85 }) // Comprimir se for JPEG
      .png({ compressionLevel: 9 }) // Comprimir se for PNG
      .webp({ quality: 85 }) // Comprimir se for WebP
      .toFile(filepath);

    // Registrar sucesso no rate limiter
    await recordAttempt(uploadIdentifier, true, request);

    // Log da operação (usa user já validado anteriormente)
    await logFileUpload(filename, file.size, file.type, user?.id, request);

    // Retornar URL do arquivo
    const webPath = type === 'vehicle' 
      ? `/uploads/vehicles/${filename}`
      : `/uploads/site/${filename}`;

    return sendResponse(
      {
        success: true,
        message: 'Upload realizado com sucesso',
        filename,
        url: webPath,
        size: file.size,
        type: file.type,
      },
      request,
      200
    );
  } catch (error) {
    console.error('Erro no upload:', error);
    return sendError('Erro no servidor', request, 500);
  }
}

/**
 * OPTIONS /api/upload
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}
