// Tipos de Veículo
export interface Vehicle {
  id: number;
  name: string;
  price: number;
  image: string;
  features: string[];
  available: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVehicleRequest {
  name: string;
  price: number;
  image?: string;
  features?: string[];
  available?: boolean;
  featured?: boolean;
}

export interface UpdateVehicleRequest {
  name?: string;
  price?: number;
  image?: string;
  features?: string[];
  available?: boolean;
  featured?: boolean;
}
