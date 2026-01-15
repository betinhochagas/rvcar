// Vehicle type definition
export interface Vehicle {
  id: string;
  name: string;
  price: string;
  image: string;
  features: string[];
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

// Admin credentials (in production, use proper authentication)
export interface AdminCredentials {
  username: string;
  password: string;
}

export const DEFAULT_ADMIN: AdminCredentials = {
  username: 'admin',
  password: 'admin123' // Change this in production!
};