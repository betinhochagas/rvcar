import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { getVehicles } from "@/lib/vehicleManager";
import { logger } from "@/lib/logger";
import heroBg from "@/assets/hero-bg.jpg";
import heroBgMobile from "@/assets/hero-bg-mobile.jpg";
import ConsultantModal from "./ConsultantModal";

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lowestPrice, setLowestPrice] = useState<number>(650);
  const { getConfig } = useSiteConfig();
  
  // Configurações dinâmicas
  const siteName = getConfig('site_name', '');
  const buttonCtaText = getConfig('button_cta_text', '');

  // Buscar menor preço dos veículos
  useEffect(() => {
    const fetchLowestPrice = async () => {
      try {
        const vehicles = await getVehicles();
        if (vehicles.length > 0) {
          const prices = vehicles
            .filter(v => v.available) // Apenas veículos disponíveis
            .map(v => parseFloat(v.price || '0'));
          
          if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            if (minPrice > 0) {
              setLowestPrice(minPrice);
            }
          }
        }
      } catch (error) {
        logger.error('Erro ao buscar veículos:', error);
        // Mantém valor padrão de 650 em caso de erro
      }
    };
    
    fetchLowestPrice();
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 768px)" srcSet={heroBgMobile} />
          <source media="(min-width: 769px)" srcSet={heroBg} />
          <img
            src={heroBg}
            alt={`${siteName} - Locação de Veículos`}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={1920}
            height={1080}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/70 to-dark/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl animate-fade-in">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30">
            <span className="text-primary font-semibold">Locação e Investimento</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Aluguel de Carros para{" "}
            <span className="text-primary">Motoristas de App</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
            Veículos prontos para trabalhar, com manutenção em dia e planos semanais acessíveis. 
            <span className="text-primary font-semibold"> A partir de R${lowestPrice}/semana.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {buttonCtaText && (
              <Button
                size="lg"
                onClick={() => setIsModalOpen(true)}
                className="text-base sm:text-lg group"
              >
                {buttonCtaText}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.querySelector("#locacao")?.scrollIntoView({ behavior: "smooth" })}
              className="text-base sm:text-lg bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-dark"
            >
              Ver Veículos
            </Button>
          </div>

          {/* Modal de Consultor */}
          <ConsultantModal open={isModalOpen} onOpenChange={setIsModalOpen} />

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-xl">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">8+</div>
              <div className="text-sm text-white/80">Modelos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">100%</div>
              <div className="text-sm text-white/80">Revisados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-white/80">Suporte</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
