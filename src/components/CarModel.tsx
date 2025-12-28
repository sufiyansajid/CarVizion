import { useRef, useEffect, useState } from 'react';
import { useGLTF, Decal, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { createPortal, type ThreeElements, type ThreeEvent } from '@react-three/fiber';
import { CAR_3D_MAPPING, hasManualMapping, applyManualMapping } from '../config/partMapping';

type CarModelProps = ThreeElements['group'] & {
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
};

export function CarModel({
  modelPath = '/models/Car3D.glb',
  bodyColor,
  rimColor,
  windowTint = 0,
  metalness = 0.5,
  roughness = 0.5,
  underglowColor,
  underglowIntensity = 0,
  headlightColor,
  taillightColor,
  wrapType,
  spoilerStyle = 'wing',
  spoilerColor,
  onModelLoad,
  debugMode = false,
  showSpoiler = false,
  decalUrl,
  onPartSelect,
  ...props
}: CarModelProps) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);

  const [carParts, setCarParts] = useState<{
    body: THREE.Mesh[];
    rims: THREE.Mesh[];
    windows: THREE.Mesh[];
    lights: THREE.Mesh[];
    taillights: THREE.Mesh[];
  }>({
    body: [],
    rims: [],
    windows: [],
    lights: [],
    taillights: [],
  });

  const originalMaterials = useRef<Map<string, THREE.Material | THREE.Material[]>>(new Map());

  // --- 1. Part Detection Logic ---
  useEffect(() => {
    if (scene) {
      let body: THREE.Mesh[] = [];
      let rims: THREE.Mesh[] = [];
      let windows: THREE.Mesh[] = [];
      let lights: THREE.Mesh[] = [];
      let taillights: THREE.Mesh[] = [];
      const allMeshes: THREE.Mesh[] = [];
      let maxVolume = 0;

      console.log('=== CAR MODEL MESH ANALYSIS ===');

      // Pass 1: Collect all meshes and find max volume
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
          const bbox = child.geometry.boundingBox;
          if (bbox) {
            const size = new THREE.Vector3();
            bbox.getSize(size);
            const volume = size.x * size.y * size.z;
            if (volume > maxVolume) maxVolume = volume;
          }
          allMeshes.push(child);
          if (!originalMaterials.current.has(child.uuid)) {
            originalMaterials.current.set(child.uuid, child.material);
          }
        }
      });

      console.log(`Total meshes found: ${allMeshes.length}`);
      console.log(`Max volume: ${maxVolume.toFixed(4)}`);

      // Keywords for part detection (expanded)
      const rimKeywords = ['wheel', 'tire', 'rim', 'tyre', 'hub', 'rotor', 'brake', 'caliper'];
      const windowKeywords = ['window', 'glass', 'windshield', 'windscreen', 'mirror'];
      const headlightKeywords = ['headlight', 'front_light', 'fog', 'beam', 'led'];
      const taillightKeywords = ['taillight', 'tail_light', 'rear_light', 'brake_light', 'rear', 'back_light'];
      const lightKeywords = ['light', 'lamp', 'headlight', 'taillight', 'fog', 'beam', 'led', 'bulb', 'indicator', 'signal'];
      const bodyKeywords = ['body', 'door', 'hood', 'bonnet', 'trunk', 'roof', 'fender', 'bumper', 'panel', 'frame', 'chassis'];

      // Pass 2: Categorize with improved logic
      if (hasManualMapping(CAR_3D_MAPPING)) {
        const result = applyManualMapping(allMeshes, CAR_3D_MAPPING);
        body = result.body; rims = result.rims; windows = result.windows; lights = result.lights;
        console.log('Using manual mapping');
      } else {
        if (allMeshes.length <= 3) {
           allMeshes.forEach(mesh => body.push(mesh));
        } else {
          allMeshes.forEach((mesh) => {
            const name = mesh.name.toLowerCase();
            const geometry = mesh.geometry;
            const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
            const bbox = geometry.boundingBox;
            
            if (!bbox) { body.push(mesh); return; }

          const size = new THREE.Vector3();
          bbox.getSize(size);
          const volume = size.x * size.y * size.z;
          const volumeRatio = volume / maxVolume;

            let category = 'body';

            if (name.includes('wheel') || name.includes('tire') || name.includes('rim')) category = 'rim';
            else if (name.includes('window') || name.includes('glass')) category = 'window';
            else if (name.includes('light') || name.includes('lamp') || name.includes('head')) {
               if (volume < maxVolume * 0.2) category = 'light';
            }
            else if (material && (material instanceof THREE.MeshStandardMaterial)) {
              if (material.transparent && material.opacity < 0.9) category = 'window';
              else if (material.emissive && material.emissiveIntensity && material.emissiveIntensity > 0) {
                 if (volume < maxVolume * 0.5) category = 'light';
              }
            }
            else {
              if (volume < maxVolume * 0.01) category = 'light';
              else if (volume < maxVolume * 0.1 && minDim / maxDim > 0.3) {
                const isAtCorner = Math.abs(worldPos.x) > 0.3 || Math.abs(worldPos.z) > 0.3;
                if (isAtCorner) category = 'rim';
              }
            }

            if (volume > maxVolume * 0.5 && category !== 'window') category = 'body';

          switch (category) {
            case 'rim': rims.push(mesh); break;
            case 'window': windows.push(mesh); break;
            case 'light': lights.push(mesh); break;
            case 'taillight': taillights.push(mesh); break;
            default: body.push(mesh); break;
          }
        });
      }

      console.log('=== DETECTION SUMMARY ===');
      console.log(`  Body parts: ${body.length}`);
      console.log(`  Rim parts: ${rims.length}`);
      console.log(`  Window parts: ${windows.length}`);
      console.log(`  Headlight parts: ${lights.length}`);
      console.log(`  Taillight parts: ${taillights.length}`);

      setCarParts({ body, rims, windows, lights, taillights });
      onModelLoad?.();
    }
  }, [scene, onModelLoad]);

  // --- 2. Material Application ---
  useEffect(() => {
    const applyOrReset = (meshes: THREE.Mesh[], color: string | undefined, params: any = {}) => {
      meshes.forEach(mesh => {
        if (color && mesh.material) {
            const originalMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
            const newMat = originalMat.clone() as THREE.MeshStandardMaterial;
            newMat.color = new THREE.Color(color);
            Object.assign(newMat, params);
            mesh.material = newMat;
        } else {
            const orig = originalMaterials.current.get(mesh.uuid);
            if (orig) mesh.material = orig;
        }
      });
    };

    // Helper to reset material to original
    const resetMaterial = (mesh: THREE.Mesh) => {
      const orig = originalMaterials.current.get(mesh.uuid);
      if (orig) {
        mesh.material = orig;
      }
    };

    if (debugMode) {
        carParts.body.forEach(m => (m.material as any).color.set('#ff5e1a'));
        carParts.rims.forEach(m => (m.material as any).color.set('#00ffff'));
        carParts.windows.forEach(m => (m.material as any).color.set('#ffff00'));
        carParts.lights.forEach(m => (m.material as any).color.set('#ff00ff'));
    } else {
      applyOrReset(carParts.body, bodyColor, { metalness, roughness });
      applyOrReset(carParts.rims, rimColor, { metalness: 0.9, roughness: 0.1 });
      
      carParts.windows.forEach(mesh => {
         if (windowTint > 0) {
            const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).clone() as THREE.MeshStandardMaterial;
            mat.transparent = true;
            mat.opacity = 1 - windowTint;
            mat.color = new THREE.Color('#000000');
            mat.metalness = 0.5;
            mat.roughness = 0.2;
            mesh.material = mat;
         } else {
             const orig = originalMaterials.current.get(mesh.uuid);
             if (orig) mesh.material = orig;
         }
      });

      applyOrReset(carParts.lights, headlightColor, { emissive: new THREE.Color(headlightColor), emissiveIntensity: 0.5 });
    }
  }, [carParts, bodyColor, rimColor, windowTint, metalness, roughness, headlightColor, debugMode]);

  // --- 3. Click Handler ---
  const handleGroupClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation(); // Stop click from hitting the floor/background

    if (!onPartSelect) return;

    const clickedMesh = e.object as THREE.Mesh;

    if (carParts.rims.includes(clickedMesh)) onPartSelect('rims');
    else if (carParts.windows.includes(clickedMesh)) onPartSelect('windowtint');
    else if (carParts.lights.includes(clickedMesh)) onPartSelect('headlights');
    else if (carParts.body.includes(clickedMesh)) onPartSelect('paint');
    else onPartSelect('paint'); // Default fallback
  };

  return (
    <group {...props} ref={groupRef} onClick={handleGroupClick}>
        <primitive object={scene} />
        {underglowIntensity > 0 && underglowColor && (
             <spotLight
                position={[0, 0.2, 0]}
                angle={Math.PI / 2}
                penumbra={0.5}
                color={underglowColor}
                intensity={underglowIntensity * 5}
                distance={10}
                castShadow
             />
        )}
        {showSpoiler && <Spoiler />}
        {decalUrl && carParts.body.length > 0 && (
          <CarDecal targetMesh={carParts.body[0]} decalUrl={decalUrl} />
        )}
    </group>
  );
}

function CarDecal({ targetMesh, decalUrl }: { targetMesh: THREE.Mesh; decalUrl: string }) {
  const texture = useTexture(decalUrl);
  return createPortal(
    <Decal position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
      <meshPhysicalMaterial transparent map={texture} polygonOffset polygonOffsetFactor={-1} />
    </Decal>,
    targetMesh
  );
}

function Spoiler() {
    return (
        <group position={[0, 0.7, -2.1]}>
            <mesh position={[0, 0.2, 0]}><boxGeometry args={[1.6, 0.05, 0.3]} /><meshStandardMaterial color="#111" /></mesh>
            <mesh position={[-0.5, 0, 0]}><boxGeometry args={[0.05, 0.3, 0.1]} /><meshStandardMaterial color="#111" /></mesh>
            <mesh position={[0.5, 0, 0]}><boxGeometry args={[0.05, 0.3, 0.1]} /><meshStandardMaterial color="#111" /></mesh>
        </group>
    );
}