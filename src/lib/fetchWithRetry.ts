/**
 * Fetch com Retry Automático
 * Implementa retry com exponential backoff para requisições resilientes
 */

interface RetryOptions {
  retries?: number;
  backoff?: number;
  retryOn?: number[];
}

/**
 * Fetch com retry automático e exponential backoff
 * 
 * @param url - URL da requisição
 * @param options - Opções do fetch
 * @param retryOptions - Configurações de retry
 * @returns Promise com resposta tipada
 */
export async function fetchWithRetry<T = unknown>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    backoff = 1000,
    retryOn = [408, 429, 500, 502, 503, 504] // Timeout, Rate Limit, Server Errors
  } = retryOptions;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Se resposta OK, retornar
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json() as T;
        }
        return await response.text() as T;
      }
      
      // Não fazer retry em erros 4xx (exceto especificados em retryOn)
      if (response.status >= 400 && response.status < 500 && !retryOn.includes(response.status)) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      // Para erros 5xx ou especificados, fazer retry
      if (retryOn.includes(response.status)) {
        const isLastAttempt = attempt === retries - 1;
        
        if (isLastAttempt) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = backoff * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Outros erros, lançar imediatamente
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
      
    } catch (error) {
      const isLastAttempt = attempt === retries - 1;
      
      // Se for erro de rede (não HTTP), fazer retry
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (isLastAttempt) {
          throw new Error('Erro de conexão. Verifique sua internet.');
        }
        
        // Exponential backoff
        const delay = backoff * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Outros erros, lançar
      throw error;
    }
  }
  
  throw new Error('Máximo de tentativas atingido');
}

/**
 * Helper para GET com retry
 */
export async function getWithRetry<T = unknown>(
  url: string,
  headers: Record<string, string> = {},
  retryOptions?: RetryOptions
): Promise<T> {
  return fetchWithRetry<T>(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }, retryOptions);
}

/**
 * Helper para POST com retry
 */
export async function postWithRetry<T = unknown>(
  url: string,
  data: unknown,
  headers: Record<string, string> = {},
  retryOptions?: RetryOptions
): Promise<T> {
  return fetchWithRetry<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  }, retryOptions);
}
