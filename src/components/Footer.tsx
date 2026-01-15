import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { getAbsoluteImageUrl } from "@/lib/imageUrlHelper";
import logoImg from "@/assets/logo.svg";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { getConfig } = useSiteConfig();
  
  // Função para formatar telefone no formato brasileiro
  const formatPhone = (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)})${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)})${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };
  
  // Configurações dinâmicas
  const siteName = getConfig('site_name', '');
  const siteTagline = getConfig('site_tagline', '');
  const siteLogoRaw = getConfig('site_logo', '');
  // Se não houver logo configurado, usar logo padrão; senão, normalizar URL
  const siteLogo = !siteLogoRaw ? logoImg : getAbsoluteImageUrl(siteLogoRaw);
  const siteLogoAlt = getConfig('site_logo_alt', '');
  const siteDescription = getConfig('site_description', '');
  // Contatos de locação e investimento
  const contactPhoneRental = getConfig('contact_phone_rental', '');
  const contactWhatsappRental = getConfig('contact_whatsapp_rental', '');
  const contactPhoneInvestment = getConfig('contact_phone_investment', '');
  const contactWhatsappInvestment = getConfig('contact_whatsapp_investment', '');
  const contactEmail = getConfig('contact_email', '');
  const contactAddress = getConfig('contact_address', '');
  
  // Redes sociais
  const socialFacebook = getConfig('social_facebook', '');
  const socialInstagram = getConfig('social_instagram', '');
  const socialTwitter = getConfig('social_twitter', '');
  const socialLinkedin = getConfig('social_linkedin', '');

  return (
    <footer className="bg-dark text-dark-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={siteLogo}
                alt={siteLogoAlt}
                className="h-12 w-auto"
              />
              <div className="flex flex-col">
                {siteLogoAlt && (
                  <span className="font-bold text-lg">{siteLogoAlt}</span>
                )}
                {siteTagline && (
                  <span className="text-sm text-dark-foreground/70">{siteTagline}</span>
                )}
              </div>
            </div>
            {siteDescription && (
              <p className="text-dark-foreground/70 leading-relaxed mb-4">
                {siteDescription}
              </p>
            )}
            
            {/* Redes Sociais */}
            {(socialFacebook || socialInstagram || socialTwitter || socialLinkedin) && (
              <div className="flex gap-3 mt-4">
                {socialFacebook && (
                  <a
                    href={socialFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {socialInstagram && (
                  <a
                    href={socialInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {socialTwitter && (
                  <a
                    href={socialTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                    aria-label="Twitter/X"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {socialLinkedin && (
                  <a
                    href={socialLinkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-dark-foreground/70 hover:text-primary transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="#locacao" className="text-dark-foreground/70 hover:text-primary transition-colors">
                  Locação de Veículos
                </a>
              </li>
              <li>
                <a href="#investimento" className="text-dark-foreground/70 hover:text-primary transition-colors">
                  Investimento em Frota
                </a>
              </li>
              <li>
                <a href="#sobre" className="text-dark-foreground/70 hover:text-primary transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#contato" className="text-dark-foreground/70 hover:text-primary transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">Contato</h3>
            <ul className="space-y-3">
              {contactAddress && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-foreground/70">{contactAddress}</span>
                </li>
              )}
              {contactPhoneRental && contactWhatsappRental && (
                <li className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs text-primary font-semibold mb-1">Locação</span>
                    <a
                      href={`https://wa.me/${contactWhatsappRental}`}
                      className="text-dark-foreground/70 hover:text-primary transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formatPhone(contactPhoneRental)}
                    </a>
                  </div>
                </li>
              )}
              {contactPhoneInvestment && contactWhatsappInvestment && (
                <li className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs text-primary font-semibold mb-1">Investimento</span>
                    <a
                      href={`https://wa.me/${contactWhatsappInvestment}`}
                      className="text-dark-foreground/70 hover:text-primary transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formatPhone(contactPhoneInvestment)}
                    </a>
                  </div>
                </li>
              )}
              {contactEmail && (
                <li className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-dark-foreground/70 hover:text-primary transition-colors"
                  >
                    {contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-foreground/10 pt-8 text-center">
          <p className="text-dark-foreground/60">
            © {currentYear} {siteName}{siteTagline && ` - ${siteTagline}`}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
