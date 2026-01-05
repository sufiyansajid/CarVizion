import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Check, Palette as PaletteIcon, Sparkles, Loader2 } from 'lucide-react';
import { getHybridSuggestions, type ColorSuggestion } from '@/utils/colorAI';

export interface ColorPalette {
  name: string;
  metalness: number;
  roughness: number;
  colors: string[];
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onMaterialChange?: (metalness: number, roughness: number) => void;
  onApplySuggestion?: (suggestion: ColorSuggestion) => void;
  carModelName?: string;
  label?: string;
  className?: string;
}

export const palettes: ColorPalette[] = [
  {
    name: "Matte",
    metalness: 0.2,  // Low metalness for flat, non-reflective look
    roughness: 0.7,  // High roughness for matte finish
    colors: ["#2D3436", "#636E72", "#6D1B1B", "#1B2A1B", "#1B1B2A", "#F1C40F"]
  },
  {
    name: "Solid",
    metalness: 0.3,  // Realistic car paint - slightly metallic
    roughness: 0.4,  // Medium roughness for standard paint
    colors: ["#ff5e1a", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ffffff", "#000000"]
  },
  {
    name: "Satin",
    metalness: 0.4,  // Semi-metallic for satin finish
    roughness: 0.3,  // Slightly glossy
    colors: ["#1a1a1a", "#4a4a4a", "#8b0000", "#004d00", "#00004d", "#8b8b00"]
  },
  {
    name: "Metallic",
    metalness: 0.8,  // High metalness for chrome/metallic look
    roughness: 0.2,  // Low roughness for shiny finish
    colors: ["#C0C0C0", "#FFD700", "#B87333", "#2F4F4F", "#1A2421", "#4A0404"]
  },
  {
    name: "Neon",
    metalness: 0.2,  // Low metalness for fluorescent look
    roughness: 0.3,  // Medium-low roughness for slight shine
    colors: ["#39FF14", "#FF007F", "#00FFFF", "#FFD300", "#FF1493", "#BC13FE"]
  }
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange, 
  onMaterialChange,
  onApplySuggestion,
  carModelName = 'Sports Car',
  label,
  className 
}) => {
  const [activePalette, setActivePalette] = useState(palettes[0]);
  const [inputValue, setInputValue] = useState(color);
  const [suggestions, setSuggestions] = useState<ColorSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync internal hex input with prop
  useEffect(() => {
    setInputValue(color);
  }, [color]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange(val);
    }
  };

  const selectPalette = (palette: ColorPalette) => {
    setActivePalette(palette);
    if (onMaterialChange) {
      onMaterialChange(palette.metalness, palette.roughness);
    }
  };

  const fetchAISuggestions = async () => {
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    try {
      const results = await getHybridSuggestions(carModelName, color);
      setSuggestions(results);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: ColorSuggestion) => {
    onChange(suggestion.colors.body);
    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label className="text-sm font-medium mb-2 block">{label}</Label>}
      
      {/* Current Selection & Hex Input */}
      <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10 backdrop-blur-md">
        <div 
          className="w-10 h-10 rounded-md border-2 border-white/20 shadow-inner"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1">
          <Input 
            value={inputValue}
            onChange={handleHexChange}
            className="h-8 bg-transparent border-none focus-visible:ring-0 text-xs font-mono"
            placeholder="#HEXCODE"
          />
        </div>
      </div>

      {/* Palette Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {palettes.map((p) => (
          <button
            key={p.name}
            onClick={() => selectPalette(p)}
            className={cn(
              "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all border",
              activePalette.name === p.name 
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Swatches Grid */}
      <div className="grid grid-cols-4 gap-2">
        {activePalette.colors.map((c, i) => (
          <button
            key={i}
            onClick={() => {
              onChange(c);
              // Ensure material properties are applied even when just picking a color from the palette
              if (onMaterialChange) onMaterialChange(activePalette.metalness, activePalette.roughness);
            }}
            className={cn(
              "group relative aspect-square rounded-lg border-2 transition-all flex items-center justify-center overflow-hidden",
              color === c ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-white/10 hover:border-white/30 hover:scale-105"
            )}
            style={{ backgroundColor: c }}
          >
            {color === c && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                <Check className="w-4 h-4 text-white drop-shadow-md" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      {/* Material Detail Hint */}
      <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3">
        <PaletteIcon className="w-4 h-4 text-primary shrink-0" />
        <div className="text-[10px] leading-tight text-white/50">
          <span className="font-bold text-white uppercase block mb-0.5">{activePalette.name} Physics</span>
          Metalness: {(activePalette.metalness * 100).toFixed(0)}% • Roughness: {(activePalette.roughness * 100).toFixed(0)}%
        </div>
      </div>

      {/* AI Suggestions Section */}
      <div className="space-y-2">
        <Button
          onClick={fetchAISuggestions}
          disabled={loadingSuggestions}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
          size="sm"
        >
          {loadingSuggestions ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Suggest
            </>
          )}
        </Button>

        {showSuggestions && suggestions.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => applySuggestion(suggestion)}
                className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded border border-white/20" style={{ backgroundColor: suggestion.colors.body }} />
                    <div className="w-6 h-6 rounded border border-white/20" style={{ backgroundColor: suggestion.colors.rims }} />
                    <div className="w-6 h-6 rounded border border-white/20" style={{ backgroundColor: suggestion.colors.accents }} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      {suggestion.name}
                      {suggestion.source === 'ai' && (
                        <span className="text-[8px] bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full">AI</span>
                      )}
                    </div>
                    <div className="text-[10px] text-white/50">{suggestion.reason}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
