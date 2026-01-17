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
        configMap[config.config_key] = config.config_value;
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
  }, []);

  // Observar mudanças no favicon e aplicar dinamicamente
  useEffect(() => {
    console.log('🔍 useEffect favicon disparado. site_favicon:', configs.site_favicon);
    
    if (configs.site_favicon) {
      const timestamp = new Date().getTime();
      const faviconUrl = configs.site_favicon.includes('?') 
        ? `${configs.site_favicon}&t=${timestamp}`
        : `${configs.site_favicon}?t=${timestamp}`;
      
      console.log('🖼️ Atualizando favicon para:', faviconUrl);
      
      // ESTRATÉGIA: Remover e recriar links para forçar o navegador a recarregar
      // Isso é necessário porque navegadores fazem cache agressivo de favicons
      const head = document.head;
      const faviconLinks = document.querySelectorAll('link[rel*="icon"]') as NodeListOf<HTMLLinkElement>;
      console.log('📌 Encontrados', faviconLinks.length, 'elementos de favicon');
      
      // Detectar tipo de imagem pela extensão
      const ext = faviconUrl.split('.').pop()?.toLowerCase().split('?')[0];
      let mimeType = 'image/png';
      if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
      else if (ext === 'ico') mimeType = 'image/x-icon';
      else if (ext === 'svg') mimeType = 'image/svg+xml';
      
      console.log('🎨 Tipo detectado:', mimeType);
      
      // Remover TODOS os favicons não-SVG
      faviconLinks.forEach((link, index) => {
        if (link.type !== 'image/svg+xml') {
          console.log(`  🗑️ [${index}] Removendo ${link.rel} antigo`);
          link.remove();
        } else {
          console.log(`  ⊗ [${index}] ${link.rel} (SVG) - mantido como fallback`);
        }
      });
      
      // Criar novos links de favicon
      // 1. Favicon principal 32x32
      const favicon32 = document.createElement('link');
      favicon32.rel = 'icon';
      favicon32.type = mimeType;
      favicon32.sizes = '32x32';
      favicon32.href = faviconUrl;
      head.insertBefore(favicon32, head.firstChild);
      console.log('  ✅ Criado favicon 32x32:', faviconUrl);
      
      // 2. Favicon 16x16
      const favicon16 = document.createElement('link');
      favicon16.rel = 'icon';
      favicon16.type = mimeType;
      favicon16.sizes = '16x16';
      favicon16.href = faviconUrl;
      head.insertBefore(favicon16, head.firstChild);
      console.log('  ✅ Criado favicon 16x16:', faviconUrl);
      
      // 3. Apple Touch Icon
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.sizes = '180x180';
      appleTouchIcon.href = faviconUrl;
      head.insertBefore(appleTouchIcon, head.firstChild);
      console.log('  ✅ Criado apple-touch-icon:', faviconUrl);
      
      // 4. Shortcut icon (compatibilidade)
      const shortcut = document.createElement('link');
      shortcut.rel = 'shortcut icon';
      shortcut.type = mimeType;
      shortcut.href = faviconUrl;
      head.insertBefore(shortcut, head.firstChild);
      console.log('  ✅ Criado shortcut icon:', faviconUrl);
      
      logger.info('Favicon atualizado dinamicamente:', faviconUrl);
      console.log('✅ Favicon aplicado com sucesso! Novos elementos criados. Force refresh (Ctrl+F5) se não aparecer.');
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
