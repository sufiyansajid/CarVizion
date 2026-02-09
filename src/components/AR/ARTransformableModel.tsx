import { useRef } from "react";
import { TransformControls } from "@react-three/drei";
import { ARModel } from "./ARModel";
import { Group } from "three";


interface ARTransformableModelProps {
    modelPath: string;
    initialScale?: number;
    initialPosition?: [number, number, number];
    initialRotation?: [number, number, number];
    isSelected: boolean;
    mode: "translate" | "rotate" | "scale";
    onSelect: () => void;
    onTransformEnd?: (position: [number, number, number], rotation: [number, number, number], scale: number) => void;
}

export const ARTransformableModel = ({
    modelPath,
    initialScale = 1,
    initialPosition = [0, 0, 0],
    initialRotation = [0, 0, 0],
    isSelected,
    mode,
    onSelect,
    onTransformEnd,
}: ARTransformableModelProps) => {
    const modelRef = useRef<Group>(null!);

    return (
        <group onClick={(e) => { e.stopPropagation(); onSelect(); }}>
            {isSelected && (
                <TransformControls
                    object={modelRef}
                    mode={mode}
                    onMouseUp={(e: any) => {
                        // When using object prop, e.target.object is the object being transformed
                        if (e?.target?.object) {
                            const { position, rotation, scale } = e.target.object;
                            onTransformEnd?.(
                                [position.x, position.y, position.z],
                                [rotation.x, rotation.y, rotation.z],
                                scale.x
                            );
                        }
                    }}
                />
            )}
            <ARModel
                ref={modelRef}
                modelPath={modelPath}
                scale={initialScale}
                position={initialPosition}
                rotation={initialRotation}
            />

            {isSelected && (
                <mesh position={[0, 2, 0]}>
                    {/* Future: UI for mode switching could go here as an Html overlay */}
                </mesh>
            )}
        </group>
    );
};
