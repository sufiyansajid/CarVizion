import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Html } from '@react-three/drei';
import { CarModel } from './CarModel';

interface CarModel3DProps {
  modelPath?: string;
  bodyColor?: string;
  rimColor?: string;
  windowTint?: number;
  metalness?: number;
  roughness?: number;
  underglowColor?: string;
  underglowIntensity?: number;
  headlightColor?: string;
  taillightColor?: string;
  wrapType?: string;
  spoilerStyle?: string;
  spoilerColor?: string;
  rimStyle?: 'sport' | 'classic' | 'mesh' | 'deepdish' | 'stock';
  onModelLoad?: () => void;
  debugMode?: boolean;
  showSpoiler?: boolean;
  decalUrl?: string;
  onPartSelect?: (partId: string) => void;
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4 p-6 bg-background/80 backdrop-blur-sm rounded-xl border border-primary/20 shadow-lg">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="text-foreground font-medium">Loading 3D Model</p>
          <p className="text-muted-foreground text-sm">Please wait...</p>
        </div>
      </div>
    </Html>
  );
}

export default function CarModel3D(props: CarModel3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
        <Suspense fallback={<Loader />}>
          <Stage environment="sunset" intensity={0.5}>
             <CarModel {...props} onPartSelect={props.onPartSelect} />
          </Stage>
        </Suspense>
        
        <OrbitControls 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2} 
            enableZoom={true}
            enablePan={false}
        />
      </Canvas>
    </div>
  );
}
