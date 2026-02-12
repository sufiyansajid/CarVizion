export interface CarModelConfig {
  id: string;
  name: string;
  path: string;
  type: 'sedan' | 'sport' | 'suv';
  description: string;
  thumbnail?: string;
  rimScale?: number;      // Manual override for rim size
  spoilerOffset?: [number, number, number]; // Manual position for spoiler
  manualRimPositions?: Array<{ position: [number, number, number]; rotation: [number, number, number]; scale?: number }>;
}

export const CAR_MODELS: CarModelConfig[] = [
  {
    id: 'standard',
    name: 'Ford Raptor',
    path: '/models/FordRaptor.glb',
    type: 'suv',
    description: 'Powerful off-road performance truck.',
    thumbnail: '/images/cars/sedan-thumb.png',
    rimScale: 1.15, // Precisely sized for the Raptor wheel wells
    manualRimPositions: [
      { position: [-1.08, 0.44, 1.85], rotation: [0, 0, Math.PI / 2] }, // Front Left
      { position: [1.08, 0.44, 1.85], rotation: [0, 0, Math.PI / 2] },  // Front Right
      { position: [-1.08, 0.46, -1.75], rotation: [0, 0, Math.PI / 2] }, // Rear Left
      { position: [1.08, 0.46, -1.75], rotation: [0, 0, Math.PI / 2] }   // Rear Right
    ]
  },
  {
    id: 'sport',
    name: 'Genesis Sport GT',
    path: '/models/McLaren600LT.glb',
    type: 'sport',
    description: 'Performance tuned version with aerodynamic kit.',
    thumbnail: '/images/cars/sport-thumb.png',
    rimScale: 1.05,
    spoilerOffset: [0, 0.47, -1.82],
    manualRimPositions: [
      { position: [-0.96, 0.32, 1.38], rotation: [0, 0, Math.PI / 2] }, // Front Left - Narrowed and lowered slightly
      { position: [0.96, 0.32, 1.38], rotation: [0, 0, Math.PI / 2] },  // Front Right
      { position: [-0.96, 0.35, -1.35], rotation: [0, 0, Math.PI / 2] }, // Rear Left
      { position: [0.96, 0.35, -1.35], rotation: [0, 0, Math.PI / 2] }   // Rear Right
    ]
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
