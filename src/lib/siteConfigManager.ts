import { SiteConfig, SiteConfigForm, PageSection, PageSectionForm, SectionReorderItem } from '@/types/siteConfig';
import { getAuthHeader } from './authManager';
import { logger } from './logger';
import { fetchWithRetry } from './fetchWithRetry';

// Detectar automaticamente a URL base do ambiente
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/[^/]+\.php$/, '');
  }
  
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // Em desenvolvimento, detectar se está acessando via IP da rede local
  const hostname = window.location.hostname;
  
  // Se for localhost ou 127.0.0.1, usar localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  
  // Se for IP da rede local (192.168.x.x, 10.x.x.x), usar o mesmo IP
  if (hostname.match(/^(192\.168\.|10\.)/)) {
    return `http://${hostname}:3000/api`;
  }
  
  // Fallback para localhost
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

// ============================================================================
// Site Settings API
// ============================================================================

/**
 * Buscar todas as configurações do site
 */
export async function getSiteSettings(category?: string): Promise<SiteConfig[]> {
  try {
    // Adicionar timestamp para evitar cache do navegador
    const timestamp = new Date().getTime();
    const baseUrl = category 
      ? `${API_BASE_URL}/site-settings?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/site-settings`;
    const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `_t=${timestamp}`;
    
    // Forçar sempre buscar do servidor, nunca usar cache
    const data = await fetchWithRetry<SiteConfig[]>(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    }, {
      retries: 3,
      backoff: 1000,
      retryOn: [408, 429, 500, 502, 503, 504]
    });
    return data;
  } catch (error) {
    logger.error('Erro ao buscar configurações:', error);
    throw error;
  }
}

/**
 * Buscar configuração específica
 */
export async function getSiteSetting(key: string): Promise<SiteConfig> {
  try {
    const response = await fetch(`${API_BASE_URL}/site-settings/${encodeURIComponent(key)}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar configuração: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Erro ao buscar configuração:', error);
    throw error;
  }
}

/**
 * Salvar/Atualizar configuração
 */
export async function saveSiteSetting(config: SiteConfigForm): Promise<SiteConfig> {
  try {
    const response = await fetchWithRetry<{ data: SiteConfig }>(`${API_BASE_URL}/site-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(config),
    }, {
      retries: 3,
      backoff: 1000,
      retryOn: [408, 429, 500, 502, 503, 504]
    });
    
    return response.data;
  } catch (error) {
    logger.error('Erro ao salvar configuração:', error);
    throw error;
  }
}

/**
 * Atualizar configuração existente
 */
export async function updateSiteSetting(key: string, updates: Partial<SiteConfigForm>): Promise<SiteConfig> {
  try {
    const data = await fetchWithRetry<SiteConfig>(`${API_BASE_URL}/site-settings/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(updates),
    }, {
      retries: 3,
      backoff: 1000,
      retryOn: [408, 429, 500, 502, 503, 504]
    });
    return data;
  } catch (error) {
    logger.error('Erro ao atualizar configuração:', error);
    throw error;
  }
}

/**
 * Deletar configuração
 */
export async function deleteSiteSetting(key: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/site-settings/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao deletar configuração: ${response.statusText}`);
    }
  } catch (error) {
    logger.error('Erro ao deletar configuração:', error);
    throw error;
  }
}

/**
 * Salvar múltiplas configurações de uma vez
 */
export async function saveBulkSettings(configs: SiteConfigForm[]): Promise<SiteConfig[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/site-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(configs),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao salvar configurações: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || configs;
  } catch (error) {
    logger.error('Erro ao salvar configurações em lote:', error);
    throw error;
  }
}

// ============================================================================
// Page Sections API
// ============================================================================

/**
 * Buscar todas as seções da página
 */
export async function getPageSections(activeOnly = false): Promise<PageSection[]> {
  try {
    const url = activeOnly 
      ? `${API_BASE_URL}/page-sections.php?active=true`
      : `${API_BASE_URL}/page-sections.php`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar seções: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Erro ao buscar seções:', error);
    throw error;
  }
}

/**
 * Buscar seção específica por ID
 */
export async function getPageSection(id: number): Promise<PageSection> {
  try {
    const response = await fetch(`${API_BASE_URL}/page-sections.php?id=${id}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar seção: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Erro ao buscar seção:', error);
    throw error;
  }
}

/**
 * Buscar seção por chave
 */
export async function getPageSectionByKey(key: string): Promise<PageSection> {
  try {
    const response = await fetch(`${API_BASE_URL}/page-sections.php?key=${encodeURIComponent(key)}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar seção: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Erro ao buscar seção:', error);
    throw error;
  }
}

/**
 * Criar nova seção
 */
export async function createPageSection(section: PageSectionForm): Promise<PageSection> {
  try {
    const response = await fetch(`${API_BASE_URL}/page-sections.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(section),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao criar seção: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Erro ao criar seção:', error);
    throw error;
  }
}

/**
 * Atualizar seção existente
 */
export async function updatePageSection(id: number, updates: Partial<PageSectionForm>): Promise<PageSection> {
  try {
    const response = await fetch(`${API_BASE_URL}/page-sections.php?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao atualizar seção: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Erro ao atualizar seção:', error);
    throw error;
  }
}

/**
 * Deletar seção
 */
export async function deletePageSection(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/page-sections.php?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao deletar seção: ${response.statusText}`);
    }
  } catch (error) {
    logger.error('Erro ao deletar seção:', error);
    throw error;
  }
}

/**
 * Toggle status ativo/inativo de uma seção
 */
export async function toggleSectionActive(id: number): Promise<PageSection> {
  try {
    const response = await fetch(`${API_BASE_URL}/page-sections.php?id=${id}&action=toggle`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao alternar status da seção: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Erro ao alternar status da seção:', error);
    throw error;
  }
}

/**
 * Reordenar seções
 */
export async function reorderSections(sections: SectionReorderItem[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/page-sections.php?action=reorder`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ sections }),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao reordenar seções: ${response.statusText}`);
    }
  } catch (error) {
    logger.error('Erro ao reordenar seções:', error);
    throw error;
  }
}
