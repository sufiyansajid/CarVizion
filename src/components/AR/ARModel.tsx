import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, forwardRef } from "react";
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

export const ARModel = forwardRef<THREE.Group, ARModelProps>(({
    modelPath,
    scale = 1,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    visible = true,
}, ref) => {
    const { scene } = useGLTF(modelPath) as any;
    // Use the passed ref or fallback to a local one if not provided (though in this use case it will be provided)
    // We need to ensure we don't break if ref is not passed, but forwardRef handles that (ref can be null)
    // However, if we need internal access, we might need useImperativeHandle or just rely on the parent.
    // For simplicity, let's just use the forwarded ref on the group.

    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useFrame(() => {
        // Any animations can go here
    });

    return (
        <group
            ref={ref}
            scale={scale}
            position={position}
            rotation={rotation}
            visible={visible}
        >
            <primitive object={clonedScene} />
        </group>
    );
});

ARModel.displayName = "ARModel";
