import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface MindARViewerProps {
    onReady?: () => void;
    onTargetFound?: () => void;
    onTargetLost?: () => void;
    modelPath: string;
}

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        MINDAR: any;
    }
}

export const MindARViewer = ({
    onReady,
    onTargetFound,
    onTargetLost,
    modelPath,
}: MindARViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let mindarThree: any = null;

        const initMindAR = async () => {
            if (!window.MINDAR || !containerRef.current) return;

            try {
                // Initialize MindAR Image Three
                // Using a placeholder target image URL - users should replace this with their car rear .mind file
                // For demonstration, we'll try to load a sample if one existed, but here we just show the structure
                mindarThree = new window.MINDAR.IMAGE.MindARThree({
                    container: containerRef.current,
                    imageTargetSrc: "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind", // Placeholder target
                });

                const { renderer, scene, camera } = mindarThree;

                const anchor = mindarThree.addAnchor(0);

                // Load the spoiler model
                const loader = new GLTFLoader();
                loader.load(modelPath, (gltf) => {
                    const model = gltf.scene;
                    model.scale.set(0.1, 0.1, 0.1); // Small scale for tracking
                    model.position.set(0, 0, 0);
                    anchor.group.add(model);
                });

                const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
                scene.add(ambientLight);

                const directLight = new THREE.DirectionalLight(0xffffff, 1);
                directLight.position.set(0, 0, 1);
                scene.add(directLight);

                anchor.onTargetFound = () => {
                    console.log("Target found");
                    onTargetFound?.();
                };

                anchor.onTargetLost = () => {
                    console.log("Target lost");
                    onTargetLost?.();
                };

                await mindarThree.start();
                setIsInitializing(false);
                onReady?.();

                renderer.setAnimationLoop(() => {
                    renderer.render(scene, camera);
                });
            } catch (err) {
                console.error("MindAR initialization failed:", err);
                setIsInitializing(false);
            }
        };

        initMindAR();

        return () => {
            if (mindarThree) {
                mindarThree.stop();
                const { renderer } = mindarThree;
                if (renderer) {
                    renderer.setAnimationLoop(null);
                }
            }
        };
    }, [modelPath, onReady, onTargetFound, onTargetLost]);

    return (
        <div className="relative w-full h-full min-h-[400px]">
            {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 text-white">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p>Initializing MindAR Tracking...</p>
                    </div>
                </div>
            )}
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
};
