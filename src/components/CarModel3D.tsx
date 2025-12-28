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
  onModelLoad?: () => void;
  debugMode?: boolean;
  showSpoiler?: boolean;
  decalUrl?: string;
  onPartSelect?: (partId: string) => void;
}

function Loader() {
  return <Html center><div className="text-white">Loading 3D Model...</div></Html>
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
            enableZoom={true} // Stage might handle zoom, but explicit is good
            enablePan={false} // Usually good to disable pan in product view
        />
      </Canvas>
    </div>
  );
}

// Preload the model
