import { Car, TrendingUp, Shield, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Services = () => {
  const services = [
    {
      icon: Car,
      title: "Aluguel para Motoristas",
      description: "Veículos prontos para trabalhar em apps como Uber e 99, com documentação completa e seguro.",
    },
    {
      icon: TrendingUp,
      title: "Investimento em Frota",
      description: "Invista em veículos e receba renda passiva mensal. Nós cuidamos de tudo para você.",
    },
    {
      icon: Shield,
      title: "Segurança Garantida",
      description: "Todos os veículos com seguro e rastreamento, garantindo sua tranquilidade.",
    },
    {
      icon: Clock,
      title: "Suporte 24/7",
      description: "Equipe disponível para emergências e suporte técnico a qualquer momento.",
    },
  ];

  return (
    <section id="servicos" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Nossos <span className="text-primary">Serviços</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Soluções completas para motoristas de aplicativo e investidores que buscam renda passiva
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
