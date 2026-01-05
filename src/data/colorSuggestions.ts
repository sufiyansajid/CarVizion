// Curated color schemes database organized by car type
export interface ColorScheme {
  name: string;
  body: string;
  rims: string;
  accents: string;
  reason: string;
  style: 'aggressive' | 'elegant' | 'rugged' | 'classic';
}

export const colorSchemes: Record<string, ColorScheme[]> = {
  sports: [
    {
      name: "Racing Spirit",
      body: "#E60012",
      rims: "#1A1A1A",
      accents: "#FFFFFF",
      reason: "Classic racing livery",
      style: "aggressive"
    },
    {
      name: "Electric Blue",
      body: "#0080FF",
      rims: "#FFD700",
      accents: "#000000",
      reason: "High-performance aesthetic",
      style: "aggressive"
    },
    {
      name: "Neon Dream",
      body: "#39FF14",
      rims: "#000000",
      accents: "#FF00FF",
      reason: "Bold and futuristic",
      style: "aggressive"
    },
    {
      name: "Sunset Orange",
      body: "#FF6600",
      rims: "#2C2C2C",
      accents: "#FFFFFF",
      reason: "Eye-catching performance",
      style: "aggressive"
    }
  ],
  luxury: [
    {
      name: "Midnight Elegance",
      body: "#0F1419",
      rims: "#C9B037",
      accents: "#FFFFFF",
      reason: "Sophisticated and timeless",
      style: "elegant"
    },
    {
      name: "Champagne Gold",
      body: "#F7E7CE",
      rims: "#8B7355",
      accents: "#2C2416",
      reason: "Executive presence",
      style: "elegant"
    },
    {
      name: "Pearl White",
      body: "#F8F8FF",
      rims: "#4A4A4A",
      accents: "#C0C0C0",
      reason: "Pure luxury",
      style: "elegant"
    },
    {
      name: "Deep Navy",
      body: "#001F3F",
      rims: "#B87333",
      accents: "#FFFFFF",
      reason: "Classic sophistication",
      style: "elegant"
    }
  ],
  suv: [
    {
      name: "Desert Storm",
      body: "#C19A6B",
      rims: "#3E3E3E",
      accents: "#8B4513",
      reason: "Adventure-ready",
      style: "rugged"
    },
    {
      name: "Forest Green",
      body: "#228B22",
      rims: "#1C1C1C",
      accents: "#D2B48C",
      reason: "Outdoor explorer",
      style: "rugged"
    },
    {
      name: "Graphite Steel",
      body: "#36454F",
      rims: "#2F4F4F",
      accents: "#708090",
      reason: "Urban warrior",
      style: "rugged"
    },
    {
      name: "Arctic White",
      body: "#F0F8FF",
      rims: "#2C3E50",
      accents: "#5DADE2",
      reason: "Clean and capable",
      style: "rugged"
    }
  ],
  classic: [
    {
      name: "British Racing Green",
      body: "#004225",
      rims: "#C0C0C0",
      accents: "#FFFACD",
      reason: "Heritage and tradition",
      style: "classic"
    },
    {
      name: "Cherry Red",
      body: "#DE3163",
      rims: "#FFFFFF",
      accents: "#C0C0C0",
      reason: "Vintage charm",
      style: "classic"
    },
    {
      name: "Cream Dream",
      body: "#FFFDD0",
      rims: "#8B4513",
      accents: "#D2691E",
      reason: "Timeless elegance",
      style: "classic"
    },
    {
      name: "Royal Blue",
      body: "#4169E1",
      rims: "#FFD700",
      accents: "#FFFFFF",
      reason: "Classic sophistication",
      style: "classic"
    }
  ]
};

// Helper function to get car type from model name
export function getCarType(modelName: string): keyof typeof colorSchemes {
  const name = modelName.toLowerCase();
  
  if (name.includes('raptor') || name.includes('mustang') || name.includes('corvette') || 
      name.includes('911') || name.includes('ferrari')) {
    return 'sports';
  }
  
  if (name.includes('range') || name.includes('escalade') || name.includes('tahoe') || 
      name.includes('explorer')) {
    return 'suv';
  }
  
  if (name.includes('rolls') || name.includes('bentley') || name.includes('maybach') || 
      name.includes('s-class')) {
    return 'luxury';
  }
  
  // Default to classic
  return 'classic';
}
