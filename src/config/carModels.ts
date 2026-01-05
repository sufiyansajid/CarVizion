export interface CarModelConfig {
  id: string;
  name: string;
  path: string;
  type: 'sedan' | 'sport' | 'suv';
  description: string;
  thumbnail?: string; // Optional thumbnail image
}

export const CAR_MODELS: CarModelConfig[] = [
  {
    id: 'standard',
    name: 'Genesis Sedan',
    path: '/models/FordRaptor.glb',
    type: 'sedan',
    description: 'The classic luxury sedan execution.',
    thumbnail: '/images/cars/sedan-thumb.png'
  },
  {
    id: 'sport',
    name: 'Genesis Sport GT',
    path: '/models/McLaren600LT.glb',
    type: 'sport',
    description: 'Performance tuned version with aerodynamic kit.',
    thumbnail: '/images/cars/sport-thumb.png'
  },
  {
    id: 'porsche',
    name: 'Porsche 911',
    path: '/models/Porsche911.glb',
    type: 'sport',
    description: 'Iconic sports car with precision handling.',
    thumbnail: '/images/cars/porsche-thumb.png'
  }
];

// Get car type badge color
export const getCarTypeBadge = (type: CarModelConfig['type']) => {
  switch (type) {
    case 'sport':
      return { label: 'Sport', className: 'bg-red-500/20 text-red-500' };
    case 'suv':
      return { label: 'SUV', className: 'bg-green-500/20 text-green-500' };
    default:
      return { label: 'Sedan', className: 'bg-blue-500/20 text-blue-500' };
  }
};
