import React, { useRef, useEffect, useState } from 'react';
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
        console.log('Using automatic detection');
        
        allMeshes.forEach((mesh) => {
          const name = mesh.name.toLowerCase();
          const geometry = mesh.geometry;
          const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          const bbox = geometry.boundingBox;
          
          if (!bbox) { 
            body.push(mesh); 
            console.log(`  ${mesh.name} -> BODY (no bbox)`);
            return; 
          }

          const size = new THREE.Vector3();
          bbox.getSize(size);
          const volume = size.x * size.y * size.z;
          const volumeRatio = volume / maxVolume;

          let category = 'body';
          let reason = 'default';

          // 1. Name-based detection (highest priority)
          if (rimKeywords.some(kw => name.includes(kw))) {
            category = 'rim';
            reason = 'name match (rim keywords)';
          } else if (windowKeywords.some(kw => name.includes(kw))) {
            category = 'window';
            reason = 'name match (window keywords)';
          } else if (taillightKeywords.some(kw => name.includes(kw))) {
            category = 'taillight';
            reason = 'name match (taillight keywords)';
          } else if (headlightKeywords.some(kw => name.includes(kw)) || lightKeywords.some(kw => name.includes(kw))) {
            category = 'light';
            reason = 'name match (light keywords)';
          } else if (bodyKeywords.some(kw => name.includes(kw))) {
            category = 'body';
            reason = 'name match (body keywords)';
          }
          // 2. Material-based detection (if name doesn't match)
          else if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
            // Transparent = window
            if (material.transparent && material.opacity < 0.9) {
              category = 'window';
              reason = 'transparent material';
            }
            // Emissive = light (only small parts)
            else if (material.emissive && (material.emissive.r > 0 || material.emissive.g > 0 || material.emissive.b > 0)) {
              if (volumeRatio < 0.05) {
                category = 'light';
                reason = 'emissive material + small size';
              }
            }
          }
          
          // 3. Very large parts are always body (override)
          if (volumeRatio > 0.3 && category !== 'window') {
            category = 'body';
            reason = 'large volume (body override)';
          }

          // Log the categorization
          console.log(`  ${mesh.name || '(unnamed)'} -> ${category.toUpperCase()} (${reason}, vol: ${(volumeRatio * 100).toFixed(1)}%)`);

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
    // Helper to safely set color on a material
    const setMaterialColor = (mesh: THREE.Mesh, color: string, extraParams?: any) => {
      if (!mesh.material) return;
      
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat) => {
        if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
          mat.color.set(color);
          if (extraParams?.metalness !== undefined) mat.metalness = extraParams.metalness;
          if (extraParams?.roughness !== undefined) mat.roughness = extraParams.roughness;
          if (extraParams?.emissive) mat.emissive.set(extraParams.emissive);
          if (extraParams?.emissiveIntensity !== undefined) mat.emissiveIntensity = extraParams.emissiveIntensity;
          mat.needsUpdate = true;
        } else if ((mat as any).color) {
          // Fallback for other material types with a color property
          (mat as any).color.set(color);
          mat.needsUpdate = true;
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
      // Debug mode: color-code parts
      carParts.body.forEach(m => setMaterialColor(m, '#ff5e1a'));      // Orange
      carParts.rims.forEach(m => setMaterialColor(m, '#00ffff'));      // Cyan
      carParts.windows.forEach(m => setMaterialColor(m, '#ffff00'));   // Yellow
      carParts.lights.forEach(m => setMaterialColor(m, '#ff00ff'));    // Magenta
      carParts.taillights.forEach(m => setMaterialColor(m, '#ff0000')); // Red
    } else {
      // Normal mode: apply user customizations or reset to original
      
      // Get wrap properties
      const getWrapProperties = () => {
        switch (wrapType) {
          case 'Matte Black':
            return { color: '#111111', metalness: 0, roughness: 1 };
          case 'Chrome':
            return { color: '#cccccc', metalness: 1, roughness: 0 };
          case 'Carbon Fiber':
            return { color: '#222222', metalness: 0.6, roughness: 0.3 };
          case 'Camo':
            return { color: '#4a5d23', metalness: 0.2, roughness: 0.8 };
          case 'Gloss Red':
            return { color: '#cc0000', metalness: 0.8, roughness: 0.1 };
          default:
            return null;
        }
      };

      const wrapProps = getWrapProperties();
      
      // Body color (with wrap support)
      carParts.body.forEach(mesh => {
        if (wrapProps) {
          // Wrap takes priority
          setMaterialColor(mesh, wrapProps.color, { 
            metalness: wrapProps.metalness, 
            roughness: wrapProps.roughness 
          });
        } else if (bodyColor) {
          setMaterialColor(mesh, bodyColor, { metalness, roughness });
        } else {
          resetMaterial(mesh);
        }
      });

      // Rim color  
      carParts.rims.forEach(mesh => {
        if (rimColor) {
          setMaterialColor(mesh, rimColor, { metalness: 0.9, roughness: 0.1 });
        } else {
          resetMaterial(mesh);
        }
      });
      
      // Window tint
      carParts.windows.forEach(mesh => {
        if (windowTint > 0) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              mat.transparent = true;
              mat.opacity = 1 - windowTint;
              mat.color.set('#1a1a1a');
              mat.needsUpdate = true;
            }
          });
        } else {
          resetMaterial(mesh);
        }
      });

      // Headlight color
      carParts.lights.forEach(mesh => {
        if (headlightColor) {
          setMaterialColor(mesh, headlightColor, { 
            emissive: headlightColor, 
            emissiveIntensity: 0.8 
          });
        } else {
          resetMaterial(mesh);
        }
      });

      // Taillight color
      carParts.taillights.forEach(mesh => {
        if (taillightColor) {
          setMaterialColor(mesh, taillightColor, { 
            emissive: taillightColor, 
            emissiveIntensity: 1.0 
          });
        } else {
          resetMaterial(mesh);
        }
      });
    }
  }, [carParts, bodyColor, rimColor, windowTint, metalness, roughness, headlightColor, taillightColor, wrapType, debugMode]);

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
        {showSpoiler && <Spoiler style={spoilerStyle} color={spoilerColor || bodyColor} />}
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

function Spoiler({ style = 'wing', color = '#111111' }: { style?: string; color?: string }) {
    const spoilerColor = color || '#111111';
    
    // Different spoiler styles
    if (style === 'ducktail') {
      return (
        <group position={[0, 0.6, -2.1]}>
          <mesh rotation={[0.3, 0, 0]}>
            <boxGeometry args={[1.5, 0.03, 0.4]} />
            <meshStandardMaterial color={spoilerColor} metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      );
    }
    
    if (style === 'lip') {
      return (
        <group position={[0, 0.55, -2.2]}>
          <mesh>
            <boxGeometry args={[1.4, 0.04, 0.15]} />
            <meshStandardMaterial color={spoilerColor} metalness={0.6} roughness={0.2} />
          </mesh>
        </group>
      );
    }
    
    if (style === 'gt') {
      return (
        <group position={[0, 0.8, -2.0]}>
          {/* Large GT wing */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[1.8, 0.06, 0.35]} />
            <meshStandardMaterial color={spoilerColor} metalness={0.7} roughness={0.2} />
          </mesh>
          {/* Tall stands */}
          <mesh position={[-0.6, 0, 0]}>
            <boxGeometry args={[0.06, 0.5, 0.1]} />
            <meshStandardMaterial color={spoilerColor} metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0.6, 0, 0]}>
            <boxGeometry args={[0.06, 0.5, 0.1]} />
            <meshStandardMaterial color={spoilerColor} metalness={0.7} roughness={0.2} />
          </mesh>
          {/* End plates */}
          <mesh position={[-0.9, 0.35, 0]}>
            <boxGeometry args={[0.02, 0.2, 0.4]} />
            <meshStandardMaterial color={spoilerColor} metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0.9, 0.35, 0]}>
            <boxGeometry args={[0.02, 0.2, 0.4]} />
            <meshStandardMaterial color={spoilerColor} metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      );
    }
    
    // Default: Wing style
    return (
      <group position={[0, 0.7, -2.1]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[1.6, 0.05, 0.3]} />
          <meshStandardMaterial color={spoilerColor} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[-0.5, 0, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.1]} />
          <meshStandardMaterial color={spoilerColor} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.1]} />
          <meshStandardMaterial color={spoilerColor} metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    );
}