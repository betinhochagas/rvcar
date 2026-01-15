import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Loader2 } from "lucide-react";
import logo from "@/assets/logo.svg";
import { useToast } from "@/hooks/use-toast";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

interface InvestmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvestmentModal = ({ open, onOpenChange }: InvestmentModalProps) => {
  const { getConfig } = useSiteConfig();
  const siteName = getConfig('site_name', 'Sistema');
  const whatsappInvestment = getConfig('contact_whatsapp_investment', '5547984485492');
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    brand: "",
    model: "",
    year: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.brand ||
      !formData.model ||
      !formData.year
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    // Validar ano
    const currentYear = new Date().getFullYear();
    const year = parseInt(formData.year);
    if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      toast({
        title: "Ano inválido",
        description: `Por favor, insira um ano entre 1900 e ${currentYear + 1}.`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // Montar mensagem para WhatsApp
    const message = `*Proposta de Investimento - ${siteName}*

*Nome:* ${formData.name}
*Telefone:* ${formData.phone}
*E-mail:* ${formData.email}

*Dados do Veículo:*
- *Marca:* ${formData.brand}
- *Modelo:* ${formData.model}
- *Ano:* ${formData.year}

Tenho interesse em transformar meu veículo em renda passiva através da locação.

Mensagem enviada através do site ${siteName}`;

    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappInvestment}?text=${encodedMessage}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, "_blank");

    // Resetar formulário e fechar modal
    setTimeout(() => {
      setFormData({
        name: "",
        phone: "",
        email: "",
        brand: "",
        model: "",
        year: "",
      });
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
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
          <div className="flex items-center justify-center mb-2">
            <img src={logo} alt={siteName} className="h-12 w-auto" />
          </div>
          <DialogTitle className="text-center text-xl">
            Investimento em Frota
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Transforme seu veículo em uma fonte de renda passiva
          </p>
        </DialogHeader>

        {/* Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="investment-name">Nome Completo *</Label>
              <Input
                id="investment-name"
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
              <Label htmlFor="investment-phone">Telefone *</Label>
              <Input
                id="investment-phone"
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
              <Label htmlFor="investment-email">E-mail *</Label>
              <Input
                id="investment-email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="pt-2 border-t">
              <h4 className="font-semibold text-sm mb-3 text-muted-foreground">
                Informações do Veículo
              </h4>

              {/* Marca */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="investment-brand">Marca *</Label>
                <Input
                  id="investment-brand"
                  type="text"
                  placeholder="Ex: Chevrolet, Fiat, Volkswagen"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  required
                />
              </div>

              {/* Modelo */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="investment-model">Modelo *</Label>
                <Input
                  id="investment-model"
                  type="text"
                  placeholder="Ex: Onix, Mobi, Gol"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  required
                />
              </div>

              {/* Ano */}
              <div className="space-y-2">
                <Label htmlFor="investment-year">Ano *</Label>
                <Input
                  id="investment-year"
                  type="number"
                  placeholder="Ex: 2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Botão de Envio */}
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
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

export default InvestmentModal;
