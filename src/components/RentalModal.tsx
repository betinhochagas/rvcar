import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logger } from "@/lib/logger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Loader2 } from "lucide-react";
import logo from "@/assets/logo.svg";
import { getVehicles } from "@/lib/vehicleManager";
import { Vehicle } from "@/types/admin";
import { useToast } from "@/hooks/use-toast";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

interface RentalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVehicle?: {
    name: string;
    price: string;
  } | null;
}

const RentalModal = ({ open, onOpenChange, selectedVehicle }: RentalModalProps) => {
  const { getConfig } = useSiteConfig();
  const siteName = getConfig('site_name', 'Sistema');
  const whatsappRental = getConfig('contact_whatsapp_rental', '5547984485492');
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicle: "",
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVehicles();
      const availableVehicles = data.filter((v) => v.available);
      setVehicles(availableVehicles);

      if (availableVehicles.length === 0) {
        toast({
          title: "Aviso",
          description: "No momento não há veículos disponíveis.",
          variant: "default",
        });
      }
    } catch (error) {
      logger.error("Erro ao carregar veículos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os veículos disponíveis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Carregar veículos disponíveis quando não há veículo pré-selecionado
  useEffect(() => {
    if (open && !selectedVehicle) {
      loadVehicles();
    }
  }, [open, selectedVehicle, loadVehicles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!formData.name || !formData.phone || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    // Se não há veículo pré-selecionado, verificar se foi escolhido um
    if (!selectedVehicle && !formData.vehicle) {
      toast({
        title: "Veículo não selecionado",
        description: "Por favor, selecione um veículo.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // Determinar dados do veículo
    let vehicleName = "";
    let vehiclePrice = "";

    if (selectedVehicle) {
      vehicleName = selectedVehicle.name;
      vehiclePrice = selectedVehicle.price;
    } else {
      const selectedVehicleData = vehicles.find((v) => v.id === formData.vehicle);
      vehicleName = selectedVehicleData?.name || formData.vehicle;
      vehiclePrice = selectedVehicleData?.price || "";
    }

    // Montar mensagem para WhatsApp
    const message = `*Solicitação de Aluguel - ${siteName}*

*Nome:* ${formData.name}
*Telefone:* ${formData.phone}
*E-mail:* ${formData.email}
*Veículo Desejado:* ${vehicleName}${vehiclePrice ? `\n*Valor:* R$${vehiclePrice}/semana` : ''}

Mensagem enviada através do site ${siteName}`;

    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappRental}?text=${encodedMessage}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, "_blank");

    // Resetar formulário e fechar modal
    setTimeout(() => {
      setFormData({ name: "", phone: "", email: "", vehicle: "" });
      setSubmitting(false);
      onOpenChange(false);
      
      toast({
        title: "Sucesso!",
        description: "Você será redirecionado para o WhatsApp.",
      });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        {/* Cabeçalho Fixo */}
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-center mb-2">
            <img src={logo} alt={siteName} className="h-12 w-auto" />
          </div>
          <DialogTitle className="text-center text-xl">
            Aluguel de Veículos
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Preencha seus dados e escolha o veículo ideal para você
          </p>
        </DialogHeader>

        {/* Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="rental-name">Nome Completo *</Label>
              <Input
                id="rental-name"
                type="text"
                placeholder="Digite seu nome completo"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="rental-phone">Telefone *</Label>
              <Input
                id="rental-phone"
                type="tel"
                placeholder="(47) 98448-5492"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="rental-email">E-mail *</Label>
              <Input
                id="rental-email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            {/* Veículo Selecionado (quando vem do card) */}
            {selectedVehicle && (
              <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <Label className="text-sm font-semibold">Veículo Selecionado</Label>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedVehicle.name}</span>
                  <span className="text-primary font-bold">R${selectedVehicle.price}/semana</span>
                </div>
              </div>
            )}

            {/* Seletor de Veículo (quando não há pré-seleção) */}
            {!selectedVehicle && (
              <div className="space-y-2">
                <Label htmlFor="rental-vehicle">Veículo Desejado *</Label>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Carregando veículos...
                    </span>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Nenhum veículo disponível no momento.
                    <br />
                    Entre em contato para mais informações.
                  </div>
                ) : (
                  <Select
                    value={formData.vehicle}
                    onValueChange={(value) =>
                      setFormData({ ...formData, vehicle: value })
                    }
                    required
                  >
                    <SelectTrigger id="rental-vehicle">
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} - R${vehicle.price}/semana
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Botão de Envio */}
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || (!selectedVehicle && loading)}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Falar com um Consultor
                </>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RentalModal;
