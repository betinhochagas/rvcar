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

// Admin credentials interface
export interface AdminCredentials {
  username: string;
  password: string;
}

// AVISO: Credenciais padrão apenas para desenvolvimento
// Em produção, use autenticação via API/banco de dados
// As credenciais reais são gerenciadas pelo servidor em /api/auth
export const DEFAULT_ADMIN: AdminCredentials = {
  username: 'admin',
  password: '' // Senha gerenciada pelo servidor - NÃO armazenar aqui
};