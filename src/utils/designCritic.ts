export type DesignState = {
  bodyColor?: string;
  rimColor?: string;
  wrapType?: string;
  decalUrl?: string;
  materialType?: string;
};

const COLOR_NAMES: Record<string, string> = {
  '#000000': 'Stealth Black',
  '#ffffff': 'Pure White',
  '#ff0000': 'Racing Red',
  '#0000ff': 'Deep Ocean Blue',
  '#00ff00': 'Neon Green',
  '#ffff00': 'Solar Yellow',
  '#ff5e1a': 'Sunset Orange',
  '#808080': 'Gunmetal Gray',
  '#4b0082': 'Midnight Indigo',
  '#ffd700': 'Luxury Gold',
};

const getClosestColorName = (hex: string) => {
  return COLOR_NAMES[hex.toLowerCase()] || 'Custom Shade';
};

export const getDesignCritique = (design: DesignState): { rating: number; message: string; title: string } => {
  let score = 75; // Base score
  const colorName = design.bodyColor ? getClosestColorName(design.bodyColor) : 'Original';
  
  const critiques: string[] = [];
  
  // Color analysis
  if (design.bodyColor === '#000000') {
    critiques.push("The Stealth Black look is timeless and aggressive.");
    score += 5;
  } else if (design.bodyColor?.toLowerCase() === '#ff0000') {
    critiques.push("Racing Red screams speed and high-performance.");
    score += 5;
  }

  // Material analysis
  if (design.materialType === 'matte') {
    critiques.push("Matte finishes are very trendy right now, giving the car a sophisticated, modern edge.");
    score += 10;
  } else if (design.materialType === 'metallic') {
    critiques.push("Excellent choice on the metallic finish; it really makes the car's curves pop under sunlight.");
  }

  // Decal analysis
  if (design.decalUrl) {
    if (design.decalUrl.includes('racing')) {
      critiques.push("The racing stripes add a great heritage feel to the design.");
      score += 5;
    } else if (design.decalUrl.includes('logo')) {
      critiques.push("The custom logo placement is bold and builds a unique brand identity.");
    }
  }

  // Combined checks
  if (design.bodyColor === '#000000' && design.materialType === 'matte') {
    return {
      title: "The Urban Predator",
      rating: 98,
      message: "This is a masterpiece. The Matte Stealth Black combined with your current setup looks incredibly menacing. It's subtle yet powerful."
    };
  }

  if (critiques.length === 0) {
    return {
      title: "Clean Slate",
      rating: 70,
      message: "A very clean, factory-style look. Sometimes less is more!"
    };
  }

  return {
    title: `${colorName} Concept`,
    rating: Math.min(100, score),
    message: critiques.join(' ')
  };
};
