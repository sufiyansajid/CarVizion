import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Html } from "@react-three/drei";
import { Suspense } from "react";
import { ARModel } from "./ARModel";

interface ARRendererProps {
    modelPath: string;
    isActive: boolean;
    modelScale?: number;
    modelPosition?: [number, number, number];
}

export const ARRenderer = ({
    modelPath,
    isActive,
    modelScale = 1,
    modelPosition = [0, -1, 0],
}: ARRendererProps) => {
    if (!isActive) {
        return null;
    }

    return (
        <div className="absolute inset-0 w-full h-full" style={{ pointerEvents: "auto" }}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                gl={{
                    alpha: true,
                    antialias: true,
                    powerPreference: "high-performance",
                    preserveDrawingBuffer: true
                }}
                style={{ background: "transparent" }}
                dpr={[1, 2]}
            >
                <Suspense
                    fallback={
                        <Html center>
                            <div className="text-white bg-black/50 px-4 py-2 rounded-lg">
                                Loading 3D Model...
                            </div>
                        </Html>
                    }
                >
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 10, 5]} intensity={1.2} />
                    <pointLight position={[-10, -10, -5]} intensity={0.5} />
                    <ARModel
                        modelPath={modelPath}
                        scale={modelScale}
                        position={modelPosition}
                        visible={true}
                    />
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                    <OrbitControls
                        enableZoom={true}
                        enablePan={false}
                        enableRotate={true}
                        minDistance={2}
                        maxDistance={10}
                        enableDamping={true}
                        dampingFactor={0.05}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};
