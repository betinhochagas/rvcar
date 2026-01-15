-- RV Car Solutions - Site Configuration Schema
-- Script para criar tabelas de configuração do site

USE rvcar_db;

-- Tabela de configurações gerais do site
DROP TABLE IF EXISTS site_config;

CREATE TABLE site_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type ENUM('text', 'image', 'color', 'json', 'boolean') DEFAULT 'text',
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir configurações padrão
INSERT INTO site_config (config_key, config_value, config_type, description) VALUES
-- Logo e branding
('site_logo', '/logo.svg', 'image', 'Logo principal do site'),
('site_logo_alt', 'RV Car Solutions', 'text', 'Texto alternativo da logo'),
('site_favicon', '/favicon.ico', 'image', 'Favicon do site'),

-- Metadados para preview de links (Open Graph)
('og_title', 'RV Car Solutions - Aluguel de Veículos', 'text', 'Título para preview de link'),
('og_description', 'Aluguel de veículos com as melhores condições do mercado. Frota moderna e atendimento personalizado.', 'text', 'Descrição para preview de link'),
('og_image', '/og-image.jpg', 'image', 'Imagem para preview de link (1200x630px)'),

-- Paleta de cores principal
('color_primary', '#1a56db', 'color', 'Cor primária do site'),
('color_primary_hover', '#1e429f', 'color', 'Cor primária ao passar o mouse'),
('color_secondary', '#7c3aed', 'color', 'Cor secundária'),
('color_accent', '#db2777', 'color', 'Cor de destaque'),
('color_background', '#ffffff', 'color', 'Cor de fundo'),
('color_text', '#1f2937', 'color', 'Cor do texto principal'),

-- Cores dos botões
('button_primary_bg', '#1a56db', 'color', 'Cor de fundo do botão primário'),
('button_primary_text', '#ffffff', 'color', 'Cor do texto do botão primário'),
('button_primary_hover', '#1e429f', 'color', 'Cor de fundo do botão primário ao passar o mouse'),
('button_secondary_bg', '#6b7280', 'color', 'Cor de fundo do botão secundário'),
('button_secondary_text', '#ffffff', 'color', 'Cor do texto do botão secundário'),
('button_secondary_hover', '#4b5563', 'color', 'Cor de fundo do botão secundário ao passar o mouse'),

-- Informações de contato
('contact_phone', '(11) 99999-9999', 'text', 'Telefone de contato'),
('contact_email', 'contato@rvcarsolutions.com.br', 'text', 'E-mail de contato'),
('contact_whatsapp', '5511999999999', 'text', 'WhatsApp (apenas números)'),
('contact_address', 'São Paulo, SP', 'text', 'Endereço da empresa'),

-- Redes sociais
('social_facebook', '', 'text', 'URL do Facebook'),
('social_instagram', '', 'text', 'URL do Instagram'),
('social_twitter', '', 'text', 'URL do Twitter/X'),
('social_linkedin', '', 'text', 'URL do LinkedIn'),

-- Configurações gerais
('site_title', 'RV Car Solutions', 'text', 'Título do site'),
('site_tagline', 'Aluguel de Veículos com Qualidade', 'text', 'Slogan do site'),
('maintenance_mode', '0', 'boolean', 'Modo de manutenção'),
('analytics_id', '', 'text', 'ID do Google Analytics');


-- Tabela de seções da página
DROP TABLE IF EXISTS page_sections;

CREATE TABLE page_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_key VARCHAR(100) UNIQUE NOT NULL,
    section_name VARCHAR(255) NOT NULL,
    section_type ENUM('hero', 'features', 'vehicles', 'about', 'contact', 'testimonials', 'custom') DEFAULT 'custom',
    content JSON,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_section_key (section_key),
    INDEX idx_display_order (display_order),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir seções padrão
INSERT INTO page_sections (section_key, section_name, section_type, content, display_order, is_active) VALUES
('hero', 'Seção Hero (Principal)', 'hero', JSON_OBJECT(
    'title', 'Alugue o Carro Perfeito para sua Viagem',
    'subtitle', 'Frota completa com os melhores preços do mercado',
    'background_image', '/hero-bg.jpg',
    'cta_text', 'Ver Veículos Disponíveis',
    'cta_link', '#vehicles'
), 1, TRUE),

('features', 'Recursos e Diferenciais', 'features', JSON_OBJECT(
    'title', 'Por que Escolher a RV Car?',
    'subtitle', 'Oferecemos as melhores condições do mercado',
    'items', JSON_ARRAY(
        JSON_OBJECT('icon', 'shield', 'title', 'Seguro Completo', 'description', 'Todos os nossos veículos possuem seguro total'),
        JSON_OBJECT('icon', 'clock', 'title', 'Atendimento 24/7', 'description', 'Suporte disponível a qualquer hora'),
        JSON_OBJECT('icon', 'dollar', 'title', 'Melhor Preço', 'description', 'Preços competitivos e sem taxas ocultas'),
        JSON_OBJECT('icon', 'car', 'title', 'Frota Moderna', 'description', 'Veículos novos e bem mantidos')
    )
), 2, TRUE),

('vehicles', 'Lista de Veículos', 'vehicles', JSON_OBJECT(
    'title', 'Nossa Frota',
    'subtitle', 'Escolha o veículo ideal para você',
    'show_filters', TRUE,
    'show_availability', TRUE
), 3, TRUE),

('about', 'Sobre Nós', 'about', JSON_OBJECT(
    'title', 'Sobre a RV Car Solutions',
    'content', 'Somos uma empresa especializada em aluguel de veículos, oferecendo as melhores soluções para nossos clientes há mais de 10 anos.',
    'image', '/about.jpg',
    'stats', JSON_ARRAY(
        JSON_OBJECT('number', '10+', 'label', 'Anos de Experiência'),
        JSON_OBJECT('number', '5000+', 'label', 'Clientes Satisfeitos'),
        JSON_OBJECT('number', '50+', 'label', 'Veículos na Frota')
    )
), 4, TRUE),

('contact', 'Contato', 'contact', JSON_OBJECT(
    'title', 'Entre em Contato',
    'subtitle', 'Estamos prontos para atender você',
    'show_form', TRUE,
    'show_map', TRUE,
    'map_embed', ''
), 5, TRUE);


-- Tabela de imagens do site
DROP TABLE IF EXISTS site_images;

CREATE TABLE site_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_key VARCHAR(100) UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    image_alt VARCHAR(255),
    image_category ENUM('logo', 'hero', 'section', 'icon', 'og', 'other') DEFAULT 'other',
    width INT,
    height INT,
    file_size INT COMMENT 'Tamanho em bytes',
    mime_type VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_image_key (image_key),
    INDEX idx_category (image_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Tabela de histórico de alterações (auditoria)
DROP TABLE IF EXISTS config_history;

CREATE TABLE config_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    entity_type ENUM('config', 'section', 'image') NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    action ENUM('create', 'update', 'delete') NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Verificar dados inseridos
SELECT 'Configurações do Site' as tabela, COUNT(*) as total FROM site_config
UNION ALL
SELECT 'Seções da Página' as tabela, COUNT(*) as total FROM page_sections
UNION ALL
SELECT 'Imagens do Site' as tabela, COUNT(*) as total FROM site_images
UNION ALL
SELECT 'Histórico de Alterações' as tabela, COUNT(*) as total FROM config_history;

-- Visualizar configurações padrão
SELECT * FROM site_config ORDER BY config_key;
SELECT * FROM page_sections ORDER BY display_order;
