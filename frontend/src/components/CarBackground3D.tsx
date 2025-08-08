// import { useEffect, useRef } from "react";
// import * as THREE from "three";

// const CarBackground3D = () => {
//   const mountRef = useRef<HTMLDivElement>(null);
//   const sceneRef = useRef<THREE.Scene | null>(null);
//   const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
//   const carRef = useRef<THREE.Group | null>(null);

//   useEffect(() => {
//     if (!mountRef.current) return;

//     // Scene setup
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(
//       75,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       1000
//     );
//     const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setClearColor(0x000000, 0); // Transparent background
//     renderer.shadowMap.enabled = true;
//     renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//     mountRef.current.appendChild(renderer.domElement);

//     // Lighting
//     const ambientLight = new THREE.AmbientLight(0xff5e1a, 0.3);
//     scene.add(ambientLight);

//     const directionalLight = new THREE.DirectionalLight(0xff8c1a, 0.8);
//     directionalLight.position.set(10, 10, 5);
//     directionalLight.castShadow = true;
//     scene.add(directionalLight);

//     const pointLight = new THREE.PointLight(0xff5e1a, 0.5);
//     pointLight.position.set(-10, 5, -10);
//     scene.add(pointLight);

//     // Create simplified car geometry
//     const carGroup = new THREE.Group();

//     // Car body
//     const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 8);
//     const bodyMaterial = new THREE.MeshPhongMaterial({
//       color: 0xff5e1a,
//       shininess: 100,
//       transparent: true,
//       opacity: 0.8,
//     });
//     const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
//     body.position.y = 1;
//     body.castShadow = true;
//     carGroup.add(body);

//     // Car roof
//     const roofGeometry = new THREE.BoxGeometry(3, 1, 4);
//     const roofMaterial = new THREE.MeshPhongMaterial({
//       color: 0xff8c1a,
//       shininess: 100,
//       transparent: true,
//       opacity: 0.7,
//     });
//     const roof = new THREE.Mesh(roofGeometry, roofMaterial);
//     roof.position.y = 2.25;
//     roof.position.z = -1;
//     roof.castShadow = true;
//     carGroup.add(roof);

//     // Wheels
//     const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 16);
//     const wheelMaterial = new THREE.MeshPhongMaterial({
//       color: 0x333333,
//       transparent: true,
//       opacity: 0.9,
//     });

//     const wheelPositions = [
//       { x: -1.8, z: 2.5 },
//       { x: 1.8, z: 2.5 },
//       { x: -1.8, z: -2.5 },
//       { x: 1.8, z: -2.5 },
//     ];

//     wheelPositions.forEach((pos) => {
//       const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
//       wheel.rotation.z = Math.PI / 2;
//       wheel.position.set(pos.x, 0.3, pos.z);
//       wheel.castShadow = true;
//       carGroup.add(wheel);
//     });

//     // Add glow effect
//     const glowGeometry = new THREE.BoxGeometry(4.5, 2, 8.5);
//     const glowMaterial = new THREE.MeshBasicMaterial({
//       color: 0xff5e1a,
//       transparent: true,
//       opacity: 0.1,
//       side: THREE.BackSide,
//     });
//     const glow = new THREE.Mesh(glowGeometry, glowMaterial);
//     glow.position.y = 1;
//     carGroup.add(glow);

//     scene.add(carGroup);
//     carRef.current = carGroup;

//     // Position camera
//     camera.position.set(8, 6, 12);
//     camera.lookAt(0, 0, 0);

//     // Store references
//     sceneRef.current = scene;
//     rendererRef.current = renderer;

//     // Animation loop
//     const animate = () => {
//       requestAnimationFrame(animate);

//       if (carRef.current) {
//         carRef.current.rotation.y += 0.005;
//         carRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.2;
//       }

//       renderer.render(scene, camera);
//     };
//     animate();

//     // Handle resize
//     const handleResize = () => {
//       camera.aspect = window.innerWidth / window.innerHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(window.innerWidth, window.innerHeight);
//     };
//     window.addEventListener("resize", handleResize);

//     // Cleanup
//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (mountRef.current && renderer.domElement) {
//         mountRef.current.removeChild(renderer.domElement);
//       }
//       renderer.dispose();
//     };
//   }, []);

//   return (
//     <div
//       ref={mountRef}
//       className="fixed inset-0 pointer-events-none z-0"
//       style={{
//         background: "transparent",
//         mixBlendMode: "normal",
//       }}
//     />
//   );
// };

// export default CarBackground3D;
