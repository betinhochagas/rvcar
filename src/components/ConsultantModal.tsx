import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Car, TrendingUp } from "lucide-react";
import { getAbsoluteImageUrl } from "@/lib/imageUrlHelper";
import logo from "@/assets/logo.svg";
import RentalModal from "./RentalModal";
import InvestmentModal from "./InvestmentModal";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

interface ConsultantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ServiceType = "rental" | "investment" | null;

const ConsultantModal = ({ open, onOpenChange }: ConsultantModalProps) => {
  const { getConfig } = useSiteConfig();
  const siteName = getConfig('site_name', '');
  const siteLogoRaw = getConfig('site_logo', '');
  // Se não houver logo configurado, usar logo padrão; senão, normalizar URL
  const siteLogo = !siteLogoRaw ? logo : getAbsoluteImageUrl(siteLogoRaw);
  const [selectedService, setSelectedService] = useState<ServiceType>(null);

  // Reset ao fechar o modal principal
  useEffect(() => {
    if (!open) {
      setSelectedService(null);
    }
  }, [open]);

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service);
  };

  const handleBack = () => {
    setSelectedService(null);
  };

  return (
    <>
      {/* Modal Principal - Seleção de Serviço */}
      <Dialog open={open && !selectedService} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-center">
              <img src={siteLogo} alt={siteName} className="h-16 w-auto" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Como podemos ajudar?
            </DialogTitle>
            <p className="text-center text-muted-foreground">
              Escolha o serviço que deseja contratar
            </p>
          </DialogHeader>

          <div className="space-y-3 pt-4">
            {/* Opção Alugar */}
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-start gap-2 hover:bg-primary/5 hover:border-primary hover:text-foreground transition-all"
              onClick={() => handleServiceSelect("rental")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-lg text-foreground">Alugar um Veículo</div>
                  <div className="text-sm text-muted-foreground">
                    Veículos prontos para trabalhar em apps
                  </div>
                </div>
              </div>
            </Button>

            {/* Opção Investir */}
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-start gap-2 hover:bg-primary/5 hover:border-primary hover:text-foreground transition-all"
              onClick={() => handleServiceSelect("investment")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-lg text-foreground">Investir em Frota</div>
                  <div className="text-sm text-muted-foreground">
                    Transforme seu carro em renda passiva
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Aluguel */}
      <RentalModal
        open={selectedService === "rental"}
        onOpenChange={(open) => !open && handleBack()}
      />

      {/* Modal de Investimento */}
      <InvestmentModal
        open={selectedService === "investment"}
        onOpenChange={(open) => !open && handleBack()}
      />
    </>
  );
};

export default ConsultantModal;
