import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, isOptionsRequest } from './lib/cors.js';
import { sendResponse, sendError } from './lib/response.js';
import { validateToken, extractTokenFromHeader } from './lib/auth.js';
import { checkRateLimit, recordAttempt, getRateLimitIdentifier } from './lib/rate-limiter.js';
import { logFileUpload, logSecurityEvent } from './lib/logger.js';
import { getUploadPath } from './lib/file-ops.js';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { IncomingForm, File as FormidableFile } from 'formidable';
import { IncomingMessage } from 'http';

// Configurações
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB

// Configuração do body parser (desativado para uploads)
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Calcula tamanho total do diretório de uploads
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
 * Parse form data from request
 */
async function parseFormData(req: VercelRequest): Promise<{ file: FormidableFile | null; type: string }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize: MAX_FILE_SIZE,
      keepExtensions: true,
    });

    form.parse(req as unknown as IncomingMessage, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      const imageFiles = files.image;
      const file = Array.isArray(imageFiles) ? imageFiles[0] : imageFiles || null;
      const typeField = fields.type;
      const type = (Array.isArray(typeField) ? typeField[0] : typeField) || 'vehicle';

      resolve({ file, type });
    });
  });
}

/**
 * Handler principal para /api/upload
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (isOptionsRequest(req)) {
    return handleOptions(req, res);
  }

  if (req.method !== 'POST') {
    return sendError(res, req, 'Método não permitido', 405);
  }

  return handlePost(req, res);
}

/**
 * POST /api/upload
 * Upload de imagens (salva localmente)
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Autenticação OBRIGATÓRIA
    const authHeader = req.headers.authorization as string | undefined;
    const token = extractTokenFromHeader(authHeader || null);
    
    if (!token) {
      await logSecurityEvent('Tentativa de upload sem autenticação', 'WARNING', 
        { ip: (req.headers['x-forwarded-for'] as string) || 'unknown' });
      return sendError(res, req, 'Autenticação obrigatória para upload', 401);
    }

    const user = await validateToken(token);
    if (!user) {
      await logSecurityEvent('Tentativa de upload com token inválido', 'WARNING',
        { ip: (req.headers['x-forwarded-for'] as string) || 'unknown' });
      return sendError(res, req, 'Token inválido ou expirado', 401);
    }

    // 2. Rate limiting
    const uploadIdentifier = getRateLimitIdentifier(req, 'upload');
    const rateCheck = await checkRateLimit(uploadIdentifier, 10, 1); // 10 uploads por minuto

    if (!rateCheck.allowed) {
      await logSecurityEvent('Rate limit excedido no upload', 'WARNING',
        { user_id: user.id, username: user.username });
      return sendError(res, req, 'Muitos uploads. Aguarde um momento.', 429);
    }

    // 3. Parse form data
    const { file, type } = await parseFormData(req);

    if (!file) {
      return sendError(res, req, 'Nenhuma imagem foi enviada', 400);
    }

    // Validar tipo
    if (!['vehicle', 'logo', 'favicon', 'og-image'].includes(type)) {
      return sendError(res, req, 'Tipo de upload inválido', 400);
    }

    // Verificar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return sendError(res, req, 'Imagem muito grande. Máximo: 5MB', 400);
    }

    // Verificar MIME type
    if (!file.mimetype || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return sendError(res, req, 'Tipo de arquivo não permitido. Use: JPG, PNG ou WebP', 400);
    }

    // Verificar extensão
    const extension = file.originalFilename?.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return sendError(res, req, 'Extensão de arquivo não permitida. Use: JPG, PNG ou WebP', 400);
    }

    // Verificar espaço total ocupado
    const baseUploadDir = getUploadPath();
    const currentSize = await calculateTotalSize(baseUploadDir);

    if (currentSize + file.size > MAX_TOTAL_SIZE) {
      return sendError(res, req, 'Limite de armazenamento atingido. Remova arquivos antigos.', 507);
    }

    // Ler arquivo
    const buffer = await fs.readFile(file.filepath);

    // Validação profunda com sharp
    let metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch {
      return sendError(res, req, 'Arquivo não é uma imagem válida', 400);
    }

    // Verificar formato real
    if (metadata.format && !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
      return sendError(res, req, 'Formato de imagem inválido', 400);
    }

    // Gerar nome único
    const uniqueId = nanoid(10);
    const outputFormat = metadata.format === 'png' ? 'png' : 'jpeg';
    const filename = `${uniqueId}.${outputFormat}`;

    // Otimizar imagem com Sharp
    let optimizedBuffer: Buffer;
    
    if (outputFormat === 'png') {
      optimizedBuffer = await sharp(buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toBuffer();
    } else {
      optimizedBuffer = await sharp(buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // Salvar localmente
    const uploadDir = type === 'vehicle' 
      ? getUploadPath('vehicles')
      : getUploadPath('site');

    await fs.mkdir(uploadDir, { recursive: true, mode: 0o755 });
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, optimizedBuffer);
    
    const webPath = type === 'vehicle' 
      ? `/uploads/vehicles/${filename}`
      : `/uploads/site/${filename}`;

    // Limpar arquivo temporário
    try {
      await fs.unlink(file.filepath);
    } catch {
      // Ignora erro de limpeza
    }

    // Registrar sucesso no rate limiter
    await recordAttempt(uploadIdentifier, true, req);

    // Log da operação
    await logFileUpload(filename, optimizedBuffer.length, file.mimetype || 'unknown', user?.id, req);

    return sendResponse(
      res, req,
      {
        success: true,
        message: 'Upload realizado com sucesso',
        filename,
        url: webPath,
        size: optimizedBuffer.length,
        originalSize: file.size,
        type: file.mimetype,
      },
      200
    );
  } catch (error) {
    console.error('Erro no upload:', error);
    return sendError(res, req, 'Erro no servidor', 500);
  }
}
