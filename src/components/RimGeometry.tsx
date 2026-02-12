import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense, useEffect, useMemo, useLayoutEffect, useState } from 'react';

/**
 * Procedural & External Rim Geometry Generator
 * Can load external GLB models or fallback to procedural styles
 */

export type RimStyle = 'sport' | 'classic' | 'mesh' | 'deepdish' | 'stock' | string;

interface RimAsset {
  path: string;
  rotationOffset?: [number, number, number];
  scaleMultiplier?: number;
  positionOffset?: [number, number, number];
}

const RIM_ASSET_PATHS: Record<string, RimAsset> = {
  'concept': { 
    path: '/models/rims/concept_car_rim.glb',
    rotationOffset: [0, Math.PI / 2, 0], 
    scaleMultiplier: 0.065 // Middle ground: Bigger than 0.015, smaller than 0.12
  },
  'sport_v2': { 
    path: '/models/rims/rim.glb',
    rotationOffset: [0, Math.PI / 2, 0],
    scaleMultiplier: 0.065
  },
  'test_rim_1': { 
    path: '/models/rims/morello_cerchi_-_rims_-_murgese_v.glb',
    rotationOffset: [0, Math.PI / 2, 0], 
    scaleMultiplier: 1.0 // Auto-scaler will handle this
  },
  'test_rim_2': { 
    path: '/models/rims/weed_car_rims.glb',
    rotationOffset: [0, Math.PI / 2, 0], 
    scaleMultiplier: 1.0 
  },
  'test_rim_3': { 
    path: '/models/rims/free_wheels_-_magnesium_rims_-_sdc.glb',
    rotationOffset: [0, Math.PI / 2, 0], 
    scaleMultiplier: 1.0 
  },
};

interface RimGeometryProps {
  style: string;
  rimColor?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number; 
}

export function RimGeometry(props: RimGeometryProps) {
  const asset = RIM_ASSET_PATHS[props.style];
  
  if (asset) {
    return (
      <Suspense fallback={null}>
        <ExternalRim asset={asset} {...props} />
      </Suspense>
    );
  }

  return <ProceduralRim {...props} />;
}

interface ExternalRimProps extends RimGeometryProps {
  asset: RimAsset;
}

function ExternalRim({ asset, rimColor = '#888888', position, rotation = [0, 0, 0], scale = 0.2 }: ExternalRimProps) {
  const { scene } = useGLTF(asset.path);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const [autoScale, setAutoScale] = useState(1);

  // Auto-Scaling Logic: Normalize any rim to approx 0.62m diameter (standard-ish)
  useLayoutEffect(() => {
    if (!clonedScene) return;

    // 1. Center the geometry first so scaling happens from center
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    // Shift opposite to center to put pivot at local 0,0,0
    clonedScene.position.sub(center);

    // 2. Measure size after centering
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // 3. TARGET DIAMETER: ~0.62 meters (approx 24-25 inches with tire)
    // If the rim model includes tire, 0.65 is good. If just metal rim, maybe 0.5.
    // Let's aim for 0.62 as a safe average.
    const TARGET_DIAMETER = 0.62;

    if (maxDim > 0) {
        const scaleFactor = TARGET_DIAMETER / maxDim;
        setAutoScale(scaleFactor);
        console.log(`[Auto-Scale] Rim: ${asset.path}`);
        console.log(`Original Size: ${maxDim.toFixed(4)}`);
        console.log(`Applied Scale: ${scaleFactor.toFixed(6)}`);
    }

  }, [clonedScene, asset.path]);

  // Apply materials
  useLayoutEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Preserve original material details if possible, but override color
        const originalMat = mesh.material as THREE.MeshStandardMaterial;
        const newMat = originalMat.clone();
        
        if (rimColor) newMat.color = new THREE.Color(rimColor);
        // metalness and roughness are not passed directly to ExternalRimProps in the current setup,
        // but if they were, they would be applied here.
        // if (metalness !== undefined) newMat.metalness = metalness;
        // if (roughness !== undefined) newMat.roughness = roughness;
        
        mesh.material = newMat;
      }
    });
  }, [clonedScene, rimColor]);

  // COMBINED TRANSFORM LOGIC
  const finalRotation: [number, number, number] = [
    rotation[0] + (asset.rotationOffset?.[0] || 0),
    rotation[1] + (asset.rotationOffset?.[1] || 0),
    rotation[2] + (asset.rotationOffset?.[2] || 0)
  ];

  // The scale passed from CarModel is the target diameter.
  // We multiply by our model-specific multiplier to normalize to 1 unit.
  const finalScale = scale * (asset.scaleMultiplier || 1);

  return (
    <group 
      position={[
        position[0] + (asset.positionOffset?.[0] || 0),
        position[1] + (asset.positionOffset?.[1] || 0),
        position[2] + (asset.positionOffset?.[2] || 0)
      ]} 
      rotation={finalRotation} 
      scale={finalScale}
    >
      <Clone object={scene} />
    </group>
  );
}

// Procedural styles normalized to 0.5 radius (1.0 diameter)
function ProceduralRim({ style, rimColor = '#888888', position, rotation = [0, 0, 0], scale = 0.5 }: RimGeometryProps) {
  const color = rimColor;
  
  const rimMaterialProps = {
    color: color,
    metalness: 0.9,
    roughness: 0.1,
    envMapIntensity: 1.5,
  };

  if (style === 'sport') {
    return (
      <group position={position} rotation={rotation} scale={scale}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.5, 0.5, 0.15, 48]} />
          <meshStandardMaterial {...rimMaterialProps} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * Math.PI * 2) / 5;
          return (
            <mesh key={i} position={[0, Math.sin(angle) * 0.25, Math.cos(angle) * 0.25]} rotation={[angle, 0, 0]}>
              <boxGeometry args={[0.12, 0.1, 0.45]} />
              <meshStandardMaterial {...rimMaterialProps} />
            </mesh>
          );
        })}
      </group>
    );
  }
  
  if (style === 'classic') {
    return (
      <group position={position} rotation={rotation} scale={scale}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.48, 0.48, 0.15, 48]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
        </mesh>
        {[...Array(12)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          return (
            <mesh key={i} position={[0, Math.sin(angle) * 0.2, Math.cos(angle) * 0.2]} rotation={[angle, 0, 0]}>
              <boxGeometry args={[0.12, 0.04, 0.42]} />
              <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
            </mesh>
          );
        })}
      </group>
    );
  }
  
  if (style === 'mesh') {
    return (
      <group position={position} rotation={rotation} scale={scale}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.5, 0.5, 0.15, 64]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
        {[0, 1, 2].map((ring) => {
          const radius = 0.15 + ring * 0.12;
          const count = 12 + ring * 6;
          return [...Array(count)].map((_, i) => {
            const angle = (i * Math.PI * 2) / count;
            return (
              <mesh key={`${ring}-${i}`} position={[0, Math.sin(angle) * radius, Math.cos(angle) * radius]} rotation={[angle, 0, 0]}>
                <boxGeometry args={[0.12, 0.02, 0.1]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
              </mesh>
            );
          });
        })}
      </group>
    );
  }
  
  if (style === 'deepdish') {
    return (
      <group position={position} rotation={rotation} scale={scale}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.52, 0.5, 0.18, 48]} />
          <meshStandardMaterial color="#fff" metalness={1} roughness={0.05} />
        </mesh>
        <mesh position={[-0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * Math.PI * 2) / 6;
          return (
            <mesh key={i} position={[-0.02, Math.sin(angle) * 0.2, Math.cos(angle) * 0.2]} rotation={[angle, 0.2, 0]}>
              <boxGeometry args={[0.05, 0.15, 0.35]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
          );
        })}
      </group>
    );
  }
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.48, 0.48, 0.15, 32]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}
