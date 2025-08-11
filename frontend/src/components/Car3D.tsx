// // Car3D.tsx
// import { Suspense } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";
// import { Mesh } from "three"; // ✅ Import Mesh type

// function CarModel() {
//   const { scene } = useGLTF("/models/Car3D.glb"); // Adjust path if in /models

//   scene.traverse((child) => {
//     if ((child as Mesh).isMesh) {
//       (child as Mesh).castShadow = true;
//       (child as Mesh).receiveShadow = true;
//     }
//   });

//   return <primitive object={scene} scale={2} position={[0, -1, 0]} />;
// }

// export default function Car3D() {
//   return (
//     <Canvas
//       shadows
//       camera={{ position: [0, 2, 8], fov: 50 }}
//       style={{ width: "100%", height: "100%", background: "#000" }}
//     >
//       {/* Lights */}
//       <ambientLight intensity={0.8} />
//       <directionalLight position={[5, 5, 5]} intensity={2} />
//       <pointLight position={[-5, -5, -5]} intensity={1} />

//       {/* HDRI Environment */}
//       <Environment preset="city" />

//       {/* Model with loader */}
//       <Suspense
//         fallback={
//           <Html center style={{ color: "white" }}>
//             Loading...
//           </Html>
//         }
//       >
//         <CarModel />
//       </Suspense>

//       {/* Orbit Controls with floor restriction */}
//       <OrbitControls
//         enableZoom
//         minDistance={3}
//         maxDistance={15}
//         minPolarAngle={Math.PI / 4}
//         maxPolarAngle={Math.PI / 2}
//       />
//     </Canvas>
//   );
// }

// useGLTF.preload("/models/Car3D.glb"); // Adjust path if needed
