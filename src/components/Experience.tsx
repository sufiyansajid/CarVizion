
import { Environment, OrbitControls, Stage } from '@react-three/drei';

export function Experience({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Stage intensity={0.5} environment="city" adjustCamera={1.5}>
        {children}
      </Stage>
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.9} />
      <Environment preset="city" />
    </>
  );
}
