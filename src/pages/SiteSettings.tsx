import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { logger } from '@/lib/logger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Image as ImageIcon, Globe, Mail, Share2, Upload, X, ExternalLink, Loader2 } from 'lucide-react';
import { isAuthenticated, logout } from '@/lib/authManager';
import { getSiteSettings, saveBulkSettings } from '@/lib/siteConfigManager';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { SiteConfig } from '@/types/siteConfig';
import { uploadImage, validateImage, createImagePreview } from '@/lib/uploadManager';
import { toast } from 'sonner';

const SiteSettings = () => {
  const navigate = useNavigate();
  const { refreshConfigs } = useSiteConfig();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingOgImage, setUploadingOgImage] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');
  const [ogImagePreview, setOgImagePreview] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    loadSettings();
  }, [navigate]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSiteSettings();
      
      // Converter array para objeto para facilitar o acesso
      const configsObj: Record<string, string> = {};
      data.forEach((config: SiteConfig) => {
        configsObj[config.config_key] = String(config.config_value || '');
      });
      
      setConfigs(configsObj);
    } catch (error) {
      logger.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (key: 'site_logo' | 'site_favicon' | 'og_image', file: File) => {
    const isLogo = key === 'site_logo';
    const isFavicon = key === 'site_favicon';
    const isOgImage = key === 'og_image';
    
    const setUploading = isLogo ? setUploadingLogo : isFavicon ? setUploadingFavicon : setUploadingOgImage;
    const setPreview = isLogo ? setLogoPreview : isFavicon ? setFaviconPreview : setOgImagePreview;
    const uploadType = isLogo ? 'logo' : isFavicon ? 'favicon' : 'og-image';

    try {
      // Validar imagem
      const validation = validateImage(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Imagem inválida');
        return;
      }

      setUploading(true);

      // Criar preview
      const preview = await createImagePreview(file);
      setPreview(preview);

      // Fazer upload com tipo específico
      const imageUrl = await uploadImage(file, { type: uploadType });
      
      // Atualizar configuração
      handleChange(key, imageUrl);
      
      toast.success(isLogo ? 'Logo enviada com sucesso!' : isFavicon ? 'Favicon enviado com sucesso!' : 'Imagem Open Graph enviada com sucesso!');
    } catch (error) {
      logger.error('Erro ao fazer upload:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar imagem');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (key: 'site_logo' | 'site_favicon' | 'og_image') => {
    const isLogo = key === 'site_logo';
    const isFavicon = key === 'site_favicon';
    const isOgImage = key === 'og_image';
    
    const setPreview = isLogo ? setLogoPreview : isFavicon ? setFaviconPreview : setOgImagePreview;
    
    handleChange(key, '');
    setPreview('');
    toast.success(isLogo ? 'Logo removida' : isFavicon ? 'Favicon removido' : 'Imagem Open Graph removida');
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      
      const configsToSave = Object.entries(configs).map(([key, value]) => ({
        config_key: key,
        config_value: value,
        config_type: key.startsWith('color_') || key.startsWith('button_') ? 'color' as const : 
                     key.includes('image') || key.includes('logo') || key.includes('favicon') || key.includes('og_image') ? 'image' as const : 
                     'text' as const,
        description: ''
      }));

      await saveBulkSettings(configsToSave);
      
      // Atualizar o contexto global para aplicar as mudanças no site
      await refreshConfigs();
      
      toast.success('Configurações salvas com sucesso! Recarregue a página principal para ver as alterações.', {
        duration: 5000,
        action: {
          label: 'Ver Site',
          onClick: () => window.open('/', '_blank')
        }
      });
    } catch (error) {
      logger.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Painel
              </Button>
              <h1 className="text-2xl font-bold">Configurações do Site</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Site
              </Button>
              <Button onClick={handleSaveAll} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Tudo'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="branding">
              <ImageIcon className="w-4 h-4 mr-2" />
              Marca
            </TabsTrigger>
            <TabsTrigger value="og">
              <Globe className="w-4 h-4 mr-2" />
              Preview Links
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Mail className="w-4 h-4 mr-2" />
              Contato
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="w-4 h-4 mr-2" />
              Redes Sociais
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Identidade Visual</CardTitle>
                <CardDescription>
                  Configure a logo, título e elementos visuais principais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Nome da Empresa</Label>
                    <Input
                      id="site_name"
                      type="text"
                      value={configs.site_name || ''}
                      onChange={(e) => handleChange('site_name', e.target.value)}
                      placeholder="Nome da Empresa"
                    />
                    <p className="text-sm text-muted-foreground">
                      Nome usado no header e footer do site
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site_title">Título do Site</Label>
                    <Input
                      id="site_title"
                      type="text"
                      value={configs.site_title || ''}
                      onChange={(e) => handleChange('site_title', e.target.value)}
                      placeholder="Nome da Empresa - Sua Descrição"
                    />
                    <p className="text-sm text-muted-foreground">
                      Título da aba do navegador (se vazio, usa o Nome da Empresa)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site_logo">Logo do Site</Label>
                    <div className="flex gap-2">
                      <Input
                        id="site_logo"
                        type="text"
                        value={configs.site_logo || ''}
                        onChange={(e) => handleChange('site_logo', e.target.value)}
                        placeholder="/logo.svg ou URL da imagem"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        disabled={uploadingLogo}
                      >
                        {uploadingLogo ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                      {configs.site_logo && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveImage('site_logo')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      aria-label="Fazer upload de logo"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('site_logo', file);
                        e.target.value = '';
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Cole uma URL ou clique em <Upload className="inline h-3 w-3" /> para enviar do computador/celular
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site_logo_alt">Texto Alternativo da Logo</Label>
                    <Input
                      id="site_logo_alt"
                      type="text"
                      value={configs.site_logo_alt || ''}
                      onChange={(e) => handleChange('site_logo_alt', e.target.value)}
                      placeholder="Logo da Empresa"
                    />
                    <p className="text-sm text-muted-foreground">
                      Texto alternativo para acessibilidade (se vazio, usa o Nome da Empresa)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site_tagline">Slogan</Label>
                    <Input
                      id="site_tagline"
                      type="text"
                      value={configs.site_tagline || ''}
                      onChange={(e) => handleChange('site_tagline', e.target.value)}
                      placeholder="Seu Slogan"
                    />
                    <p className="text-sm text-muted-foreground">
                      Aparece abaixo do nome no header
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="site_description">Descrição do Site</Label>
                    <Input
                      id="site_description"
                      type="text"
                      value={configs.site_description || ''}
                      onChange={(e) => handleChange('site_description', e.target.value)}
                      placeholder="Soluções completas em locação de veículos"
                    />
                    <p className="text-sm text-muted-foreground">
                      Usada no footer e meta tags
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site_favicon">Favicon</Label>
                    <div className="flex gap-2">
                      <Input
                        id="site_favicon"
                        type="text"
                        value={configs.site_favicon || ''}
                        onChange={(e) => handleChange('site_favicon', e.target.value)}
                        placeholder="/favicon.ico ou URL da imagem"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => document.getElementById('favicon-upload')?.click()}
                        disabled={uploadingFavicon}
                      >
                        {uploadingFavicon ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                      {configs.site_favicon && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveImage('site_favicon')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <input
                      id="favicon-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      aria-label="Fazer upload de favicon"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('site_favicon', file);
                        e.target.value = '';
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Ícone da aba do navegador. Clique em <Upload className="inline h-3 w-3" /> para enviar
                    </p>
                  </div>
                </div>

                {(configs.site_logo || logoPreview) && (
                  <div className="mt-6">
                    <Label>Preview da Logo</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-gray-50 flex items-center justify-center">
                      <img 
                        src={logoPreview || configs.site_logo} 
                        alt={configs.site_logo_alt || 'Logo'} 
                        className="h-20 max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {(configs.site_favicon || faviconPreview) && (
                  <div className="mt-4">
                    <Label>Preview do Favicon</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-gray-50 flex items-center justify-center">
                      <img 
                        src={faviconPreview || configs.site_favicon} 
                        alt="Favicon" 
                        className="h-8 w-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Open Graph Tab */}
          <TabsContent value="og">
            <Card>
              <CardHeader>
                <CardTitle>Preview de Links (Open Graph)</CardTitle>
                <CardDescription>
                  Configure como seu site aparece quando compartilhado em redes sociais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="og_title">Título</Label>
                    <Input
                      id="og_title"
                      type="text"
                      value={configs.og_title || ''}
                      onChange={(e) => handleChange('og_title', e.target.value)}
                      placeholder="Nome da Empresa - Sua Descrição"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og_description">Descrição</Label>
                    <Input
                      id="og_description"
                      type="text"
                      value={configs.og_description || ''}
                      onChange={(e) => handleChange('og_description', e.target.value)}
                      placeholder="Aluguel de veículos com as melhores condições..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og_image">Imagem (1200x630px recomendado)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="og_image"
                        type="text"
                        value={configs.og_image || ''}
                        onChange={(e) => handleChange('og_image', e.target.value)}
                        placeholder="/og-image.jpg ou URL completa"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('og-image-upload')?.click()}
                        disabled={uploadingOgImage}
                      >
                        {uploadingOgImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                          </>
                        )}
                      </Button>
                      {configs.og_image && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveImage('og_image')}
                          disabled={uploadingOgImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <input
                        id="og-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        aria-label="Fazer upload de imagem Open Graph"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload('og_image', file);
                          }
                        }}
                      />
                    </div>
                    {ogImagePreview && (
                      <div className="mt-2 relative w-full max-w-md">
                        <img
                          src={ogImagePreview}
                          alt="Preview da imagem"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Faça upload de uma imagem ou cole a URL. Recomendado: 1200x630px
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-6">
                  <Label>Preview</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden bg-white shadow-sm max-w-md">
                    {configs.og_image && (
                      <img 
                        src={configs.og_image} 
                        alt="Preview" 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm">{configs.og_title || 'Título do Site'}</h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {configs.og_description || 'Descrição do site...'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>Configure os meios de contato exibidos no site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">Contato Locação</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone_rental">Telefone Locação</Label>
                      <Input
                        id="contact_phone_rental"
                        type="text"
                        value={configs.contact_phone_rental || ''}
                        onChange={(e) => handleChange('contact_phone_rental', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                      <p className="text-xs text-muted-foreground">Aparece na navbar e seção de locação</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_whatsapp_rental">WhatsApp Locação (apenas números)</Label>
                      <Input
                        id="contact_whatsapp_rental"
                        type="text"
                        value={configs.contact_whatsapp_rental || ''}
                        onChange={(e) => handleChange('contact_whatsapp_rental', e.target.value)}
                        placeholder="5511999999999"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">Contato Investimento</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone_investment">Telefone Investimento</Label>
                      <Input
                        id="contact_phone_investment"
                        type="text"
                        value={configs.contact_phone_investment || ''}
                        onChange={(e) => handleChange('contact_phone_investment', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                      <p className="text-xs text-muted-foreground">Aparece na seção de investimento</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_whatsapp_investment">WhatsApp Investimento (apenas números)</Label>
                      <Input
                        id="contact_whatsapp_investment"
                        type="text"
                        value={configs.contact_whatsapp_investment || ''}
                        onChange={(e) => handleChange('contact_whatsapp_investment', e.target.value)}
                        placeholder="5511999999999"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">Informações Gerais</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">E-mail</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={configs.contact_email || ''}
                        onChange={(e) => handleChange('contact_email', e.target.value)}
                        placeholder="contato@suaempresa.com.br"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_address">Endereço</Label>
                      <Input
                        id="contact_address"
                        type="text"
                        value={configs.contact_address || ''}
                        onChange={(e) => handleChange('contact_address', e.target.value)}
                        placeholder="São Paulo, SP"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
                <CardDescription>URLs das suas redes sociais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/seu-perfil' },
                  { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/seu-perfil' },
                  { key: 'social_twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/seu-perfil' },
                  { key: 'social_linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/seu-perfil' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      type="url"
                      value={configs[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SiteSettings;
