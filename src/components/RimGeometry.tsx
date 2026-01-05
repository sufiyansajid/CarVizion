/**
 * Procedural Rim Geometry Generator
 * Creates different rim styles programmatically
 */

export type RimStyle = 'sport' | 'classic' | 'mesh' | 'deepdish' | 'stock';

interface RimGeometryProps {
  style: RimStyle;
  rimColor?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export function RimGeometry({ style, rimColor = '#888888', position, rotation = [0, 0, 0] }: RimGeometryProps) {
  const color = rimColor;
  
  // Sport Rim - 5-spoke design
  if (style === 'sport') {
    return (
      <group position={position} rotation={rotation}>
        {/* Main rim disc */}
        <mesh>
          <cylinderGeometry args={[0.35, 0.35, 0.12, 32]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* 5 spokes */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * Math.PI * 2) / 5;
          return (
            <mesh 
              key={i}
              position={[Math.sin(angle) * 0.15, 0, Math.cos(angle) * 0.15]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[0.08, 0.12, 0.3]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
          );
        })}
        
        {/* Center cap */}
        <mesh position={[0, 0.061, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.002, 16]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    );
  }
  
  // Classic Rim - Traditional spoke pattern
  if (style === 'classic') {
    return (
      <group position={position} rotation={rotation}>
        {/* Main rim disc */}
        <mesh>
          <cylinderGeometry args={[0.35, 0.35, 0.12, 32]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* 8 thin spokes */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i * Math.PI * 2) / 8;
          return (
            <mesh 
              key={i}
              position={[Math.sin(angle) * 0.15, 0, Math.cos(angle) * 0.15]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[0.04, 0.12, 0.3]} />
              <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
            </mesh>
          );
        })}
        
        {/* Center cap */}
        <mesh position={[0, 0.061, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.002, 16]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    );
  }
  
  // Mesh Rim - Grid pattern
  if (style === 'mesh') {
    return (
      <group position={position} rotation={rotation}>
        {/* Main rim disc */}
        <mesh>
          <cylinderGeometry args={[0.35, 0.35, 0.12, 32]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Circular mesh pattern */}
        {[0, 1, 2].map((ring) => {
          const radius = 0.1 + ring * 0.08;
          const count = 8 + ring * 4;
          return [...Array(count)].map((_, i) => {
            const angle = (i * Math.PI * 2) / count;
            return (
              <mesh 
                key={`${ring}-${i}`}
                position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
                rotation={[0, angle, 0]}
              >
                <boxGeometry args={[0.02, 0.12, 0.05]} />
                <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
              </mesh>
            );
          });
        })}
        
        {/* Center cap */}
        <mesh position={[0, 0.061, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.002, 16]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  }
  
  // Deep Dish Rim - Deep concave design
  if (style === 'deepdish') {
    return (
      <group position={position} rotation={rotation}>
        {/* Outer rim lip */}
        <mesh>
          <cylinderGeometry args={[0.38, 0.35, 0.08, 32]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Inner dish - recessed */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.25, 0.28, 0.02, 32]} />
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} />
        </mesh>
        
        {/* 6 deep spokes */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * Math.PI * 2) / 6;
          return (
            <mesh 
              key={i}
              position={[Math.sin(angle) * 0.12, -0.03, Math.cos(angle) * 0.12]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[0.1, 0.06, 0.24]} />
              <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} />
            </mesh>
          );
        })}
        
        {/* Center cap - chrome */}
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.005, 16]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>
    );
  }
  
  // Stock Rim - Simple default design
  if (style === 'stock') {
    return (
      <group position={position} rotation={rotation}>
        {/* Main rim disc */}
        <mesh>
          <cylinderGeometry args={[0.33, 0.33, 0.12, 24]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Simple 4-spoke cross pattern */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI * 2) / 4;
          return (
            <mesh 
              key={i}
              position={[Math.sin(angle) * 0.12, 0, Math.cos(angle) * 0.12]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[0.1, 0.12, 0.24]} />
              <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
            </mesh>
          );
        })}
        
        {/* Center cap */}
        <mesh position={[0, 0.061, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.002, 16]} />
          <meshStandardMaterial color="#444" metalness={0.4} roughness={0.6} />
        </mesh>
      </group>
    );
  }
  
  // Default fallback
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[0.33, 0.33, 0.12, 24]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}
