export interface CarModelConfig {
  id: string;
  name: string;
  path: string;
  type: 'sedan' | 'sport' | 'suv';
  description: string;
}

export const CAR_MODELS: CarModelConfig[] = [
  {
    id: 'standard',
    name: 'Genesis Sedan',
    path: '/models/FordRaptor.glb',
    type: 'sedan',
    description: 'The classic luxury sedan execution.'
  },
  {
    id: 'sport',
    name: 'Genesis Sport GT',
    path: '/models/McLaren600LT.glb',
    type: 'sport',
    description: 'Performance tuned version with aerodynamic kit.'
  },
  {
    id: 'sport',
    name: 'Genesis Sport GT',
    path: '/models/Porsche911.glb',
    type: 'sport',
    description: 'Performance tuned version with aerodynamic kit.'
  }
];
