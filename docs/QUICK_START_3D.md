# Quick Start: 3D Car Models in AR Studio

## 🚗 What You Have Now

Your AR Studio page now supports **full 3D car model customization** with:

- ✅ Real-time color changes (body, rims)
- ✅ Material adjustments (metallic, glossy, matte)
- ✅ Window tinting
- ✅ Underglow lighting effects
- ✅ Headlight color customization
- ✅ Interactive 3D viewer with camera controls

## 🎮 How to Use

### Viewing the 3D Model

1. Navigate to the AR Studio page
2. Click **"3D Model"** button (default view)
3. Use mouse to interact:
   - **Left Click + Drag:** Rotate camera
   - **Right Click + Drag:** Pan camera
   - **Scroll Wheel:** Zoom in/out

### Customizing the Car

#### Change Body Color
1. Click **"Paint"** in the sidebar
2. Select a color from the palette
3. Adjust **Metalness** slider (0% = plastic, 100% = chrome)
4. Adjust **Roughness** slider (0% = glossy, 100% = matte)

#### Change Rim Color
1. Click **"Rims"** in the sidebar
2. Scroll down to "Rim Colors"
3. Select a color from the palette

#### Adjust Window Tint
1. Click **"Window Tint"** in the sidebar
2. Choose tint level:
   - **Light:** Barely visible
   - **Medium:** Moderate tint
   - **Dark:** Heavy tint
   - **Limo:** Maximum darkness

#### Add Underglow
1. Click **"Under Glow"** in the sidebar
2. Select a glow color
3. Adjust **Intensity** slider (0% = off, 100% = maximum)

#### Change Headlight Color
1. Click **"Headlights"** in the sidebar
2. Choose color:
   - **White:** Standard
   - **Yellow:** Classic/vintage
   - **Blue:** Modern/HID style
   - **RGB Glow:** Multicolor effect

## 📁 Adding Your Own Car Models

### Quick Steps

1. **Get a GLB/GLTF model** (see resources below)
2. **Place it in:** `public/models/YourCar.glb`
3. **Update the path** in `src/components/CarModel3D.tsx`:
   ```tsx
   useGLTF.preload('/models/YourCar.glb');
   ```
4. **Or pass as prop** in `src/pages/ARStudio.tsx`:
   ```tsx
   <CarModel3D
     modelPath="/models/YourCar.glb"
     // ... other props
   />
   ```

### Where to Get Models

**Free:**
- [Sketchfab](https://sketchfab.com/3d-models?features=downloadable&sort_by=-likeCount&q=car)
- [Free3D](https://free3d.com/3d-models/car)
- [CGTrader Free](https://www.cgtrader.com/free-3d-models/car)

**Paid:**
- [TurboSquid](https://www.turbosquid.com/Search/3D-Models/car)
- [CGTrader](https://www.cgtrader.com/3d-models/car)

### Convert to GLB (if needed)

If your model is in FBX, OBJ, or other format:

1. **Use Blender (Free):**
   - Download: [blender.org](https://www.blender.org/)
   - Import: `File > Import > [Your Format]`
   - Export: `File > Export > glTF 2.0 (.glb)`

2. **Or use online converter:**
   - [https://products.aspose.app/3d/conversion](https://products.aspose.app/3d/conversion)

## 🔧 Technical Details

### Files Modified/Created

1. **`src/components/CarModel3D.tsx`** (NEW)
   - Main 3D model component
   - Handles rendering, materials, lighting

2. **`src/pages/ARStudio.tsx`** (UPDATED)
   - Added 3D model state management
   - Connected UI controls to 3D model
   - Added toggle between 2D/3D views

### State Variables

```tsx
const [bodyColor, setBodyColor] = useState("#ff5e1a");
const [rimColor, setRimColor] = useState("#333333");
const [windowTint, setWindowTint] = useState(0.3);
const [metalness, setMetalness] = useState(0.8);
const [roughness, setRoughness] = useState(0.2);
const [underglowColor, setUnderglowColor] = useState("#00ff00");
const [underglowIntensity, setUnderglowIntensity] = useState(0);
const [headlightColor, setHeadlightColor] = useState("#ffffff");
```

### How It Works

1. **Model Loading:**
   - Uses `useGLTF` hook from `@react-three/drei`
   - Loads GLB file from `/public/models/`

2. **Part Detection:**
   - Automatically identifies car parts by name
   - Categories: body, rims, windows, lights

3. **Material Application:**
   - Applies colors and properties to detected parts
   - Uses Three.js `MeshStandardMaterial`

4. **Rendering:**
   - React Three Fiber renders the scene
   - OrbitControls for camera interaction
   - Environment for realistic reflections

## 🎨 Customization Examples

### Matte Black Sports Car
```tsx
bodyColor: "#000000"
metalness: 0.2
roughness: 0.9
rimColor: "#ff5e1a"
```

### Chrome Luxury Car
```tsx
bodyColor: "#ffffff"
metalness: 1.0
roughness: 0.0
rimColor: "#333333"
```

### Neon Street Racer
```tsx
bodyColor: "#ff00ff"
metalness: 0.9
roughness: 0.1
underglowColor: "#00ff00"
underglowIntensity: 1.0
headlightColor: "#0080ff"
```

## 🐛 Common Issues

### Model Not Showing
- ✅ Check file is in `public/models/`
- ✅ Verify path starts with `/models/` (not `./models/`)
- ✅ Check browser console for errors

### Model Too Small/Large
- ✅ Adjust `scale` prop in `CarModel3D.tsx`
- ✅ Default is `1.5`, try `2.0` or `3.0`

### Colors Not Changing
- ✅ Check part naming in your 3D model
- ✅ Parts must include keywords like "body", "wheel", "window"
- ✅ See full guide for naming conventions

### Performance Slow
- ✅ Reduce model polygon count (< 100k)
- ✅ Compress textures (< 2048x2048)
- ✅ Use GLB format (not GLTF)

## 📚 Full Documentation

For detailed information, see:
- **[3D Model Guide](./3D_MODEL_GUIDE.md)** - Complete technical documentation
- **[React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)** - Official R3F documentation
- **[Three.js Docs](https://threejs.org/docs/)** - Three.js reference

## 🚀 Next Steps

1. **Test the current model:**
   - Run `npm run dev`
   - Navigate to AR Studio
   - Try all customization options

2. **Add more models:**
   - Download additional car models
   - Place in `public/models/`
   - Create UI to switch between models

3. **Enhance features:**
   - Add decal/sticker overlays
   - Implement part swapping (bumpers, spoilers)
   - Add screenshot/export functionality

---

**Happy Customizing! 🎨🚗**
