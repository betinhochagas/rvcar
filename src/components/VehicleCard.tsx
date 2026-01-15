import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface VehicleCardProps {
  name: string;
  price: string;
  image: string;
  features: string[];
  available?: boolean;
  onRequestQuote?: (vehicleName: string, vehiclePrice: string) => void;
}

const VehicleCard = ({ name, price, image, features, available = true, onRequestQuote }: VehicleCardProps) => {
  const handleRequestQuote = () => {
    if (onRequestQuote) {
      onRequestQuote(name, price);
    }
  };

  return (
    <Card className="overflow-hidden border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        <img
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          width={400}
          height={300}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
            !available ? "grayscale opacity-60" : ""
          }`}
        />
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-white font-bold text-lg px-4 py-2 bg-red-600 rounded">
              INDISPONÍVEL
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-primary">R${price}</span>
          <span className="text-muted-foreground">/semana</span>
        </div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button onClick={handleRequestQuote} className="w-full" disabled={!available}>
          Solicitar Orçamento
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
