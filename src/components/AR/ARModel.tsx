import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// Preload the default car model
if (typeof window !== "undefined") {
    useGLTF.preload("/models/Car3D.glb");
}

interface ARModelProps {
    modelPath: string;
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    visible?: boolean;
}

export const ARModel = ({
    modelPath,
    scale = 1,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    visible = true,
}: ARModelProps) => {
    const { scene } = useGLTF(modelPath);
    const modelRef = useRef<THREE.Group>(null);

    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useFrame(() => {
        if (modelRef.current) {
            // Any animations can go here
        }
    });

    return (
        <group
            ref={modelRef}
            scale={scale}
            position={position}
            rotation={rotation}
            visible={visible}
        >
            <primitive object={clonedScene} />
        </group>
    );
};
