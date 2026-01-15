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
      
      // SEMPRE carregar do servidor para garantir sincronização entre dispositivos
      // Cache removido para evitar problemas de sincronização
      const data = await getSiteSettings();
      
      // Converter array para objeto {key: value}
      const configMap: Record<string, string> = {};
      data.forEach((config: SiteConfig) => {
        configMap[config.config_key] = config.config_value;
      });
      
      setConfigs(configMap);
      
      // Aplicar cores como CSS variables
      applyCSSVariables(configMap);
      
      // Aplicar configurações imediatamente antes de renderizar
      applyInitialConfigs(configMap);
      
      // Cache removido - sempre busca do servidor para sincronização
    } catch (err) {
      logger.error('Erro ao carregar configurações do site:', err);
      setError('Falha ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const applyInitialConfigs = (configMap: Record<string, string>) => {
    // Aplicar título e favicon ANTES de renderizar para evitar flash
    // Usar site_title se disponível, senão usar site_name
    if (configMap.site_title) {
      document.title = configMap.site_title;
    } else if (configMap.site_name) {
      document.title = configMap.site_name;
    }
    
    // Atualizar favicon com cache-busting
    if (configMap.site_favicon) {
      const timestamp = new Date().getTime();
      const faviconUrl = configMap.site_favicon.includes('?') 
        ? `${configMap.site_favicon}&t=${timestamp}`
        : `${configMap.site_favicon}?t=${timestamp}`;
      
      // Atualizar todos os links de favicon
      const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (faviconLink) {
        faviconLink.href = faviconUrl;
      }
      
      const shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
      if (shortcutIcon) {
        shortcutIcon.href = faviconUrl;
      }
      
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (appleTouchIcon) {
        appleTouchIcon.href = faviconUrl;
      }
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
  }, []);

  // Mostrar loader enquanto carrega configurações críticas
  if (loading) {
    return (
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        zIndex: 9999
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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
