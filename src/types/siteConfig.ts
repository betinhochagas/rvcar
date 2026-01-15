// Site Configuration Types

export interface SiteConfig {
  id: number;
  config_key: string;
  config_value: string | object | boolean;
  config_type: 'text' | 'image' | 'color' | 'json' | 'boolean';
  description?: string;
  updated_at: string;
}

export interface ColorPalette {
  color_primary: string;
  color_primary_hover: string;
  color_secondary: string;
  color_accent: string;
  color_background: string;
  color_text: string;
  button_primary_bg: string;
  button_primary_text: string;
  button_primary_hover: string;
  button_secondary_bg: string;
  button_secondary_text: string;
  button_secondary_hover: string;
}

export interface BrandingConfig {
  site_logo: string;
  site_logo_alt: string;
  site_favicon: string;
  site_title: string;
  site_tagline: string;
}

export interface OpenGraphConfig {
  og_title: string;
  og_description: string;
  og_image: string;
}

export interface ContactConfig {
  contact_phone: string;
  contact_email: string;
  contact_whatsapp: string;
  contact_address: string;
}

export interface SocialMediaConfig {
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  social_linkedin: string;
}

// Page Section Types

export type SectionType = 'hero' | 'features' | 'vehicles' | 'about' | 'contact' | 'testimonials' | 'custom';

export interface PageSection {
  id: number;
  section_key: string;
  section_name: string;
  section_type: SectionType;
  content: SectionContent;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SectionContent {
  [key: string]: unknown;
}

export interface HeroContent extends SectionContent {
  title: string;
  subtitle: string;
  background_image: string;
  cta_text: string;
  cta_link: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesContent extends SectionContent {
  title: string;
  subtitle: string;
  items: FeatureItem[];
}

export interface StatItem {
  number: string;
  label: string;
}

export interface AboutContent extends SectionContent {
  title: string;
  content: string;
  image: string;
  stats?: StatItem[];
}

export interface VehiclesContent extends SectionContent {
  title: string;
  subtitle: string;
  show_filters: boolean;
  show_availability: boolean;
}

export interface ContactContent extends SectionContent {
  title: string;
  subtitle: string;
  show_form: boolean;
  show_map: boolean;
  map_embed: string;
}

// Site Image Types

export type ImageCategory = 'logo' | 'hero' | 'section' | 'icon' | 'og' | 'other';

export interface SiteImage {
  id: number;
  image_key: string;
  image_url: string;
  image_alt: string;
  image_category: ImageCategory;
  width?: number;
  height?: number;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

// Form Types for Admin

export interface SiteConfigForm {
  config_key: string;
  config_value: string | object | boolean;
  config_type: 'text' | 'image' | 'color' | 'json' | 'boolean';
  description?: string;
}

export interface PageSectionForm {
  section_key: string;
  section_name: string;
  section_type: SectionType;
  content: SectionContent;
  display_order?: number;
  is_active?: boolean;
}

export interface SectionReorderItem {
  id: number;
  display_order: number;
}
