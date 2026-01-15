import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Shield, FileText, HeartHandshake } from "lucide-react";
import investmentImg from "@/assets/investment.jpg";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

const Investment = () => {
  const { getConfig } = useSiteConfig();
  const whatsappInvestment = getConfig('contact_whatsapp_investment', '5547984485492');
  
  const benefits = [
    {
      icon: TrendingUp,
      title: "Renda Passiva Mensal",
      description: "Receba rendimentos mensais com a locação dos seus veículos",
    },
    {
      icon: Shield,
      title: "Gestão Completa",
      description: "Cuidamos de toda manutenção, locação e documentação",
    },
    {
      icon: FileText,
      title: "Transparência Total",
      description: "Relatórios detalhados e contratos transparentes",
    },
    {
      icon: HeartHandshake,
      title: "Parceria Confiável",
      description: "Experiência comprovada no mercado de locação",
    },
  ];

  const handleWhatsApp = () => {
    const message = "Olá! Gostaria de saber mais sobre investimento em frota de locação.";
    window.open(`https://wa.me/${whatsappInvestment}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="investimento" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 animate-slide-in-right">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-primary font-semibold">Para Investidores</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Invista em <span className="text-primary">Frota de Locação</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Transforme seu capital em uma fonte de renda passiva através da locação de veículos. 
              Nossa gestão especializada garante o melhor retorno do seu investimento com total transparência e segurança.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={handleWhatsApp} size="lg">
              Quero Investir
            </Button>
          </div>

          <div className="order-1 lg:order-2 animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={investmentImg}
                alt="Investimento em Frota"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width={800}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Investment;
