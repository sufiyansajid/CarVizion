import { useRef, useEffect, useState, useMemo } from 'react';
import { useGLTF, Decal, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { createPortal, type ThreeElements, type ThreeEvent } from '@react-three/fiber';
import { CAR_3D_MAPPING, MODEL_MAPPINGS, hasManualMapping, applyManualMapping } from '../config/partMapping';
import { RimGeometry } from './RimGeometry';
import { CAR_MODELS } from '../config/carModels';
import { CoordinateDebugger } from './CoordinateDebugger';

type CarModelProps = ThreeElements['group'] & {
  modelId?: string;
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
  rimStyle?: string;
  onModelLoad?: () => void;
  debugMode?: boolean;
  showSpoiler?: boolean;
  decalUrl?: string;
  onPartSelect?: (partId: string) => void;
};

export function CarModel({
  modelId = 'standard',
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
  // wrapType: _wrapType,
  spoilerStyle = 'wing',
  // spoilerColor: _spoilerColor,
  rimStyle = 'stock',
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
  const [rimPositions, setRimPositions] = useState<Array<{ position: [number, number, number]; rotation: [number, number, number]; scale: number }>>([]);
  
  // Debug state for manual tuning
  const [debugData, setDebugData] = useState<{ position: [number, number, number]; rotation: [number, number, number]; scale: number } | null>(null);

  const originalMaterials = useRef<Map<string, THREE.Material | THREE.Material[]>>(new Map());

  // --- 1. Part Detection Logic ---
  useEffect(() => {
    if (scene) {
      let body: THREE.Mesh[] = [];
      let rims: THREE.Mesh[] = [];
      let windows: THREE.Mesh[] = [];
      let lights: THREE.Mesh[] = [];
      const taillights: THREE.Mesh[] = [];
      const allMeshes: THREE.Mesh[] = [];
      let maxVolume = 0;

      console.log('=== CAR MODEL MESH ANALYSIS ===');
      console.log('Model ID:', modelId);

      // Select mapping based on modelId
      const manualMapping = MODEL_MAPPINGS[modelId] || CAR_3D_MAPPING;
      
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

      // Pass 2: Classification with manual mapping support
      if (hasManualMapping(manualMapping)) {
        console.log('Using manual part mapping for', modelId);
        const mapped = applyManualMapping(allMeshes, manualMapping);
        body = mapped.body;
        rims = mapped.rims;
        windows = mapped.windows;
        lights = mapped.lights;
      } else {

      console.log(`Total meshes found: ${allMeshes.length}`);
      console.log(`Max volume: ${maxVolume.toFixed(4)}`);

      // Keywords for part detection - used in name matching logic below

      // Pass 2: Categorize with improved logic
      // Auto-detection fallback
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
            // REMOVED: hasKeywordAtEnd (unused)

            // PRIORITY 1: Name-based detection (most reliable)
            // IMPORTANT: Check more specific parts FIRST (windows, lights) before generic body parts
            
            // Windows (check FIRST because mesh names might contain both 'door' and 'window')
            // Broader check for windows (handle plurals and variations)
            if ((name.includes('window') || name.includes('glass') || 
                name.includes('windshield') || name.includes('windscreen')) && 
                !name.includes('frame') && !name.includes('trim') && !name.includes('rubber') && !name.includes('seal') &&
                !name.includes('mirror') && !name.includes('pillars')) {
                category = 'window';
                reason = 'name-window';
            }
            // Wheels/Rims
            else if (name.includes('wheel') || name.includes('tire') || name.includes('rim') || 
                     name.includes('tyre') || name.includes('hub') || name.includes('brake') || name.includes('caliper')) {
              category = 'rim';
              reason = 'name-wheel';
            }
            // Headlights (specific check)
            else if (name.includes('headlight') || name.includes('front_light') || 
                     name.includes('frontlight') || name.includes('head_light')) {
              category = 'light';
              reason = 'name-headlight';
            }
            // Taillights (specific check)
            else if (name.includes('taillight') || name.includes('tail_light') || 
                     name.includes('rear_light') || name.includes('rearlight') || 
                     name.includes('brake_light')) {
              category = 'taillight';
              reason = 'name-taillight';
            }
            // Generic lights (only if small and explicit)
            else if ((name.includes('light') || name.includes('lamp') || name.includes('led'))) {
               // If it's a "light" but huge, it might be a "light cover" or body part, so valid size check needed?
               // For now, assume named lights are lights unless they are very big
               if (volumeRatio < 0.1) {
                  category = 'light';
                  reason = 'name-light-small';
               }
            }
            // Body parts (check AFTER windows to avoid false matches)
            // Mirrors should be treated as body parts so they can be colored
            // Added more catch-all terms for sports cars (diffuser, splitter, skirt, vent, cover)
            else if (
                name.includes('body') || name.includes('door') || name.includes('hood') || 
                name.includes('bonnet') || name.includes('trunk') || name.includes('boot') ||
                name.includes('roof') || name.includes('fender') || name.includes('panel') || 
                name.includes('frame') || name.includes('bumper') || name.includes('chassis') || 
                name.includes('mirror') || name.includes('skirt') || name.includes('spoiler') || 
                name.includes('wing') || name.includes('diffuser') || name.includes('splitter') ||
                name.includes('vent') || name.includes('grille') || name.includes('handle') ||
                name.includes('intake') || name.includes('cover') || name.includes('lid') ||
                name.includes('main') // Generic "Main" mesh
            ) {
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
              // LOWERED THRESHOLD: Body parts might be smaller (e.g. hood is maybe 20% of volume)
              else if (volumeRatio > 0.2) {
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
      
      const carConfig = CAR_MODELS.find(c => c.id === modelId);
      
      // MANUAL ONLY: Use pre-calibrated positions for the two remaining cars
      let positions = carConfig?.manualRimPositions?.map(p => ({
        position: p.position,
        rotation: p.rotation || [0, 0, Math.PI / 2],
        scale: p.scale || (carConfig.rimScale || 1.0)
      })) || [];

      // Static fallback if manualRimPositions is not yet defined in carModels.ts
      if (positions.length === 0) {
        if (modelId === 'standard') { // Raptor
            positions = [
                { position: [-1.08, 0.44, 1.85], rotation: [0, 0, Math.PI / 2], scale: 1.15 },
                { position: [1.08, 0.44, 1.85], rotation: [0, 0, Math.PI / 2], scale: 1.15 },
                { position: [-1.08, 0.46, -1.75], rotation: [0, 0, Math.PI / 2], scale: 1.15 },
                { position: [1.08, 0.46, -1.75], rotation: [0, 0, Math.PI / 2], scale: 1.15 }
            ];
        } else if (modelId === 'sport') { // McLaren
            positions = [
                { position: [-0.98, 0.33, 1.38], rotation: [0, 0, Math.PI / 2], scale: 1.05 },
                { position: [0.98, 0.33, 1.38], rotation: [0, 0, Math.PI / 2], scale: 1.05 },
                { position: [-0.98, 0.36, -1.35], rotation: [0, 0, Math.PI / 2], scale: 1.05 },
                { position: [0.98, 0.36, -1.35], rotation: [0, 0, Math.PI / 2], scale: 1.05 }
            ];
        }
      }

      setRimPositions(positions);
      
      // Hide original rims ONLY if we are using custom geometries
      rims.forEach(mesh => {
        mesh.visible = (rimStyle === 'stock');
      });
    }
  }, [scene, onModelLoad, modelId, rimStyle]);

  // --- 2. Material Application ---
  useEffect(() => {
    const applyOrReset = (meshes: THREE.Mesh[], color: string | undefined, params: Record<string, unknown> = {}, partName: string = 'unknown') => {
      meshes.forEach(mesh => {
        if (color && mesh.material) {
            const originalMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
            const newMat = originalMat.clone() as THREE.MeshStandardMaterial;
            
            // Apply the color
            newMat.color = new THREE.Color(color);
            
            // If it's a body part, we might want to keep some textures but reduce their impact
            // to avoid the "washed out" look on flat colors
            if (partName === 'BODY') {
                newMat.roughness = roughness ?? 0.4;
                newMat.metalness = metalness ?? 0.3;
                // If a map exists, it might be a bake - keeping it but darkening color helps?
                // Actually, if they want CUSTOM color, map often blocks it.
                if (newMat.map) newMat.map = null; 
            } else {
                Object.assign(newMat, params);
            }
            
            newMat.needsUpdate = true;
            mesh.material = newMat;
            mesh.visible = true;
            
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
        carParts.body.forEach(m => (m.material as THREE.MeshStandardMaterial).color.set('#ff5e1a'));
        carParts.rims.forEach(m => (m.material as THREE.MeshStandardMaterial).color.set('#00ffff'));
        carParts.windows.forEach(m => (m.material as THREE.MeshStandardMaterial).color.set('#ffff00'));
        carParts.lights.forEach(m => (m.material as THREE.MeshStandardMaterial).color.set('#ff00ff'));
        carParts.taillights.forEach(m => (m.material as THREE.MeshStandardMaterial).color.set('#00ff00')); // Green for taillights in debug
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
  }, [carParts, bodyColor, rimColor, windowTint, metalness, roughness, headlightColor, taillightColor, debugMode, modelId]);

  // --- Keyboard Controls for Manual Calibration ---
  useEffect(() => {
    if (!debugMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      setDebugData(prev => {
        // Initialize if null
        const current = prev || { 
            position: rimPositions[0]?.position || [-1, 0.3, 1.3], 
            rotation: rimPositions[0]?.rotation || [0,0,0], 
            scale: rimPositions[0]?.scale || 1 
        };
        
        const step = e.shiftKey ? 0.05 : 0.01;
        const scaleStep = 0.05;

        // Scale: +/- or Numpad +/-
        if (e.key === '+' || e.key === '=' || e.key === 'NumpadAdd') {
            return { ...current, scale: current.scale + scaleStep };
        }
        if (e.key === '-' || e.key === '_' || e.key === 'NumpadSubtract') {
            return { ...current, scale: Math.max(0.01, current.scale - scaleStep) };
        }

        // Position: Arrow Keys
        const newPos: [number, number, number] = [...current.position];
        if (e.key === 'ArrowUp') {
            if (e.ctrlKey) newPos[1] += step; // Y Axis (Up)
            else newPos[2] -= step;           // Z Axis (Forward)
        }
        if (e.key === 'ArrowDown') {
            if (e.ctrlKey) newPos[1] -= step; // Y Axis (Down)
            else newPos[2] += step;           // Z Axis (Back)
        }
        if (e.key === 'ArrowLeft') newPos[0] -= step; // X Axis (Left)
        if (e.key === 'ArrowRight') newPos[0] += step; // X Axis (Right)

        return { ...current, position: newPos };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode, rimPositions]);

  // --- Calculate Spoiler Position ---
  const spoilerPosition = useMemo(() => {
    // 0. Use manual override if provided in config
    const carConfig = CAR_MODELS.find(c => c.id === modelId);
    if (carConfig?.spoilerOffset) return carConfig.spoilerOffset;

    if (carParts.body.length === 0) return [0, 0.4, -1.4] as [number, number, number];

    const box = new THREE.Box3();
    carParts.body.forEach(mesh => {
        mesh.updateMatrixWorld(true);
        const meshBox = new THREE.Box3().setFromObject(mesh);
        // Approximation without the inner group mat
        box.union(meshBox);
    });

    if (box.isEmpty()) return [0, 0.4, -1.4] as [number, number, number];
    
    // Standard rear-centered placement
    return [0, 0.5, -1.6] as [number, number, number];
  }, [carParts.body, modelId]);


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
        {/* Scale CAR up to Meters (approx 8x) */}
        <group scale={[8, 8, 8]}>
            <primitive object={scene} />
            
            {showSpoiler && <Spoiler style={spoilerStyle} bodyColor={bodyColor} position={spoilerPosition} />}
            
            {/* Custom Rim Geometries - Scaled DOWN to fit */}
            {rimStyle !== 'stock' && rimPositions.map((rimPos, index) => {
              // Use debug data for the first wheel (Front Left) if available
              const isFL = index === 0;
              // Default scale factor for big rims: 0.14
              const baseScale = rimPos.scale; 
              
              const finalPos = (debugData && isFL) ? debugData.position : rimPos.position;
              const finalScale = (debugData && isFL) ? debugData.scale : baseScale;
              
              return (
                <group key={`rim-grp-${index}`}>
                    <RimGeometry
                      style={rimStyle}
                      rimColor={rimColor}
                      position={finalPos}
                      rotation={rimPos.rotation}
                      scale={finalScale}
                    />
                    {/* ALWAYS SHOW DEBUGGER FOR NOW */}
                    {isFL && (
                      <CoordinateDebugger 
                        label="Front Left Hub"
                        initialData={{ position: rimPos.position, rotation: rimPos.rotation, scale: baseScale }}
                        onUpdate={setDebugData}
                      />
                    )}
                </group>
              );
            })}
            
            {decalUrl && carParts.body.length > 0 && (
              <CarDecal targetMesh={carParts.body[0]} decalUrl={decalUrl} />
            )}
        </group>

        {underglowIntensity > 0 && underglowColor && (
             <spotLight
                position={[0, 0.2, 0]}
                angle={Math.PI / 2}
                penumbra={0.5}
                color={underglowColor}
                intensity={underglowIntensity * 2} // Reduced intensity
                distance={10}
                castShadow
             />
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

// Updated component signature
function Spoiler({ style = 'wing', bodyColor, position }: { style?: string; bodyColor?: string; position?: [number, number, number] }) {
    const color = bodyColor || "#111";
    const metalness = 0.8;
    const roughness = 0.2;
    // Default position if not provided
    const pos = position || [0, 0.4, -1.4];
    
    // Wing Spoiler - Classic racing wing with supports
    if (style === 'wing') {
      return (
        <group position={pos}>
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
        <group position={[pos[0], pos[1] - 0.08, pos[2] - 0.05]}>
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
        <group position={[pos[0], pos[1] - 0.12, pos[2]]}>
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
        <group position={[pos[0], pos[1] + 0.1, pos[2]]}>
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