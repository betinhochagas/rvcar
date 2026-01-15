// Tipos de Configurações do Site
export interface SiteSetting {
  config_key: string;
  config_value: string;
  config_type: 'text' | 'number' | 'boolean' | 'url' | 'email' | 'tel';
  description: string;
}

export interface SiteSettingInternal {
  value: string;
  type: string;
  description: string;
}

export interface SiteSettingsData {
  [key: string]: SiteSettingInternal;
}

export interface CreateSettingRequest {
  config_key: string;
  config_value: string;
  config_type?: string;
  description?: string;
}

export interface UpdateSettingRequest {
  config_value?: string;
  config_type?: string;
  description?: string;
}
