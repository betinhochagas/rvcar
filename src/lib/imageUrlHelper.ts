/**
 * Helper para converter URLs de imagens para URLs absolutas
 */

/**
 * Converte uma URL de imagem relativa para absoluta
 * Em desenvolvimento, usa o servidor backend (porta 3000)
 * Em produção, usa URL relativa do mesmo domínio
 */
export function getAbsoluteImageUrl(relativePath: string): string {
  // Se for vazio ou undefined, retornar vazio
  if (!relativePath) {
    return '';
  }

  // Se já for uma URL completa, retornar como está
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  // Se for um asset local (começando com @ ou src/), retornar como está
  if (relativePath.startsWith('@/') || relativePath.startsWith('src/')) {
    return relativePath;
  }

  // Se não começar com /, adicionar
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  // Em produção, usar URL relativa
  if (import.meta.env.PROD) {
    return path;
  }

  // Em desenvolvimento, detectar o tipo de acesso
  const hostname = window.location.hostname;

  // Se acessar via localhost, usar localhost para imagens
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:3000${path}`;
  }

  // Se acessar via IP da rede local, usar o mesmo IP
  if (hostname.match(/^(192\.168\.|10\.)/)) {
    return `http://${hostname}:3000${path}`;
  }

  // Fallback: localhost
  return `http://localhost:3000${path}`;
}

/**
 * Hook para converter URLs de veículos
 */
export function normalizeVehicleImages<T extends { image: string }>(vehicles: T[]): T[] {
  return vehicles.map(vehicle => ({
    ...vehicle,
    image: getAbsoluteImageUrl(vehicle.image)
  }));
}
