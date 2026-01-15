import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2 } from 'lucide-react';
import { Vehicle } from '@/types/admin';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onToggleAvailability: (vehicle: Vehicle) => void;
}

/**
 * VehicleCard - Componente memoizado para otimizar renderização
 * Só re-renderiza quando as props mudarem
 */
const VehicleCard = memo(({ vehicle, onEdit, onDelete, onToggleAvailability }: VehicleCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className={`w-full h-48 object-cover ${
            !vehicle.available ? 'grayscale opacity-60' : ''
          }`}
        />
        {!vehicle.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-white font-bold text-lg">INDISPONÍVEL</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2">{vehicle.name}</h3>
        <p className="text-2xl font-bold text-primary mb-4">{vehicle.price}/sem</p>
        
        <div className="flex items-center justify-between mb-4">
          <Label htmlFor={`available-${vehicle.id}`} className="text-sm">
            {vehicle.available ? 'Disponível' : 'Indisponível'}
          </Label>
          <Switch
            id={`available-${vehicle.id}`}
            checked={vehicle.available}
            onCheckedChange={() => onToggleAvailability(vehicle)}
          />
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(vehicle)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => onDelete(vehicle)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

VehicleCard.displayName = 'VehicleCard';

export default VehicleCard;
