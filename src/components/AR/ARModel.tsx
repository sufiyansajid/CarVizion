import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, forwardRef, useEffect } from "react";
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
    bodyColor?: string;
    rimColor?: string;
    partType?: 'body' | 'bumper' | 'spoiler' | 'rim';
}

export const ARModel = forwardRef<THREE.Group, ARModelProps>(({
    modelPath,
    scale = 1,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    visible = true,
    bodyColor,
    rimColor,
    partType,
}, ref) => {
    const { scene } = useGLTF(modelPath) as any;


    const clonedScene = useMemo(() => scene.clone(), [scene]);

    // Apply color based on partType
    useEffect(() => {
        if (!clonedScene) return;
        const color = partType === 'rim' ? rimColor : bodyColor;
        if (!color) return;

        clonedScene.traverse((child: any) => {
            if (child.isMesh && child.material) {
                const mat = child.material.clone() as THREE.MeshStandardMaterial;
                mat.map = null;
                mat.emissiveMap = null;
                mat.metalnessMap = null;
                mat.roughnessMap = null;
                mat.color = new THREE.Color(color);
                mat.metalness = partType === 'rim' ? 0.8 : 0.3;
                mat.roughness = partType === 'rim' ? 0.2 : 0.5;
                mat.needsUpdate = true;
                child.material = mat;
            }
        });
    }, [clonedScene, bodyColor, rimColor, partType]);

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
