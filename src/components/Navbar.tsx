import { useState, useCallback, useEffect } from "react";
import { Menu, X, Phone, MapPin, Mail, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { getAbsoluteImageUrl } from "@/lib/imageUrlHelper";
import logoImg from "@/assets/logo.svg";
import ConsultantModal from "@/components/ConsultantModal";

// Função para formatar telefone brasileiro
const formatPhone = (phone: string): string => {
  if (!phone) return '';
  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, '');
  
  // Formato: (XX)XXXXX-XXXX ou (XX)XXXX-XXXX
  if (numbers.length === 11) {
    return `(${numbers.substring(0, 2)})${numbers.substring(2, 7)}-${numbers.substring(7)}`;
  } else if (numbers.length === 10) {
    return `(${numbers.substring(0, 2)})${numbers.substring(2, 6)}-${numbers.substring(6)}`;
  }
  return phone; // Retorna original se não for formato válido
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getConfig } = useSiteConfig();
  
  // Configurações dinâmicas
  const siteName = getConfig('site_name', '');
  const siteTagline = getConfig('site_tagline', '');
  const siteLogoRaw = getConfig('site_logo', '');
  // Se não houver logo configurado, usar logo padrão; senão, normalizar URL
  const siteLogo = !siteLogoRaw ? logoImg : getAbsoluteImageUrl(siteLogoRaw);
  const siteLogoAlt = getConfig('site_logo_alt', '');
  // Usar telefone de locação na navbar
  const contactPhoneRaw = getConfig('contact_phone_rental', '');
  const contactPhone = formatPhone(contactPhoneRaw);
  const contactWhatsapp = getConfig('contact_whatsapp_rental', '');
  const buttonCtaText = getConfig('button_cta_text', 'Fale com um Consultor');
  const contactEmail = getConfig('contact_email', '');
  const contactAddress = getConfig('contact_address', '');
  const socialInstagram = getConfig('social_instagram', '');
  const socialFacebook = getConfig('social_facebook', '');
  const socialTwitter = getConfig('social_twitter', '');
  const socialLinkedin = getConfig('social_linkedin', '');

  const menuItems = [
    { label: "Início", href: "#home", id: "home" },
    { label: "Serviços", href: "#servicos", id: "servicos" },
    { label: "Veículos", href: "#locacao", id: "locacao" },
    { label: "Investimento", href: "#investimento", id: "investimento" },
    { label: "Sobre", href: "#sobre", id: "sobre" },
    { label: "Contato", href: "#contato", id: "contato" },
  ];

  const scrollToSection = useCallback((href: string) => {
    const element = document.querySelector(href) as HTMLElement;
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      });
      setIsOpen(false);
    }
  }, []);

  const handleWhatsApp = useCallback(() => {
    window.open(`https://wa.me/${contactWhatsapp}`, "_blank");
  }, [contactWhatsapp]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Track active section
  useEffect(() => {
    const observerOptions = {
      rootMargin: '-100px 0px -80% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    menuItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Bloquear scroll do body quando drawer estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Transparent-to-solid header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2.5' : 'py-2.5 md:py-3.5'}`}>
          <button 
            onClick={() => scrollToSection("#home")}
            className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300"
            aria-label="Ir para o início"
          >
            <img
              src={siteLogo}
              alt={siteLogoAlt}
              className={`w-auto rounded-lg transition-all duration-300 ${
                isScrolled 
                  ? 'h-11' 
                  : 'h-11 md:h-14 md:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'
              }`}
            />
            <div className="hidden sm:block">
              <span className={`font-bold transition-all duration-300 ${
                isScrolled ? 'text-base text-foreground' : 'text-lg text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
              }`}>{siteLogoAlt || siteName || 'RVCar'}</span>
              {(siteTagline || !isScrolled) && (
                <p className={`text-xs leading-tight transition-all duration-300 ${
                  isScrolled ? 'text-muted-foreground' : 'text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
                }`}>{siteTagline || 'Locações e Investimentos'}</p>
              )}
            </div>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? isScrolled
                      ? "text-primary bg-primary/10"
                      : "text-primary font-semibold"
                    : isScrolled
                      ? "text-foreground hover:text-primary hover:bg-primary/5"
                      : "text-white/90 hover:text-primary hover:bg-white/10"
                }`}
                aria-label={`Ir para ${item.label}`}
              >
                {item.label}
              </button>
            ))}
            <div className="flex items-center space-x-2 ml-4">
              {contactPhone && contactWhatsapp && (
                <Button 
                  onClick={handleWhatsApp} 
                  size="sm" 
                  variant="outline"
                  className="hidden lg:flex items-center space-x-1"
                >
                  <Phone className="h-4 w-4" />
                  <span>{contactPhone}</span>
                </Button>
              )}
              <Button onClick={() => scrollToSection("#contato")} size="sm">
                Fale Conosco
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className={`md:hidden p-2 rounded-md transition-colors ${
              isScrolled ? 'hover:bg-secondary' : 'hover:bg-white/10 text-white'
            }`}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

    </nav>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-[80dvh] w-[85vw] max-w-sm z-[70] md:hidden flex flex-col bg-background shadow-2xl border-l border-b border-border rounded-bl-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40">
          <button
            onClick={() => { scrollToSection('#home'); }}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            aria-label="Ir para o início"
          >
            <img
              src={siteLogo}
              alt={siteLogoAlt || siteName || 'Logo'}
              className="h-10 w-auto rounded-md"
            />
            <div>
              <p className="font-bold text-sm text-foreground leading-tight">{siteLogoAlt || siteName || 'RVCar'}</p>
              {siteTagline && (
                <p className="text-xs text-muted-foreground leading-tight">{siteTagline}</p>
              )}
            </div>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md hover:bg-secondary transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Drawer Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {menuItems.map((item, idx) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.href)}
              className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 flex items-center justify-between group ${
                activeSection === item.id
                  ? 'text-primary bg-primary/10 font-semibold'
                  : 'text-foreground hover:bg-secondary hover:text-primary'
              }`}
              aria-label={`Ir para ${item.label}`}
            >
              <span>{item.label}</span>
              {activeSection === item.id && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>

        {/* Drawer Footer */}
        <div className="border-t border-border px-5 py-5 space-y-4 bg-muted/30">
          {/* CTA Buttons */}
          <div className="space-y-2">
            {contactPhone && contactWhatsapp && (
              <Button
                onClick={handleWhatsApp}
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
              >
                <Phone className="h-4 w-4" />
                <span>{contactPhone}</span>
              </Button>
            )}
            <Button
              onClick={() => { setIsOpen(false); setIsModalOpen(true); }}
              className="w-full"
            >
              {buttonCtaText}
            </Button>
          </div>

          {/* Contato info */}
          {(contactAddress || contactEmail) && (
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {contactAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/70" />
                  <span>{contactAddress}</span>
                </div>
              )}
              {contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-primary transition-colors">{contactEmail}</a>
                </div>
              )}
            </div>
          )}

          {/* Redes sociais */}
          {(socialInstagram || socialFacebook || socialTwitter || socialLinkedin) && (
            <div className="flex items-center gap-3 pt-1">
              {socialInstagram && (
                <a href={socialInstagram} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                  aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {socialFacebook && (
                <a href={socialFacebook} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                  aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {socialTwitter && (
                <a href={socialTwitter} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                  aria-label="Twitter/X">
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {socialLinkedin && (
                <a href={socialLinkedin} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                  aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {/* Copyright */}
          <p className="text-[11px] text-muted-foreground/60 text-center">
            © {new Date().getFullYear()} {siteName || 'RVCar'}. Todos os direitos reservados.
          </p>
        </div>
      </div>

      <ConsultantModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};

export default Navbar;
