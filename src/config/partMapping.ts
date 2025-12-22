import * as THREE from 'three';

/**
 * Manual Part Mapping Configuration
 * 
 * Use this file to manually map mesh names to car parts when automatic detection fails.
 * 
 * HOW TO USE:
 * 1. Enable Debug Mode in AR Studio
 * 2. Check browser console for mesh names
 * 3. Add mesh names to the appropriate arrays below
 * 4. Refresh the page
 */

export interface ManualPartMapping {
  body: string[];  // Mesh names for body parts
  rims: string[];  // Mesh names for wheels/rims
  windows: string[];  // Mesh names for windows
  lights: string[];  // Mesh names for lights
}

/**
 * Manual part mapping for Car3D.glb
 * Update these arrays based on your model's mesh names
 */
export const CAR_3D_MAPPING: ManualPartMapping = {
  body: [
    // Add mesh names that should be body parts
    // Example: 'CarBody', 'Door_Left', 'Hood', 'Roof'
  ],
  rims: [
    // Add mesh names that should be rims/wheels
    // Example: 'Wheel_FL', 'Wheel_FR', 'Wheel_RL', 'Wheel_RR'
  ],
  windows: [
    // Add mesh names that should be windows
    // Example: 'Window_Front', 'Window_Rear', 'Glass_Side'
  ],
  lights: [
    // Add mesh names that should be lights
    // Example: 'Headlight_L', 'Headlight_R', 'Taillight_L', 'Taillight_R'
  ],
};

/**
 * Check if manual mapping is configured
 */
export function hasManualMapping(mapping: ManualPartMapping): boolean {
  return (
    mapping.body.length > 0 ||
    mapping.rims.length > 0 ||
    mapping.windows.length > 0 ||
    mapping.lights.length > 0
  );
}

/**
 * Apply manual mapping to meshes
 */
export function applyManualMapping(
  meshes: THREE.Mesh[],
  mapping: ManualPartMapping
): {
  body: THREE.Mesh[];
  rims: THREE.Mesh[];
  windows: THREE.Mesh[];
  lights: THREE.Mesh[];
} {
  const body: THREE.Mesh[] = [];
  const rims: THREE.Mesh[] = [];
  const windows: THREE.Mesh[] = [];
  const lights: THREE.Mesh[] = [];

  meshes.forEach((mesh) => {
    const name = mesh.name;

    if (mapping.body.includes(name)) {
      body.push(mesh);
      console.log(`✓ ${name} → BODY (manual mapping)`);
    } else if (mapping.rims.includes(name)) {
      rims.push(mesh);
      console.log(`✓ ${name} → RIM (manual mapping)`);
    } else if (mapping.windows.includes(name)) {
      windows.push(mesh);
      console.log(`✓ ${name} → WINDOW (manual mapping)`);
    } else if (mapping.lights.includes(name)) {
      lights.push(mesh);
      console.log(`✓ ${name} → LIGHT (manual mapping)`);
    } else {
      // Default to body if not in manual mapping
      body.push(mesh);
      console.log(`✓ ${name} → BODY (default)`);
    }
  });

  return { body, rims, windows, lights };
}

/**
 * Example: Sports car mapping
 */
export const SPORTS_CAR_MAPPING: ManualPartMapping = {
  body: ['Body', 'Doors', 'Hood', 'Roof', 'Trunk', 'Bumper_Front', 'Bumper_Rear'],
  rims: ['Wheel_FL', 'Wheel_FR', 'Wheel_RL', 'Wheel_RR', 'Tire_FL', 'Tire_FR', 'Tire_RL', 'Tire_RR'],
  windows: ['Windshield', 'Window_FL', 'Window_FR', 'Window_RL', 'Window_RR', 'Window_Rear'],
  lights: ['Headlight_L', 'Headlight_R', 'Taillight_L', 'Taillight_R', 'Brake_Light'],
};

/**
 * Example: SUV mapping
 */
export const SUV_MAPPING: ManualPartMapping = {
  body: ['Chassis', 'Body_Main', 'Doors', 'Hood', 'Roof_Rack'],
  rims: ['Wheel_1', 'Wheel_2', 'Wheel_3', 'Wheel_4'],
  windows: ['Glass_Front', 'Glass_Rear', 'Glass_Side_L', 'Glass_Side_R'],
  lights: ['Light_Front_L', 'Light_Front_R', 'Light_Rear_L', 'Light_Rear_R'],
};
