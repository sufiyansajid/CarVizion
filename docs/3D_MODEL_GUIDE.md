# 3D Car Model Integration Guide

## Overview
This guide explains how to add, display, and customize 3D car models in the AR Studio page using React Three Fiber and Three.js.

## Table of Contents
1. [How 3D Models Work](#how-3d-models-work)
2. [Adding New Car Models](#adding-new-car-models)
3. [Model File Formats](#model-file-formats)
4. [Customization Features](#customization-features)
5. [Technical Architecture](#technical-architecture)
6. [Troubleshooting](#troubleshooting)

---

## How 3D Models Work

The AR Studio uses **React Three Fiber** (a React renderer for Three.js) to display and manipulate 3D car models in the browser. The implementation consists of:

1. **CarModel3D Component** (`src/components/CarModel3D.tsx`)
   - Loads and renders the 3D model
   - Applies materials, colors, and effects
   - Handles camera controls and lighting

2. **ARStudio Page** (`src/pages/ARStudio.tsx`)
   - Provides UI controls for customization
   - Manages state for colors, materials, and effects
   - Passes props to CarModel3D component

---

## Adding New Car Models

### Step 1: Obtain a 3D Model

You can get 3D car models from:
- **Free Sources:**
  - [Sketchfab](https://sketchfab.com/) - Search for "car" with downloadable filter
  - [Free3D](https://free3d.com/3d-models/car)
  - [TurboSquid Free](https://www.turbosquid.com/Search/3D-Models/free/car)
  - [CGTrader Free](https://www.cgtrader.com/free-3d-models/car)

- **Paid Sources:**
  - [TurboSquid](https://www.turbosquid.com/)
  - [CGTrader](https://www.cgtrader.com/)
  - [Sketchfab Store](https://sketchfab.com/store)

### Step 2: Convert to GLB/GLTF Format

The application supports **GLB** and **GLTF** formats (recommended for web).

**If your model is in a different format (FBX, OBJ, 3DS, etc.):**

1. Use [Blender](https://www.blender.org/) (Free):
   - Import your model: `File > Import > [Your Format]`
   - Export as GLB: `File > Export > glTF 2.0 (.glb/.gltf)`
   - Choose **GLB** format (binary, single file)
   - Enable "Apply Modifiers" and "Include UVs"

2. Or use online converters:
   - [https://products.aspose.app/3d/conversion](https://products.aspose.app/3d/conversion)
   - [https://imagetostl.com/convert/file/gltf/to/glb](https://imagetostl.com/convert/file/gltf/to/glb)

### Step 3: Optimize the Model

Large models can slow down your application. Optimize using:

1. **Blender:**
   - Reduce polygon count: Select model > Modifiers > Add Modifier > Decimate
   - Compress textures: UV Editing > Image > Resize
   - Target: < 5MB file size, < 100k polygons

2. **Online Tools:**
   - [gltf.report](https://gltf.report/) - Analyze and optimize
   - [glTF-Transform](https://gltf-transform.donmccurdy.com/) - CLI optimization

### Step 4: Add to Your Project

1. Place the GLB file in `public/models/` directory:
   ```
   public/
   └── models/
       ├── Car3D.glb          (existing)
       └── SportsCar.glb      (your new model)
   ```

2. Update the model path in `CarModel3D.tsx` or pass it as a prop:
   ```tsx
   <CarModel3D
     modelPath="/models/SportsCar.glb"
     bodyColor={bodyColor}
     // ... other props
   />
   ```

---

## Model File Formats

### Supported Formats
- **GLB** (Binary glTF) - ✅ **Recommended**
  - Single file containing model, textures, and materials
  - Smaller file size
  - Faster loading

- **GLTF** (JSON glTF)
  - Separate files for model, textures, materials
  - Easier to edit
  - Larger total size

### Naming Conventions for Car Parts

For automatic part detection, name your model parts using these keywords:

| Part Type | Keywords in Name |
|-----------|------------------|
| **Body** | body, door, hood, roof, fender, trunk, panel |
| **Rims/Wheels** | wheel, rim, tire, alloy |
| **Windows** | window, glass, windshield, windscreen |
| **Lights** | light, lamp, headlight, taillight, brake |
| **Bumpers** | bumper, grille, fascia |
| **Spoiler** | spoiler, wing |

Example hierarchy in Blender:
```
Car_Model
├── Body_Front
├── Body_Side_Left
├── Body_Side_Right
├── Wheel_Front_Left
├── Wheel_Front_Right
├── Window_Front
├── Headlight_Left
└── Headlight_Right
```

---

## Customization Features

### 1. **Body Color**
- **Control:** Paint tool > Color palette
- **Technical:** Modifies `material.color` of body meshes
- **State:** `bodyColor` (hex color string)

### 2. **Rim Color**
- **Control:** Rims tool > Color palette
- **Technical:** Modifies `material.color` of wheel/rim meshes
- **State:** `rimColor` (hex color string)

### 3. **Material Properties**

#### Metalness (0.0 - 1.0)
- **0.0:** Non-metallic (matte plastic)
- **0.5:** Semi-metallic
- **1.0:** Fully metallic (chrome-like)
- **Control:** Paint/Wraps tool > Metalness slider

#### Roughness (0.0 - 1.0)
- **0.0:** Mirror-smooth (glossy)
- **0.5:** Semi-rough
- **1.0:** Very rough (matte)
- **Control:** Paint/Wraps tool > Roughness slider

### 4. **Window Tint**
- **Control:** Window Tint tool > Tint levels
- **Technical:** Modifies `material.opacity` of window meshes
- **Values:**
  - Light: 0% (fully transparent)
  - Medium: 25%
  - Dark: 50%
  - Limo: 75%

### 5. **Underglow Effect**
- **Control:** Under Glow tool > Color + Intensity
- **Technical:** Point light positioned below car
- **State:** `underglowColor`, `underglowIntensity` (0.0 - 1.0)

### 6. **Headlight Color**
- **Control:** Headlights/Taillights tool > Color options
- **Technical:** Modifies `material.emissive` and `material.color`
- **Options:** White, Yellow, Blue, RGB Glow

---

## Technical Architecture

### Component Structure

```
ARStudio.tsx
├── State Management
│   ├── bodyColor
│   ├── rimColor
│   ├── windowTint
│   ├── metalness
│   ├── roughness
│   ├── underglowColor
│   ├── underglowIntensity
│   └── headlightColor
│
├── UI Controls (Sidebar)
│   ├── Paint Tool
│   ├── Wraps Tool
│   ├── Rims Tool
│   ├── Window Tint Tool
│   ├── Headlights Tool
│   └── Underglow Tool
│
└── CarModel3D Component
    ├── Model Loading (useGLTF)
    ├── Part Detection
    ├── Material Application
    ├── Lighting Setup
    └── Camera Controls
```

### How Part Detection Works

```tsx
// In CarModel3D.tsx
scene.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    const name = child.name.toLowerCase();
    
    if (name.includes('wheel') || name.includes('rim')) {
      rims.push(child);
    } else if (name.includes('window') || name.includes('glass')) {
      windows.push(child);
    }
    // ... etc
  }
});
```

### Material Application

```tsx
// Body color example
carParts.body.forEach((mesh) => {
  const material = mesh.material as THREE.MeshStandardMaterial;
  material.color = new THREE.Color(bodyColor);
  material.metalness = metalness;
  material.roughness = roughness;
  material.needsUpdate = true;
});
```

---

## Troubleshooting

### Model Not Appearing

**Problem:** 3D model doesn't show up

**Solutions:**
1. Check browser console for errors
2. Verify file path is correct: `/models/YourModel.glb`
3. Ensure file is in `public/models/` directory
4. Check file size (should be < 10MB)
5. Try a different model to rule out corruption

### Model Too Small/Large

**Problem:** Model appears tiny or huge

**Solution:** Adjust scale in `CarModel3D.tsx`:
```tsx
<primitive object={scene} scale={2.0} position={[0, -1, 0]} />
//                         ↑ Increase/decrease this value
```

### Model Appears Black

**Problem:** Model is completely black

**Solutions:**
1. Check lighting setup in `CarModel3D.tsx`
2. Verify model has materials (not just geometry)
3. Increase ambient light intensity:
   ```tsx
   <ambientLight intensity={1.0} /> {/* Increase from 0.5 */}
   ```

### Colors Not Changing

**Problem:** Customization doesn't affect the model

**Solutions:**
1. Check part naming in your 3D model
2. Verify part detection in browser console:
   ```tsx
   console.log('Detected parts:', carParts);
   ```
3. Manually assign parts if auto-detection fails

### Performance Issues

**Problem:** Laggy/slow 3D viewer

**Solutions:**
1. Reduce polygon count (< 100k triangons)
2. Compress textures (< 2048x2048)
3. Disable auto-rotation:
   ```tsx
   // Remove or comment out in CarModel3D.tsx
   // useFrame((state, delta) => {
   //   if (groupRef.current) {
   //     groupRef.current.rotation.y += delta * 0.1;
   //   }
   // });
   ```
4. Use lower quality environment preset:
   ```tsx
   <Environment preset="studio" /> {/* Instead of "sunset" */}
   ```

### Model Parts Not Detected

**Problem:** Auto-detection doesn't categorize parts correctly

**Solution:** Manually specify parts in `CarModel3D.tsx`:
```tsx
// Replace auto-detection with manual assignment
useEffect(() => {
  if (scene) {
    const body: THREE.Mesh[] = [];
    const rims: THREE.Mesh[] = [];
    
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Manual assignment based on your model's structure
        if (child.name === 'CarBody_Mesh') {
          body.push(child);
        } else if (child.name === 'Wheel_FL' || child.name === 'Wheel_FR') {
          rims.push(child);
        }
      }
    });
    
    setCarParts({ body, rims, windows: [], lights: [] });
  }
}, [scene]);
```

---

## Advanced: Creating Custom Car Models

### Using Blender

1. **Start with a base:**
   - Download a car model or create from scratch
   - Ensure proper UV unwrapping for textures

2. **Organize hierarchy:**
   ```
   Car_Root
   ├── Body_Group
   │   ├── Body_Front
   │   ├── Body_Rear
   │   └── Doors
   ├── Wheels_Group
   │   ├── Wheel_FL
   │   ├── Wheel_FR
   │   ├── Wheel_RL
   │   └── Wheel_RR
   └── Lights_Group
       ├── Headlight_L
       └── Headlight_R
   ```

3. **Apply materials:**
   - Use Principled BSDF shader
   - Set base color, metallic, roughness values
   - Add textures if needed

4. **Export settings:**
   - Format: glTF 2.0 (.glb)
   - Include: Selected Objects, Custom Properties
   - Transform: +Y Up
   - Geometry: Apply Modifiers, UVs, Normals
   - Compression: Draco (optional, for smaller files)

---

## Resources

### Learning Three.js / React Three Fiber
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Journey](https://threejs-journey.com/)
- [Drei Helpers](https://github.com/pmndrs/drei)

### 3D Model Resources
- [Sketchfab](https://sketchfab.com/)
- [Poly Haven](https://polyhaven.com/) - Free HDRIs for environment
- [glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models)

### Tools
- [Blender](https://www.blender.org/) - Free 3D modeling software
- [gltf.report](https://gltf.report/) - Model analyzer
- [Three.js Editor](https://threejs.org/editor/) - Online 3D editor

---

## Next Steps

1. **Add More Models:** Create a model library with multiple car options
2. **Part Swapping:** Allow users to change bumpers, spoilers, etc.
3. **Texture Uploads:** Let users upload custom decals/wraps
4. **AR Mode:** Integrate with WebXR for true augmented reality
5. **Export/Share:** Save customized models or generate screenshots

---

**Need Help?** Check the browser console for errors and refer to the troubleshooting section above.
