import { z } from 'zod';

/**
 * Schemas de validação usando Zod
 */

// Validação de string básica
export const stringSchema = z.string().trim().min(1);

// Validação de email
export const emailSchema = z.string().email('Email inválido');

// Validação de URL
export const urlSchema = z.string().url('URL inválida').optional().or(z.literal(''));

// Validação de telefone brasileiro (10 ou 11 dígitos)
export const phoneSchema = z.string().regex(
  /^[0-9]{10,11}$/,
  'Telefone deve ter 10 ou 11 dígitos'
);

// Validação de CPF/CNPJ
export const documentSchema = z.string().regex(
  /^[0-9]{11}$|^[0-9]{14}$/,
  'Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos'
);

// Validação de ano
export const yearSchema = z.number().int().min(1900).max(2100);

// Validação de preço
export const priceSchema = z.number().positive('Preço deve ser positivo');

// Validação de boolean
export const booleanSchema = z.boolean().or(
  z.enum(['true', 'false', '1', '0']).transform((val) => val === 'true' || val === '1')
);

/**
 * Schema de Login
 */
export const loginSchema = z.object({
  username: z.string().min(3, 'Usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

/**
 * Schema de Verificação de Token
 */
export const verifyTokenSchema = z.object({
  token: z.string().length(64, 'Token inválido'),
});

/**
 * Schema de Alteração de Senha
 */
export const changePasswordSchema = z.object({
  token: z.string().length(64, 'Token inválido'),
  current_password: z.string().min(1, 'Senha atual é obrigatória'),
  new_password: z
    .string()
    .min(8, 'A nova senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
});

/**
 * Schema de Criação de Veículo
 */
export const createVehicleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: priceSchema,
  image: z.string().optional().default(''),
  features: z.array(z.string()).optional().default([]),
  available: booleanSchema.optional().default(true),
  featured: booleanSchema.optional().default(false),
});

/**
 * Schema de Atualização de Veículo
 */
export const updateVehicleSchema = z.object({
  name: z.string().min(1).optional(),
  price: priceSchema.optional(),
  image: z.string().optional(),
  features: z.array(z.string()).optional(),
  available: booleanSchema.optional(),
  featured: booleanSchema.optional(),
});

/**
 * Schema de Configuração do Site
 */
export const siteSettingSchema = z.object({
  config_key: z.string().min(1, 'Chave é obrigatória'),
  config_value: z.string(),
  config_type: z.enum(['text', 'number', 'boolean', 'url', 'email', 'tel', 'color', 'image']).optional().default('text'),
  description: z.string().optional().default(''),
});

/**
 * Schema de Upload
 */
export const uploadSchema = z.object({
  type: z.enum(['vehicle', 'logo', 'favicon', 'og-image']).optional().default('vehicle'),
});

/**
 * Funções auxiliares de sanitização
 */

/**
 * Remove tags HTML perigosas
 */
export function sanitizeHtml(input: string, allowBasicTags: boolean = false): string {
  if (allowBasicTags) {
    // Permite apenas tags básicas seguras
    return input.replace(/<(?!\/?(?:p|br|b|i|u|strong|em|a|ul|ol|li)\b)[^>]+>/gi, '');
  }
  // Remove todas as tags
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitiza telefone (remove caracteres não numéricos)
 */
export function sanitizePhone(input: string): string {
  return input.replace(/[^0-9]/g, '');
}

/**
 * Sanitiza documento (remove caracteres não numéricos)
 */
export function sanitizeDocument(input: string): string {
  return input.replace(/[^0-9]/g, '');
}

/**
 * Valida e retorna erro formatado
 */
export function formatZodError(error: z.ZodError): string {
  return error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
}
