import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSiteSettings } from '@/lib/siteConfigManager';
import { SiteConfig } from '@/types/siteConfig';
import { logger } from '@/lib/logger';

interface SiteConfigContextType {
  configs: Record<string, string>;
  loading: boolean;
  error: string | null;
  getConfig: (key: string, defaultValue?: string) => string;
  refreshConfigs: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

interface SiteConfigProviderProps {
  children: ReactNode;
}

export const SiteConfigProvider: React.FC<SiteConfigProviderProps> = ({ children }) => {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // SEMPRE carregar do servidor com cache-busting para evitar cache
      const timestamp = new Date().getTime();
      const data = await getSiteSettings();
      
      // Converter array para objeto {key: value}
      const configMap: Record<string, string> = {};
      data.forEach((config: SiteConfig) => {
        // Converter qualquer tipo para string
        const value = config.config_value;
        if (typeof value === 'string') {
          configMap[config.config_key] = value;
        } else if (typeof value === 'boolean') {
          configMap[config.config_key] = String(value);
        } else if (typeof value === 'object' && value !== null) {
          configMap[config.config_key] = JSON.stringify(value);
        } else {
          configMap[config.config_key] = '';
        }
      });
      
      setConfigs(configMap);
      
      // Aplicar cores como CSS variables
      applyCSSVariables(configMap);
      
      // Aplicar configurações imediatamente antes de renderizar
      applyInitialConfigs(configMap);
      
      logger.info('Configurações carregadas do servidor:', Object.keys(configMap).length, 'chaves');
    } catch (err) {
      logger.error('Erro ao carregar configurações do site:', err);
      setError('Falha ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const applyInitialConfigs = (configMap: Record<string, string>) => {
    // Aplicar apenas título (favicon é gerenciado pelo useEffect)
    if (configMap.site_title) {
      document.title = configMap.site_title;
    } else if (configMap.site_name) {
      document.title = configMap.site_name;
    }
  };

  const applyCSSVariables = (configMap: Record<string, string>) => {
    const root = document.documentElement;
    
    // Aplicar cores
    if (configMap.color_primary) root.style.setProperty('--color-primary', configMap.color_primary);
    if (configMap.color_secondary) root.style.setProperty('--color-secondary', configMap.color_secondary);
    if (configMap.color_accent) root.style.setProperty('--color-accent', configMap.color_accent);
    if (configMap.color_background) root.style.setProperty('--color-background', configMap.color_background);
    if (configMap.color_text) root.style.setProperty('--color-text', configMap.color_text);
    if (configMap.color_text_light) root.style.setProperty('--color-text-light', configMap.color_text_light);
    if (configMap.color_border) root.style.setProperty('--color-border', configMap.color_border);
    if (configMap.color_success) root.style.setProperty('--color-success', configMap.color_success);
    if (configMap.color_error) root.style.setProperty('--color-error', configMap.color_error);
    if (configMap.color_warning) root.style.setProperty('--color-warning', configMap.color_warning);
  };

  const getConfig = (key: string, defaultValue: string = ''): string => {
    return configs[key] || defaultValue;
  };

  const refreshConfigs = async () => {
    // Recarregar diretamente do servidor
    await loadConfigs();
  };

  useEffect(() => {
    loadConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Observar mudanças no favicon e aplicar dinamicamente
  useEffect(() => {
    if (configs.site_favicon) {
      const updateFavicon = async () => {
        try {
          const timestamp = new Date().getTime();
          let imageUrl = configs.site_favicon;
          
          if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            if (import.meta.env.PROD) {
              imageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
            } else {
              const hostname = window.location.hostname;
              const backendUrl = (hostname === 'localhost' || hostname === '127.0.0.1') 
                ? 'http://localhost:3000' 
                : window.location.origin;
              imageUrl = `${backendUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
            }
          }
          
          const fetchUrl = imageUrl.includes('?') 
            ? `${imageUrl}&t=${timestamp}`
            : `${imageUrl}?t=${timestamp}`;
          
          const response = await fetch(fetchUrl, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Erro ao carregar favicon: ${response.status}`);
          }
          
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          
          const head = document.head;
          const faviconLinks = document.querySelectorAll('link[rel*="icon"]') as NodeListOf<HTMLLinkElement>;
          
          faviconLinks.forEach((link) => {
            if (link.href.startsWith('blob:')) {
              URL.revokeObjectURL(link.href);
            }
            link.remove();
          });
          
          const mimeType = blob.type || 'image/png';
          
          const favicon32 = document.createElement('link');
          favicon32.rel = 'icon';
          favicon32.type = mimeType;
          favicon32.sizes = '32x32';
          favicon32.href = blobUrl;
          head.appendChild(favicon32);
          
          const favicon16 = document.createElement('link');
          favicon16.rel = 'icon';
          favicon16.type = mimeType;
          favicon16.sizes = '16x16';
          favicon16.href = blobUrl;
          head.appendChild(favicon16);
          
          const appleTouchIcon = document.createElement('link');
          appleTouchIcon.rel = 'apple-touch-icon';
          appleTouchIcon.sizes = '180x180';
          appleTouchIcon.href = blobUrl;
          head.appendChild(appleTouchIcon);
          
          const shortcut = document.createElement('link');
          shortcut.rel = 'shortcut icon';
          shortcut.type = mimeType;
          shortcut.href = blobUrl;
          head.appendChild(shortcut);
          
          logger.info('Favicon atualizado via Blob URL');
        } catch (error) {
          logger.error('Erro ao atualizar favicon:', error);
        }
      };
      
      updateFavicon();
    }
  }, [configs.site_favicon]);

  // NÃO bloquear renderização durante carregamento
  // Isso permite que a logo padrão apareça imediatamente
  return (
    <SiteConfigContext.Provider value={{ configs, loading, error, getConfig, refreshConfigs }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig deve ser usado dentro de SiteConfigProvider');
  }
  return context;
};
