import { useGLTF } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
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
    const { scene } = useGLTF(modelPath);

    const clonedScene = useMemo(() => {
        const clone = scene.clone();

        // Auto-center and normalize scale
        const box = new THREE.Box3().setFromObject(clone);
        const center = new THREE.Vector3();
        box.getCenter(center);
        clone.position.sub(center); // Center the model

        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);

        // Scale to a standard 1.5m unit if it's too big or small
        if (maxDim > 0) {
            const targetSize = 1.5;
            const scaleFactor = targetSize / maxDim;
            clone.scale.multiplyScalar(scaleFactor);
        }

        return clone;
    }, [scene]);

    // Apply color based on partType
    useEffect(() => {
        if (!clonedScene) return;
        const color = partType === 'rim' ? rimColor : bodyColor;
        if (!color) return;

        clonedScene.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material) {
                    const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).clone() as THREE.MeshStandardMaterial;
                    mat.map = null;
                    mat.emissiveMap = null;
                    mat.metalnessMap = null;
                    mat.roughnessMap = null;
                    mat.color = new THREE.Color(color);
                    mat.metalness = partType === 'rim' ? 0.8 : 0.4;
                    mat.roughness = partType === 'rim' ? 0.2 : 0.3;
                    mat.needsUpdate = true;
                    mesh.material = mat;
                }
            }
        });
    }, [clonedScene, bodyColor, rimColor, partType]);

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
