import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Html } from "@react-three/drei";
import { Suspense } from "react";
import { ARTransformableModel } from "./ARTransformableModel";

export interface ARPart {
    id: string;
    modelPath: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
}

interface ARRendererProps {
    models: ARPart[];
    isActive: boolean;
    selectedId: string | null;
    transformMode: "translate" | "rotate" | "scale";
    onSelect: (id: string | null) => void;
    onUpdate: (id: string, position: [number, number, number], rotation: [number, number, number], scale: number) => void;
}

export const ARRenderer = ({
    models,
    isActive,
    selectedId,
    transformMode,
    onSelect,
    onUpdate,
}: ARRendererProps) => {
    if (!isActive) {
        return null;
    }

    return (
        <div
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "auto" }}
            onClick={() => onSelect(null)}
        >
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
                            <div className="text-white bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md">
                                Loading 3D Parts...
                            </div>
                        </Html>
                    }
                >
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[10, 10, 5]} intensity={1.5} />
                    <pointLight position={[-10, -10, -5]} intensity={0.5} />

                    {models.map((part) => (
                        <ARTransformableModel
                            key={part.id}
                            modelPath={part.modelPath}
                            initialPosition={part.position}
                            initialRotation={part.rotation}
                            initialScale={part.scale}
                            isSelected={selectedId === part.id}
                            mode={transformMode}
                            onSelect={() => onSelect(part.id)}
                            onTransformEnd={(pos, rot, scale) => onUpdate(part.id, pos, rot, scale)}
                        />
                    ))}

                    <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                    <OrbitControls
                        makeDefault
                        enabled={!selectedId}
                        enableZoom={true}
                        enablePan={true}
                        enableRotate={true}
                        minDistance={2}
                        maxDistance={15}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};

