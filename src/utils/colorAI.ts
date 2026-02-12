import { colorSchemes, getCarType } from '@/data/colorSuggestions';

export interface ColorSuggestion {
  name: string;
  colors: {
    body: string;
    rims: string;
    accents: string;
  };
  reason: string;
  source: 'rule-based';
}

/**
 * Get instant rule-based color suggestions
 * These are fast and always available
 */
export function getRuleBasedSuggestions(
  carModelName: string, 
  count: number = 3
): ColorSuggestion[] {
  const carType = getCarType(carModelName);
  const schemes = colorSchemes[carType] || colorSchemes.classic;
  
  // Return random selection from curated schemes
  const shuffled = [...schemes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(scheme => ({
    name: scheme.name,
    colors: {
      body: scheme.body,
      rims: scheme.rims,
      accents: scheme.accents
    },
    reason: scheme.reason,
    source: 'rule-based' as const
  }));
}

/**
 * Generate complementary colors based on current selection
 * Uses color theory algorithms
 */
export function getComplementarySuggestions(hexColor: string): ColorSuggestion[] {
  const { h, s, l } = hexToHSL(hexColor);
  
  return [
    {
      name: "Complementary",
      colors: {
        body: hexColor,
        rims: hslToHex((h + 180) % 360, s, l),
        accents: hslToHex(h, Math.min(s + 20, 100), Math.max(l - 20, 10))
      },
      reason: "Perfect contrast using color wheel theory",
      source: 'rule-based'
    },
    {
      name: "Analogous",
      colors: {
        body: hexColor,
        rims: hslToHex((h + 30) % 360, s, l),
        accents: hslToHex((h - 30 + 360) % 360, s, l)
      },
      reason: "Harmonious colors next to each other on the wheel",
      source: 'rule-based'
    }
  ];
}

/**
 * Main function: Get local suggestions (rule-based + theory)
 */
export async function getHybridSuggestions(
  carModelName: string,
  currentColor?: string
): Promise<ColorSuggestion[]> {
  const suggestions: ColorSuggestion[] = [];

  // 1. Include rule-based (instant)
  suggestions.push(...getRuleBasedSuggestions(carModelName, 3));

  // 2. If there's a current color, add complementary suggestions
  if (currentColor) {
    suggestions.push(...getComplementarySuggestions(currentColor));
  }

  return suggestions.slice(0, 5);
}

// Color conversion utilities
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 50 };

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
