import { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Move, Maximize, RotateCw } from 'lucide-react';

interface CoordinateDebuggerProps {
  onUpdate: (data: { position: [number, number, number]; rotation: [number, number, number]; scale: number }) => void;
  onCarScaleUpdate?: (scale: number) => void;
  initialData: { position: [number, number, number]; rotation: [number, number, number]; scale: number };
  initialCarScale?: number;
  label: string;
}

export function CoordinateDebugger({ onUpdate, onCarScaleUpdate, initialData, initialCarScale = 1, label }: CoordinateDebuggerProps) {
  const [posX, setPosX] = useState(initialData.position[0]);
  const [posY, setPosY] = useState(initialData.position[1]);
  const [posZ, setPosZ] = useState(initialData.position[2]);
  const [scale, setScale] = useState(initialData.scale);
  const [carScale, setCarScale] = useState(initialCarScale);
  const [rotZ, setRotZ] = useState(initialData.rotation[2]);

  useEffect(() => {
    onUpdate({
      position: [posX, posY, posZ],
      rotation: [0, 0, rotZ],
      scale: scale
    });
  }, [posX, posY, posZ, scale, rotZ, onUpdate]);

  return (
    <Html position={[posX, posY + 0.5, posZ]} center>
      <Card className="p-3 w-48 shadow-xl border-primary/40 bg-background/90 backdrop-blur-md scale-75 origin-top">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
          <Move className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px]">X-Pos</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={posX} 
              onChange={(e) => setPosX(parseFloat(e.target.value))}
              className="h-6 text-[10px] px-1"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px]">Y-Pos</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={posY} 
              onChange={(e) => setPosY(parseFloat(e.target.value))}
              className="h-6 text-[10px] px-1"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px]">Z-Pos</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={posZ} 
              onChange={(e) => setPosZ(parseFloat(e.target.value))}
              className="h-6 text-[10px] px-1"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px]">Scale</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={scale} 
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="h-6 text-[10px] px-1"
            />
          </div>
          <div className="space-y-1 col-span-2 border-t border-border pt-2 mt-1">
            <Label className="text-[9px] text-blue-400">CAR BODY SCALE (Fix Tiny Car)</Label>
            <Input 
              type="number" 
              step="0.1" 
              value={carScale} 
              onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCarScale(val);
                  onCarScaleUpdate?.(val);
              }}
              className="h-6 text-[10px] px-1 bg-blue-500/10 border-blue-500/30"
            />
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
          <div className="text-[8px] text-muted-foreground font-mono">
            Car: {carScale.toFixed(2)} | Hub: [{posX.toFixed(2)}, {posY.toFixed(2)}, {posZ.toFixed(2)}]
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5"
            onClick={() => {
                console.log(`DEBUG DATA FOR ${label}:`, {
                   position: [posX, posY, posZ],
                   rotation: [0, 0, rotZ],
                   scale: scale
                });
            }}
          >
            <Maximize className="w-3 h-3" />
          </Button>
        </div>
      </Card>
    </Html>
  );
}
