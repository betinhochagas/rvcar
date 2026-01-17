import { useEffect, useState } from "react";
import VehicleCard from "./VehicleCard";
import RentalModal from "./RentalModal";
import { Vehicle } from "@/types/admin";
import { getVehicles } from "@/lib/vehicleManager";
import { normalizeVehicleImages } from "@/lib/imageUrlHelper";

const VehicleCatalog = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<{ name: string; price: string } | null>(null);

  useEffect(() => {
    // Carregar veículos da API (servidor)
    const loadVehicles = async () => {
      const loadedVehicles = await getVehicles();
      // Normalizar URLs das imagens para funcionarem via rede local
      const normalizedVehicles = normalizeVehicleImages(loadedVehicles);
      // Ordenar por preço em ordem decrescente (mais barato primeiro)
      const sortedVehicles = normalizedVehicles.sort((a, b) => {
        const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
        const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
        return priceA - priceB;
      });
      setVehicles(sortedVehicles);
    };
    loadVehicles();
  }, []);

  const handleRequestQuote = (vehicleName: string, vehiclePrice: string) => {
    setSelectedVehicle({ name: vehicleName, price: vehiclePrice });
    setModalOpen(true);
  };

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
              <VehicleCard {...vehicle} onRequestQuote={handleRequestQuote} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Todos os valores são por semana.
          </p>
        </div>
      </div>

      {/* Modal de Aluguel */}
      <RentalModal 
        open={modalOpen} 
        onOpenChange={setModalOpen}
        selectedVehicle={selectedVehicle}
      />
    </section>
  );
};

export default VehicleCatalog;
