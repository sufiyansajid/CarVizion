# 3D Car Model Architecture

## System Overview

```mermaid
graph TB
    subgraph "User Interface"
        A[AR Studio Page]
        B[Sidebar Controls]
        C[3D Viewport]
    end
    
    subgraph "State Management"
        D[bodyColor]
        E[rimColor]
        F[windowTint]
        G[metalness/roughness]
        H[underglowColor/Intensity]
        I[headlightColor]
    end
    
    subgraph "3D Rendering"
        J[CarModel3D Component]
        K[React Three Fiber Canvas]
        L[Three.js Scene]
        M[GLB Model Loader]
    end
    
    subgraph "Model Processing"
        N[Part Detection]
        O[Material Application]
        P[Lighting Setup]
    end
    
    A --> B
    A --> C
    B --> D
    B --> E
    B --> F
    B --> G
    B --> H
    B --> I
    
    D --> J
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    
    J --> K
    K --> L
    L --> M
    M --> N
    N --> O
    O --> P
    P --> C
```

## Component Flow

```mermaid
sequenceDiagram
    participant User
    participant ARStudio
    participant CarModel3D
    participant ThreeJS
    participant GLBFile
    
    User->>ARStudio: Opens AR Studio
    ARStudio->>CarModel3D: Renders with default props
    CarModel3D->>GLBFile: Load /models/Car3D.glb
    GLBFile-->>CarModel3D: Returns 3D scene
    CarModel3D->>ThreeJS: Parse scene
    ThreeJS->>CarModel3D: Identify parts (body, rims, etc.)
    CarModel3D->>ThreeJS: Apply default materials
    ThreeJS-->>User: Display 3D model
    
    User->>ARStudio: Clicks "Paint" tool
    User->>ARStudio: Selects red color
    ARStudio->>CarModel3D: Update bodyColor="#ff0000"
    CarModel3D->>ThreeJS: Apply new color to body parts
    ThreeJS-->>User: Show updated model
```

## Data Flow

```mermaid
flowchart LR
    A[User Interaction] --> B{Which Tool?}
    
    B -->|Paint| C[setBodyColor]
    B -->|Rims| D[setRimColor]
    B -->|Window Tint| E[setWindowTint]
    B -->|Underglow| F[setUnderglowColor/Intensity]
    B -->|Headlights| G[setHeadlightColor]
    
    C --> H[CarModel3D Props]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[useEffect Hook]
    I --> J[Apply to Mesh Materials]
    J --> K[material.needsUpdate = true]
    K --> L[Re-render Scene]
    L --> M[User Sees Change]
```

## Part Detection Logic

```mermaid
flowchart TD
    A[Load GLB Model] --> B[scene.traverse]
    B --> C{Is Mesh?}
    C -->|No| B
    C -->|Yes| D[Get mesh.name.toLowerCase]
    
    D --> E{Contains Keywords?}
    
    E -->|wheel, rim, tire| F[Add to rims array]
    E -->|window, glass, windshield| G[Add to windows array]
    E -->|light, lamp, headlight| H[Add to lights array]
    E -->|body, door, hood, roof| I[Add to body array]
    E -->|No match| I
    
    F --> J[setCarParts]
    G --> J
    H --> J
    I --> J
    
    J --> K[Apply Materials]
```

## Material Application Process

```mermaid
flowchart LR
    A[Color Change Event] --> B[Update State]
    B --> C[useEffect Triggered]
    C --> D[Loop Through Parts]
    
    D --> E{Part Type?}
    
    E -->|Body| F[Apply bodyColor]
    E -->|Rims| G[Apply rimColor]
    E -->|Windows| H[Apply tint opacity]
    E -->|Lights| I[Apply emissive color]
    
    F --> J[Set material.color]
    G --> J
    H --> K[Set material.opacity]
    I --> L[Set material.emissive]
    
    J --> M[material.needsUpdate = true]
    K --> M
    L --> M
    
    M --> N[Three.js Re-renders]
```

## File Structure

```
CarVizion/
├── public/
│   └── models/
│       └── Car3D.glb          # 3D car model file
│
├── src/
│   ├── components/
│   │   └── CarModel3D.tsx     # 3D model component
│   │
│   └── pages/
│       └── ARStudio.tsx       # Main AR Studio page
│
└── docs/
    ├── 3D_MODEL_GUIDE.md      # Comprehensive guide
    ├── QUICK_START_3D.md      # Quick reference
    └── ARCHITECTURE.md        # This file
```

## Technology Stack

```mermaid
graph TB
    A[React 19] --> B[React Three Fiber]
    B --> C[Three.js]
    C --> D[WebGL]
    
    E[@react-three/drei] --> B
    F[GLB/GLTF Models] --> C
    
    G[TypeScript] --> A
    H[Tailwind CSS] --> A
```

## Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 19.1.0 |
| **React Three Fiber** | React renderer for Three.js | 9.3.0 |
| **Three.js** | 3D graphics library | 0.179.1 |
| **@react-three/drei** | Helper components for R3F | 10.6.1 |
| **TypeScript** | Type safety | 5.8.3 |

## Performance Considerations

```mermaid
flowchart TD
    A[Model File] --> B{Size Check}
    B -->|> 10MB| C[⚠️ Too Large]
    B -->|< 10MB| D[✅ Good]
    
    D --> E{Polygon Count}
    E -->|> 100k| F[⚠️ Too Many]
    E -->|< 100k| G[✅ Good]
    
    G --> H{Texture Size}
    H -->|> 2048x2048| I[⚠️ Too Large]
    H -->|< 2048x2048| J[✅ Optimized]
    
    C --> K[Optimize with Blender/glTF-Transform]
    F --> K
    I --> K
    
    K --> D
```

## Optimization Strategies

1. **Model Optimization:**
   - Use Draco compression for GLB files
   - Reduce polygon count with Decimate modifier
   - Merge duplicate vertices
   - Remove hidden geometry

2. **Texture Optimization:**
   - Compress textures (JPEG for color, PNG for alpha)
   - Use power-of-2 dimensions (512, 1024, 2048)
   - Share textures between similar parts

3. **Runtime Optimization:**
   - Preload models with `useGLTF.preload()`
   - Use `useMemo` for expensive calculations
   - Implement level-of-detail (LOD) for complex models
   - Disable shadows if not needed

## Future Enhancements

```mermaid
mindmap
  root((3D Car Studio))
    Model Library
      Multiple car models
      Category filters
      Search functionality
    Part Swapping
      Bumpers
      Spoilers
      Hoods
      Side skirts
    Texture System
      Custom decals
      Wrap patterns
      Logo uploads
    AR Integration
      WebXR support
      Real-world placement
      Mobile AR
    Export Features
      Screenshot capture
      Video recording
      3D model export
      Share to social media
```

## API Integration Points

```mermaid
sequenceDiagram
    participant User
    participant ARStudio
    participant Backend
    participant Database
    
    User->>ARStudio: Customize car
    User->>ARStudio: Click "Save Design"
    ARStudio->>Backend: POST /api/designs
    Note over ARStudio,Backend: {<br/>  name: "My Design",<br/>  model_data: {...},<br/>  color_data: {...}<br/>}
    Backend->>Database: Save design
    Database-->>Backend: Design ID
    Backend-->>ARStudio: Success response
    ARStudio-->>User: "Design saved!"
```

## State Management Pattern

```typescript
// ARStudio.tsx
const [bodyColor, setBodyColor] = useState("#ff5e1a");

// User clicks color
<button onClick={() => setBodyColor("#ff0000")} />

// Props passed to 3D component
<CarModel3D bodyColor={bodyColor} />

// CarModel3D.tsx
useEffect(() => {
  carParts.body.forEach((mesh) => {
    mesh.material.color = new THREE.Color(bodyColor);
    mesh.material.needsUpdate = true;
  });
}, [carParts, bodyColor]);
```

## Error Handling

```mermaid
flowchart TD
    A[Load Model] --> B{Success?}
    B -->|Yes| C[Parse Scene]
    B -->|No| D[Show Error Toast]
    
    C --> E{Parts Found?}
    E -->|Yes| F[Apply Materials]
    E -->|No| G[Use Default Material]
    
    F --> H{Material Valid?}
    H -->|Yes| I[Render Model]
    H -->|No| J[Fallback to Basic Material]
    
    D --> K[Log to Console]
    G --> K
    J --> K
```

---

## Quick Reference

### Adding a New Customization Option

1. **Add state in ARStudio.tsx:**
   ```tsx
   const [spoilerColor, setSpoilerColor] = useState("#000000");
   ```

2. **Add UI control:**
   ```tsx
   <Button onClick={() => setSpoilerColor("#ff0000")}>
     Red Spoiler
   </Button>
   ```

3. **Pass to CarModel3D:**
   ```tsx
   <CarModel3D spoilerColor={spoilerColor} />
   ```

4. **Apply in CarModel3D:**
   ```tsx
   useEffect(() => {
     carParts.spoiler.forEach((mesh) => {
       mesh.material.color = new THREE.Color(spoilerColor);
     });
   }, [spoilerColor]);
   ```

### Debugging Tips

1. **Check model loaded:**
   ```tsx
   console.log('Scene:', scene);
   ```

2. **Verify parts detected:**
   ```tsx
   console.log('Car parts:', carParts);
   ```

3. **Inspect materials:**
   ```tsx
   scene.traverse((child) => {
     if (child instanceof THREE.Mesh) {
       console.log(child.name, child.material);
     }
   });
   ```

---

**For more details, see:**
- [3D Model Guide](./3D_MODEL_GUIDE.md)
- [Quick Start](./QUICK_START_3D.md)
