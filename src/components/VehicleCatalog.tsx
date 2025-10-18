import { useEffect, useState } from "react";
import VehicleCard from "./VehicleCard";
import { Vehicle } from "@/types/admin";
import { getVehicles } from "@/lib/vehicleManager";

const VehicleCatalog = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    // Load vehicles from localStorage or Supabase
    const loadVehicles = async () => {
      const loadedVehicles = await getVehicles();
      setVehicles(loadedVehicles);
    };
    loadVehicles();
  }, []);

  return (
    <section id="locacao" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Nossos <span className="text-primary">Veículos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o veículo ideal para trabalhar com aplicativos. Todos revisados e prontos para rodar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="animate-fade-in"
            >
              <VehicleCard {...vehicle} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Todos os valores são por semana. Consulte condições especiais para períodos mais longos.
          </p>
        </div>
      </div>
    </section>
  );
};

export default VehicleCatalog;
