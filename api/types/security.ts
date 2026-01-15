// Tipos de Segurança
export interface RateLimit {
  count: number;
  first_attempt: number;
  last_attempt: number;
}

export interface RateLimits {
  [identifier: string]: RateLimit;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining_minutes?: number;
  attempts: number;
}

export interface CsrfToken {
  token: string;
  created_at: number;
  expires_at: number;
}

export interface CsrfTokens {
  [adminId: string]: CsrfToken;
}

export interface ApiError {
  error: true;
  message: string;
}

export type ApiResponse<T> = T | ApiError;
