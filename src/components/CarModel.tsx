import { useRef, useEffect, useState } from 'react';
import { useGLTF, Decal, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { createPortal, type ThreeElements, type ThreeEvent } from '@react-three/fiber';
import { CAR_3D_MAPPING, hasManualMapping, applyManualMapping } from '../config/partMapping';
import { RimGeometry, type RimStyle } from './RimGeometry';

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
  rimStyle?: RimStyle;
  onModelLoad?: () => void;
  debugMode?: boolean;
  showSpoiler?: boolean;
  decalUrl?: string;
  onPartSelect?: (partId: string) => void;
};

export function CarModel({
  modelPath = '/models/Car3D.glb',
  bodyColor = '#00ffff',
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
  rimStyle = 'sport',
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

  // Store rim positions for custom rim geometries
  const [rimPositions, setRimPositions] = useState<Array<{ position: [number, number, number]; rotation: [number, number, number] }>>([]);

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

      // Keywords for part detection - used in name matching logic below

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
            const originalName = mesh.name; // Keep original for logging
            const geometry = mesh.geometry;
            const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
            const bbox = geometry.boundingBox;
            
            if (!bbox) { 
              body.push(mesh);
              console.log(`  ${originalName} → BODY (no bbox)`);
              return; 
            }

            const size = new THREE.Vector3();
            bbox.getSize(size);
            const volume = size.x * size.y * size.z;
            const minDim = Math.min(size.x, size.y, size.z);
            const maxDim = Math.max(size.x, size.y, size.z);
            const volumeRatio = volume / maxVolume;
            
            // Get world position for corner detection
            const worldPos = new THREE.Vector3();
            mesh.getWorldPosition(worldPos);

            let category = 'body';
            let reason = 'default';

            // Helper function to check if keyword appears at end or after underscore
            const hasKeywordAtEnd = (str: string, keyword: string): boolean => {
              const endMatch = str.endsWith(keyword) || str.endsWith(`${keyword}_0`) || 
                               str.endsWith(`${keyword}_1`) || str.endsWith(`${keyword}_2`);
              const underscoreMatch = str.includes(`_${keyword}_`) || str.includes(`_${keyword}0`);
              return endMatch || underscoreMatch;
            };

            // PRIORITY 1: Name-based detection (most reliable)
            // IMPORTANT: Check more specific parts FIRST (windows, lights) before generic body parts
            
            // Windows (check FIRST because mesh names might contain both 'door' and 'window')
            if (hasKeywordAtEnd(name, 'window') || hasKeywordAtEnd(name, 'glass') || 
                name.includes('windshield') || name.includes('windscreen')) {
              // BUT exclude mirrors - they should be body color
              if (!name.includes('mirror')) {
                category = 'window';
                reason = 'name-window';
              }
            }
            // Wheels/Rims
            if (category === 'body' && (name.includes('wheel') || name.includes('tire') || name.includes('rim') || 
                     name.includes('tyre') || name.includes('hub'))) {
              category = 'rim';
              reason = 'name-wheel';
            }
            // Headlights (specific check)
            if (category === 'body' && (name.includes('headlight') || name.includes('front_light') || 
                     name.includes('frontlight') || name.includes('head_light'))) {
              category = 'light';
              reason = 'name-headlight';
            }
            // Taillights (specific check)
            if (category === 'body' && (name.includes('taillight') || name.includes('tail_light') || 
                     name.includes('rear_light') || name.includes('rearlight') || 
                     name.includes('brake_light'))) {
              category = 'taillight';
              reason = 'name-taillight';
            }
            // Generic lights (only if small)
            if (category === 'body' && (name.includes('light') || name.includes('lamp') || name.includes('led')) && 
                     volumeRatio < 0.05) {
              category = 'light';
              reason = 'name-light-small';
            }
            // Body parts (check AFTER windows to avoid false matches)
            // Mirrors should be treated as body parts so they can be colored
            if (category === 'body' && (name.includes('body') || name.includes('door') || name.includes('hood') || 
                name.includes('bonnet') || name.includes('trunk') || name.includes('roof') || 
                name.includes('fender') || name.includes('panel') || name.includes('frame') ||
                name.includes('bumper') || name.includes('chassis') || name.includes('mirror'))) {
              category = 'body';
              reason = 'name-body';
            }
            
            // PRIORITY 2: Material-based detection (if name didn't match)
            else if (material && (material instanceof THREE.MeshStandardMaterial)) {
              // Transparent = window
              if (material.transparent && material.opacity < 0.9) {
                category = 'window';
                reason = 'material-transparent';
              }
              // Emissive = light (but only if small)
              else if (material.emissive && material.emissiveIntensity && 
                       material.emissiveIntensity > 0 && volumeRatio < 0.1) {
                category = 'light';
                reason = 'material-emissive';
              }
            }
            
            // PRIORITY 3: Geometry-based detection (if still no match)
            if (category === 'body' && reason === 'default') {
              // Very small parts = lights
              if (volumeRatio < 0.005) {
                category = 'light';
                reason = 'geometry-tiny';
              }
              // Small cylindrical parts at corners = wheels
              else if (volumeRatio < 0.15 && minDim / maxDim > 0.3) {
                const isAtCorner = Math.abs(worldPos.x) > 0.4 || Math.abs(worldPos.z) > 0.4;
                if (isAtCorner) {
                  category = 'rim';
                  reason = 'geometry-corner';
                }
              }
              // Very large parts = definitely body
              else if (volumeRatio > 0.5) {
                category = 'body';
                reason = 'geometry-large';
              }
            }

            // Log each mesh categorization with reason
            console.log(`  ${originalName} → ${category.toUpperCase()} (vol: ${volume.toFixed(4)}, ratio: ${volumeRatio.toFixed(3)}, reason: ${reason})`);

            switch (category) {
              case 'rim': rims.push(mesh); break;
              case 'window': windows.push(mesh); break;
              case 'light': lights.push(mesh); break;
              case 'taillight': taillights.push(mesh); break;
              default: body.push(mesh); break;
            }
          });
        }
      }

      console.log('=== DETECTION SUMMARY ===');
      console.log(`  Body parts: ${body.length}`);
      console.log(`  Rim parts: ${rims.length}`);
      console.log(`  Window parts: ${windows.length}`);
      console.log(`  Headlight parts: ${lights.length}`);
      console.log(`  Taillight parts: ${taillights.length}`);

      setCarParts({ body, rims, windows, lights, taillights });
      
      // Store rim positions for custom geometries
      let positions = rims.map(mesh => ({
        position: [mesh.position.x, mesh.position.y, mesh.position.z] as [number, number, number],
        rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z] as [number, number, number]
      }));
      
      // FALLBACK: If no rims detected, use hardcoded positions for standard car layout
      if (positions.length === 0) {
        console.log('⚠️ No rims detected - using fallback positions');
        positions = [
          { position: [-0.25, 0.08, 0.4], rotation: [0, 0, Math.PI / 2] }, // Front Left
          { position: [0.25, 0.08, 0.4], rotation: [0, 0, Math.PI / 2] }, // Front Right
          { position: [-0.25, 0.08, -0.4], rotation: [0, 0, Math.PI / 2] }, // Rear Left
          { position: [0.25, 0.08, -0.4], rotation: [0, 0, Math.PI / 2] } // Rear Right
        ] as Array<{position: [number, number, number], rotation: [number, number, number]}>;
      }
      
      setRimPositions(positions);
      
      // Hide original rims (custom geometries will replace them)
      rims.forEach(mesh => {
        mesh.visible = false;
      });
      
      onModelLoad?.();
    }
  }, [scene, onModelLoad]);

  // --- 2. Material Application ---
  useEffect(() => {
    const applyOrReset = (meshes: THREE.Mesh[], color: string | undefined, params: any = {}, partName: string = 'unknown') => {
      meshes.forEach(mesh => {
        if (color && mesh.material) {
            const originalMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
            const newMat = originalMat.clone() as THREE.MeshStandardMaterial;
            
            // CRITICAL FIX: Clear texture maps that override colors
            // The model has textures applied, which multiply with the color
            // We need to remove them to see the custom colors
            newMat.map = null; // Clear color/diffuse map
            newMat.emissiveMap = null; // Clear emissive map
            newMat.metalnessMap = null; // Clear metalness map
            newMat.roughnessMap = null; // Clear roughness map
            newMat.aoMap = null; // Clear ambient occlusion map (optional, but can affect brightness)
            
            // Apply the color
            newMat.color = new THREE.Color(color);
            
            // Apply additional params (metalness, roughness, emissive, etc.)
            Object.assign(newMat, params);
            
            // Update the material
            newMat.needsUpdate = true;
            mesh.material = newMat;
            mesh.visible = true; // Force mesh to be visible
            
            console.log(`✓ Applied ${color} to ${mesh.name} (${partName})`);
        } else {
            // Reset to original material (with original textures)
            const orig = originalMaterials.current.get(mesh.uuid);
            if (orig) {
              mesh.material = orig;
              if (color === undefined) {
                console.log(`↺ Reset ${mesh.name} to original material`);
              }
            }
        }
      });
    };

    if (debugMode) {
        carParts.body.forEach(m => (m.material as any).color.set('#ff5e1a'));
        carParts.rims.forEach(m => (m.material as any).color.set('#00ffff'));
        carParts.windows.forEach(m => (m.material as any).color.set('#ffff00'));
        carParts.lights.forEach(m => (m.material as any).color.set('#ff00ff'));
        carParts.taillights.forEach(m => (m.material as any).color.set('#00ff00')); // Green for taillights in debug
    } else {
      console.log('=== APPLYING COLORS ===');
      console.log(`Body color: ${bodyColor || 'none'}`);
      console.log(`Rim color: ${rimColor || 'none'}`);
      console.log(`Window tint: ${windowTint}`);
      console.log(`Headlight color: ${headlightColor || 'none'}`);
      console.log(`Taillight color: ${taillightColor || 'none'}`);
      
      applyOrReset(carParts.body, bodyColor, { metalness, roughness }, 'BODY');
      applyOrReset(carParts.rims, rimColor, { metalness: 0.7, roughness: 0.3 }, 'RIMS'); // Reduced shininess for realistic rims
      
      carParts.windows.forEach(mesh => {
         if (windowTint > 0) {
            const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).clone() as THREE.MeshStandardMaterial;
            
            // Clear texture maps to allow tint to show
            mat.map = null;
            mat.emissiveMap = null;
            mat.metalnessMap = null;
            mat.roughnessMap = null;
            
            mat.transparent = true;
            mat.opacity = 1 - windowTint;
            mat.color = new THREE.Color('#000000');
            mat.metalness = 0.5;
            mat.roughness = 0.2;
            mat.needsUpdate = true;
            mesh.material = mat;
            console.log(`✓ Applied window tint ${windowTint} to ${mesh.name}`);
         } else {
             const orig = originalMaterials.current.get(mesh.uuid);
             if (orig) mesh.material = orig;
         }
      });

      applyOrReset(carParts.lights, headlightColor, { emissive: headlightColor ? new THREE.Color(headlightColor) : undefined, emissiveIntensity: headlightColor ? 0.5 : 0 }, 'HEADLIGHTS');
      applyOrReset(carParts.taillights, taillightColor, { emissive: taillightColor ? new THREE.Color(taillightColor) : undefined, emissiveIntensity: taillightColor ? 0.6 : 0 }, 'TAILLIGHTS');
    }
  }, [carParts, bodyColor, rimColor, windowTint, metalness, roughness, headlightColor, taillightColor, debugMode]);

  // --- 3. Click Handler ---
  const handleGroupClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation(); // Stop click from hitting the floor/background

    if (!onPartSelect) return;

    const clickedMesh = e.object as THREE.Mesh;
    
    console.log('=== MESH CLICK DEBUG ===');
    console.log('Clicked mesh name:', clickedMesh.name);
    console.log('Clicked mesh UUID:', clickedMesh.uuid);

    // Helper function to check if a mesh is in a part array
    // We check by UUID and name to handle both direct and child mesh clicks
    const isMeshInArray = (mesh: THREE.Mesh, array: THREE.Mesh[]): boolean => {
      return array.some(part => 
        part.uuid === mesh.uuid || 
        part.name === mesh.name ||
        // Check if the clicked mesh is a child of any part
        (mesh.parent && array.some(p => p.uuid === mesh.parent?.uuid))
      );
    };

    // Check which part category the clicked mesh belongs to
    // Order matters: check more specific parts first
    if (isMeshInArray(clickedMesh, carParts.rims)) {
      console.log('→ RIMS detected');
      onPartSelect('rims');
    } 
    else if (isMeshInArray(clickedMesh, carParts.windows)) {
      console.log('→ WINDOW detected');
      onPartSelect('windowtint');
    } 
    else if (isMeshInArray(clickedMesh, carParts.lights)) {
      console.log('→ HEADLIGHTS detected');
      onPartSelect('headlights');
    }
    else if (isMeshInArray(clickedMesh, carParts.taillights)) {
      console.log('→ TAILLIGHTS detected');
      onPartSelect('taillights');
    }
    else if (isMeshInArray(clickedMesh, carParts.body)) {
      console.log('→ BODY detected');
      onPartSelect('paint');
    } 
    else {
      // If no match found, default to body/paint
      console.log('→ No match, defaulting to BODY');
      onPartSelect('paint');
    }
  };

  return (
    <group {...props} ref={groupRef} onClick={handleGroupClick}>
        <primitive object={scene} scale={[8, 8, 8]} />
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
        {showSpoiler && <Spoiler style={spoilerStyle} bodyColor={bodyColor} />}
        
        {/* Custom Rim Geometries */}
        {rimPositions.map((rimPos, index) => (
          <RimGeometry
            key={`rim-${index}`}
            style={rimStyle}
            rimColor={rimColor}
            position={rimPos.position}
            rotation={rimPos.rotation}
          />
        ))}
        
        {decalUrl && carParts.body.length > 0 && (
          <CarDecal targetMesh={carParts.body[0]} decalUrl={decalUrl} />
        )}
    </group>
  );
}

function CarDecal({ targetMesh, decalUrl }: { targetMesh: THREE.Mesh; decalUrl: string }) {
  const texture = useTexture(decalUrl);
  return createPortal(
    <Decal 
      position={[0, 0.5, 0.8]} // Positioned on hood
      rotation={[-Math.PI / 2, 0, 0]} // Flat on surface
      scale={[0.8, 1.2, 1]} // Wider scale for better visibility
    >
      <meshPhysicalMaterial 
        transparent 
        map={texture} 
        polygonOffset 
        polygonOffsetFactor={-1}
        opacity={0.9}
        depthWrite={false}
      />
    </Decal>,
    targetMesh
  );
}

function Spoiler({ style = 'wing', bodyColor }: { style?: string; bodyColor?: string }) {
    const color = bodyColor || "#111";
    const metalness = 0.8;
    const roughness = 0.2;
    
    // Wing Spoiler - Classic racing wing with supports
    if (style === 'wing') {
      return (
        <group position={[0, 0.4, -1.4]}>
          {/* Main wing */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.6, 0.05, 0.35]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          {/* Wing supports */}
          <mesh position={[-0.6, 0, 0]}>
            <boxGeometry args={[0.06, 0.3, 0.12]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0.6, 0, 0]}>
            <boxGeometry args={[0.06, 0.3, 0.12]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          {/* Center support */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.05, 0.3, 0.12]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    }
    
    // Ducktail Spoiler - Sleek integrated design
    if (style === 'ducktail') {
      return (
        <group position={[0, 0.32, -1.45]}>
          {/* Main ducktail piece */}
          <mesh position={[0, 0, 0]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[1.4, 0.04, 0.25]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          {/* Lower integrated section */}
          <mesh position={[0, -0.08, -0.08]}>
            <boxGeometry args={[1.4, 0.08, 0.1]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    }
    
    // Lip Spoiler - Subtle trunk lip
    if (style === 'lip') {
      return (
        <group position={[0, 0.28, -1.4]}>
          {/* Main lip */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.5, 0.05, 0.15]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          {/* Lip overhang */}
          <mesh position={[0, 0, -0.06]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[1.5, 0.03, 0.08]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    }
    
    // GT Spoiler - Aggressive GT-style wing
    if (style === 'gt') {
      return (
        <group position={[0, 0.5, -1.4]}>
          {/* Main GT wing - wider and taller */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[1.8, 0.06, 0.4]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          {/* Large GT supports */}
          <mesh position={[-0.7, 0, 0]}>
            <boxGeometry args={[0.08, 0.4, 0.15]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0.7, 0, 0]}>
            <boxGeometry args={[0.08, 0.4, 0.15]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          {/* Endplates */}
          <mesh position={[-0.9, 0.25, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.4, 0.2, 0.02]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0.9, 0.25, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.4, 0.2, 0.02]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>
      );
    }
    
    // Default fallback (wing)
    return (
      <group position={[0, 0.7, -2.1]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[1.6, 0.05, 0.3]} />
          <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
        </mesh>
      </group>
    );
}