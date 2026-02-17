import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Paintbrush, Eraser, Download, Wand2, ScanLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InteractiveSegmenter, FilesetResolver } from "@mediapipe/tasks-vision";

interface TwoDStudioProps {
  selectedTool: string;
  toolValue: string;
  onToolValueChange?: (value: string) => void;
  toolName?: string;
}

const TwoDStudio: React.FC<TwoDStudioProps> = ({ selectedTool: _selectedTool, toolValue }) => {
  // FIX: Default to "paint" so the toolbar is always visible, even if no tool selected in parent
  const effectiveTool = _selectedTool || "paint";

  const [image, setImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  const [selectionMode, setSelectionMode] = useState<"magic" | "brush">("magic");
  const [brushSize, setBrushSize] = useState(15);
  const [tolerance, setTolerance] = useState(32);
  const [blendMode, setBlendMode] = useState<"overlay" | "color" | "multiply">("color");
  const [smartEdges, setSmartEdges] = useState(true);
  
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskStorageRef = useRef<HTMLCanvasElement | null>(null); // Offscreen canvas for mask data
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Responsive max canvas size
  const getMaxCanvasDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      return { maxWidth: Math.floor(rect.width - 32), maxHeight: Math.floor(rect.height - 32) };
    }
    return { maxWidth: 800, maxHeight: 600 };
  }, []);
  
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  
  // AI State
  const [segmenter, setSegmenter] = useState<InteractiveSegmenter | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isSegmenting, setIsSegmenting] = useState(false);

  // Initialize offscreen mask storage
  useEffect(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      const storage = document.createElement('canvas');
      storage.width = canvasSize.width;
      storage.height = canvasSize.height;
      maskStorageRef.current = storage;
    }
  }, [canvasSize]);

  // Load MediaPipe Model
  useEffect(() => {
    const loadModel = async () => {
      setIsModelLoading(true);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm" // Match installed version
        );
        const segmenter = await InteractiveSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/interactive_segmenter/magic_touch/float32/1/magic_touch.tflite",
            delegate: "GPU",
          },
          outputCategoryMask: true,
          outputConfidenceMasks: false, 
        });
        setSegmenter(segmenter);
        toast.success("AI Model Ready");
      } catch (error) {
        console.error("Failed to load model:", error);
        toast.error("Failed to load AI model. Smart selection disabled.");
      } finally {
        setIsModelLoading(false);
      }
    };
    loadModel();
  }, []);


  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h, s, l];
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // Local Pro-Customizer Engine
  const applyLocalCustomization = useCallback((type: "color" | "decal", value?: string) => {
    const imageCanvas = imageCanvasRef.current;
    const maskStorage = maskStorageRef.current; // Use storage instead of visible canvas
    
    if (!imageCanvas || !maskStorage || !originalImageData) {
      return;
    }

    const maskCtx = maskStorage.getContext('2d');
    if (!maskCtx) return;
    const maskData = maskCtx.getImageData(0, 0, canvasSize.width, canvasSize.height);
    
    let hasMask = false;
    for (let i = 3; i < maskData.data.length; i += 4) {
      if (maskData.data[i] > 0) { hasMask = true; break; }
    }
    
    if (!hasMask) { 
      // toast.error("Select an area first."); 
      return; 
    }

    const ctx = imageCanvas.getContext('2d');
    if (!ctx) return;

    if (type === "color") {
      const color = typeof toolValue === 'string' && toolValue.startsWith('#') ? toolValue : '#ff5e1a';
      const rgb = hexToRgb(color);
      if (!rgb) return;
      
      const targetHsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const newImageData = new ImageData(new Uint8ClampedArray(originalImageData.data), canvasSize.width, canvasSize.height);
      const pixels = newImageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        if (maskData.data[i + 3] > 0) {
          const [,, l] = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
          
          let finalL = l;
          let finalS = targetHsl[1];

          // Special handling for Black/White/Dark colors
          if (targetHsl[2] < 0.2) {
            finalL = l * 0.3; // Darken substantially
            finalS = 0;      // Desaturate
          } else if (targetHsl[2] > 0.8) {
            finalL = Math.min(1, l * 1.5); // Brighten
            finalS = 0;
          }

          if (blendMode === "multiply") {
            pixels[i] = (pixels[i] * rgb.r) / 255;
            pixels[i+1] = (pixels[i+1] * rgb.g) / 255;
            pixels[i+2] = (pixels[i+2] * rgb.b) / 255;
            continue;
          }

          if (blendMode === "color") {
            const [newR, newG, newB] = hslToRgb(targetHsl[0], finalS, finalL);
            pixels[i] = newR;
            pixels[i + 1] = newG;
            pixels[i + 2] = newB;
          } else {
            const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
            pixels[i] = r < 128 ? (2 * r * rgb.r) / 255 : 255 - (2 * (255 - r) * (255 - rgb.r)) / 255;
            pixels[i+1] = g < 128 ? (2 * g * rgb.g) / 255 : 255 - (2 * (255 - g) * (255 - rgb.g)) / 255;
            pixels[i+2] = b < 128 ? (2 * b * rgb.b) / 255 : 255 - (2 * (255 - b) * (255 - rgb.b)) / 255;
          }
        }
      }
      ctx.putImageData(newImageData, 0, 0);
      setResultImage(imageCanvas.toDataURL('image/png'));
    } else if (type === "decal" && value) {
      // Decal projection
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasSize.width;
        tempCanvas.height = canvasSize.height;
        const tctx = tempCanvas.getContext('2d');
        if (!tctx) return;

        let minX = canvasSize.width, minY = canvasSize.height, maxX = 0, maxY = 0;
        for (let y = 0; y < canvasSize.height; y++) {
          for (let x = 0; x < canvasSize.width; x++) {
            if (maskData.data[(y * canvasSize.width + x) * 4 + 3] > 0) {
              minX = Math.min(minX, x); maxX = Math.max(maxX, x);
              minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            }
          }
        }

        const center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
        const size = Math.max(maxX - minX, maxY - minY) * 0.8;
        
        tctx.drawImage(img, center.x - size/2, center.y - size/2, size, size);
        
        const decalData = tctx.getImageData(0, 0, canvasSize.width, canvasSize.height);
        
        for (let i = 0; i < decalData.data.length; i += 4) {
          if (maskData.data[i + 3] === 0) {
            decalData.data[i + 3] = 0;
          }
        }
        
        tctx.putImageData(decalData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
        
        setResultImage(imageCanvas.toDataURL('image/png'));
        toast.success("Applied decal!");
      };
      img.src = value;
    }
  }, [canvasSize, toolValue, originalImageData, blendMode]);

  const applyLocalColor = useCallback(() => applyLocalCustomization("color"), [applyLocalCustomization]);
  const applyDecal = useCallback((url: string) => applyLocalCustomization("decal", url), [applyLocalCustomization]);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size - max 5MB
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large! Maximum size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
        event.target.value = ''; // Reset the input
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const { maxWidth, maxHeight } = getMaxCanvasDimensions();
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
          }
          
          setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
          setImage(e.target?.result as string);
          setResultImage(null);
          
          setTimeout(() => {
            drawImageToCanvas(e.target?.result as string, Math.floor(width), Math.floor(height));
          }, 100);
          
          toast.success("Image uploaded! Select an area.");
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawImageToCanvas = (imageSrc: string, width: number, height: number) => {
    const imageCanvas = imageCanvasRef.current;
    
    // Clear masks
    const maskCanvas = maskCanvasRef.current;
    const maskStorage = maskStorageRef.current;
    maskCanvas?.getContext('2d')?.clearRect(0, 0, width, height);
    maskStorage?.getContext('2d')?.clearRect(0, 0, width, height);

    if (!imageCanvas) return;

    const ctx = imageCanvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      setOriginalImageData(imageData);
    };
    img.src = imageSrc;
  };

  // --- AI & MANUAL SELECTION ---

  const magicWandSelect = useCallback((startX: number, startY: number) => {
    const imageCanvas = imageCanvasRef.current;
    const maskStorage = maskStorageRef.current; 
    if (!imageCanvas || !maskStorage) return;

    const ctx = imageCanvas.getContext('2d');
    const maskCtx = maskStorage.getContext('2d');
    if (!ctx || !maskCtx) return;

    // --- AI SELECTION ---
    if (smartEdges && segmenter) {
      setIsSegmenting(true);
      
      const keypoint = { x: startX / canvasSize.width, y: startY / canvasSize.height };
      
      segmenter.segment(imageCanvas, { keypoint }, (result) => {
          if(!result.categoryMask) {
              setIsSegmenting(false);
              return;
          }

          // Debug Click
          const debugCtx = maskCanvasRef.current?.getContext('2d');
          if (debugCtx) {
              debugCtx.fillStyle = 'yellow';
              debugCtx.beginPath();
              debugCtx.arc(startX, startY, 5, 0, Math.PI * 2);
              debugCtx.fill();
              setTimeout(() => debugCtx.clearRect(startX - 6, startY - 6, 12, 12), 1000);
          }

          // 1. Process AI Mask (The Constraint)
          const mask = result.categoryMask.getAsUint8Array();
          const width = result.categoryMask.width;
          const height = result.categoryMask.height;
          
          let totalMasked = 0;
          for(let i=0; i<mask.length; i++) {
              if(mask[i] > 0) totalMasked++;
          }
          
          const shouldInvert = totalMasked > (width * height * 0.6);
          
          // 2. Perform Hybrid Selection: GLOBAL COLOR MATCH within AI Mask
          // This eliminates connectivity issues (gaps) caused by reflections.
          
          const imageData = ctx.getImageData(0, 0, width, height);
          const pixels = imageData.data;
          
          const startIdx = (startY * width + startX) * 4;
          const startR = pixels[startIdx];
          const startG = pixels[startIdx + 1];
          const startB = pixels[startIdx + 2];
          
          // Use a higher effective tolerance when AI is helping
          const effectiveTolerance = tolerance * 3; 

          const maskCtxData = maskCtx.getImageData(0, 0, width, height);
          const outData = maskCtxData.data;

          // Iterate ALL pixels to find color matches inside the AI mask
          for (let i = 0; i < width * height; i++) {
             // Constraint 1: AI Mask
             const isAiSelected = mask[i] > 0;
             const passesAiConstraint = shouldInvert ? !isAiSelected : isAiSelected;

             if (!passesAiConstraint) continue;

             // Constraint 2: Color Match (Global)
             // We access the main image pixels to check color usage
             const idx = i * 4;
             const diff = Math.abs(pixels[idx] - startR) + Math.abs(pixels[idx + 1] - startG) + Math.abs(pixels[idx + 2] - startB);
             
             // Check for reflection (high brightness) or color match
             const isReflection = (pixels[idx] > 230 && pixels[idx+1] > 230 && pixels[idx+2] > 230); // Higher threshold for pure reflection

             if (diff <= effectiveTolerance || isReflection) {
                outData[idx] = 255;
                outData[idx + 1] = 255;
                outData[idx + 2] = 255;
                outData[idx + 3] = 255;
             }
          }
          
          maskCtx.putImageData(maskCtxData, 0, 0);
          setIsSegmenting(false);
          
          if (effectiveTool === "decals" && typeof toolValue === "string" && toolValue.includes(".svg")) {
             applyDecal(toolValue);
          } else {
             applyLocalColor();
          }
      });
      return; 
    }

    // --- FALLBACK: STANDARD MANUAL MAGIC WAND ---
    const imageData = ctx.getImageData(0, 0, canvasSize.width, canvasSize.height);
    const pixels = imageData.data;
    
    const startIdx = (startY * canvasSize.width + startX) * 4;
    const startR = pixels[startIdx];
    const startG = pixels[startIdx + 1];
    const startB = pixels[startIdx + 2];
    
    const maskData = maskCtx.createImageData(canvasSize.width, canvasSize.height);
    const mask = maskData.data;
    const visited = new Set<number>();
    const stack: [number, number][] = [[startX, startY]];
    
    const colorMatch = (idx: number): boolean => {
      const diff = Math.abs(pixels[idx] - startR) + Math.abs(pixels[idx + 1] - startG) + Math.abs(pixels[idx + 2] - startB);
      return diff <= tolerance * 3;
    };
    
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = y * canvasSize.width + x;
      
      if (x < 0 || x >= canvasSize.width || y < 0 || y >= canvasSize.height) continue;
      if (visited.has(key)) continue;

      const idx = key * 4;
      if (!colorMatch(idx)) continue;
      
      visited.add(key);
      mask[idx] = 255;
      mask[idx + 1] = 255;
      mask[idx + 2] = 255;
      mask[idx + 3] = 255; 
      
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    const existingMask = maskCtx.getImageData(0, 0, canvasSize.width, canvasSize.height);
    for (let i = 0; i < mask.length; i += 4) {
      if (mask[i + 3] > 0) {
        existingMask.data[i] = 255;
        existingMask.data[i + 1] = 255;
        existingMask.data[i + 2] = 255;
        existingMask.data[i + 3] = 255;
      }
    }
    maskCtx.putImageData(existingMask, 0, 0);

    // Apply immediately for non-AI mode
    if (effectiveTool === "decals" && typeof toolValue === "string" && toolValue.includes(".svg")) {
      applyDecal(toolValue);
    } else {
      applyLocalColor();
    }
  }, [canvasSize, tolerance, smartEdges, segmenter, effectiveTool, toolValue, applyDecal, applyLocalColor]);


  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectionMode !== "magic") return;
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvasSize.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvasSize.height / rect.height));
    
    // Trigger magic wand (which applies color itself)
    magicWandSelect(x, y);
  }, [selectionMode, canvasSize, magicWandSelect]);

  // Drawing Logic (Unchanged from Refactoring)
  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    if (selectionMode !== "brush") return;
    
    const visibleCanvas = maskCanvasRef.current;
    const storageCanvas = maskStorageRef.current;
    if (!visibleCanvas || !storageCanvas) return;

    const rect = visibleCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasSize.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasSize.height / rect.height);
    
    const ctx = visibleCanvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
    }

    const storageCtx = storageCanvas.getContext('2d');
    if (storageCtx) {
        storageCtx.fillStyle = 'rgba(255, 255, 255, 1)';
        storageCtx.beginPath();
        storageCtx.arc(x, y, brushSize, 0, Math.PI * 2);
        storageCtx.fill();
    }

  }, [isDrawing, selectionMode, canvasSize, brushSize]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectionMode !== "brush") return;
    setIsDrawing(true);
    draw(e);
  }, [selectionMode, draw]);

  const stopDrawing = useCallback(() => {
      setIsDrawing(false);
      
      const visibleCanvas = maskCanvasRef.current;
      if (visibleCanvas) {
          const ctx = visibleCanvas.getContext('2d');
          ctx?.clearRect(0, 0, canvasSize.width, canvasSize.height);
      }

      if (effectiveTool === "paint") {
          applyLocalColor();
      }
  }, [canvasSize, effectiveTool, applyLocalColor]);


  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling
    if (selectionMode !== "brush") return;
    setIsDrawing(true);
    
    const touch = e.touches[0];
    const visibleCanvas = maskCanvasRef.current;
    const storageCanvas = maskStorageRef.current;
    if (!visibleCanvas || !storageCanvas) return;
    
    const rect = visibleCanvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvasSize.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvasSize.height / rect.height);
    
    const ctx = visibleCanvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
    }

    const storageCtx = storageCanvas.getContext('2d');
    if (storageCtx) {
        storageCtx.fillStyle = 'rgba(255, 255, 255, 1)';
        storageCtx.beginPath();
        storageCtx.arc(x, y, brushSize, 0, Math.PI * 2);
        storageCtx.fill();
    }
  }, [selectionMode, canvasSize, brushSize]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || selectionMode !== "brush") return;
    
    const touch = e.touches[0];
    const visibleCanvas = maskCanvasRef.current;
    const storageCanvas = maskStorageRef.current;
    if (!visibleCanvas || !storageCanvas) return;
    
    const rect = visibleCanvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvasSize.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvasSize.height / rect.height);
    
    const ctx = visibleCanvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
    }

    const storageCtx = storageCanvas.getContext('2d');
    if (storageCtx) {
        storageCtx.fillStyle = 'rgba(255, 255, 255, 1)';
        storageCtx.beginPath();
        storageCtx.arc(x, y, brushSize, 0, Math.PI * 2);
        storageCtx.fill();
    }
  }, [isDrawing, selectionMode, canvasSize, brushSize]);

  const handleTouchEnd = useCallback(() => {
    setIsDrawing(false);
    
    const visibleCanvas = maskCanvasRef.current;
    if (visibleCanvas) {
        const ctx = visibleCanvas.getContext('2d');
        ctx?.clearRect(0, 0, canvasSize.width, canvasSize.height);
    }
    
    if (effectiveTool === "paint") {
        applyLocalColor();
    }
  }, [canvasSize, effectiveTool, applyLocalColor]);

  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    const maskStorage = maskStorageRef.current;
    if (maskCanvas) maskCanvas.getContext('2d')?.clearRect(0, 0, canvasSize.width, canvasSize.height);
    if (maskStorage) maskStorage.getContext('2d')?.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    if (originalImageData && imageCanvasRef.current) {
      imageCanvasRef.current.getContext('2d')?.putImageData(originalImageData, 0, 0);
    }
    setResultImage(null);
    toast.info("Cleared");
  };

  useEffect(() => {
    if (!toolValue) return;

    if (effectiveTool === "decals" && typeof toolValue === "string" && toolValue.includes(".svg")) {
      applyDecal(toolValue);
    } else {
      const maskStorage = maskStorageRef.current;
      if (maskStorage) {
        const ctx = maskStorage.getContext('2d');
        const imageData = ctx?.getImageData(0, 0, canvasSize.width, canvasSize.height);
        if (imageData) {
          let hasMask = false;
          for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) { hasMask = true; break; }
          }
          if (hasMask) applyLocalColor();
        }
      }
    }
  }, [toolValue, effectiveTool, applyDecal, canvasSize, applyLocalColor]);

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.download = 'customized-car.png';
    link.href = resultImage;
    link.click();
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div ref={containerRef} className="flex-1 relative bg-secondary/10 border-2 border-dashed border-primary/20 rounded-xl overflow-hidden min-h-[250px] sm:min-h-[350px] md:min-h-[400px]">
        {!image ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl font-medium mb-4">Upload a Car Image</p>
            <Button size="lg" className="relative">
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload}/>
              Choose File
            </Button>
          </div>
        ) : (
          <div className="relative w-full h-full flex justify-center items-center bg-black/50">
            <div className="relative" style={{ width: canvasSize.width, height: canvasSize.height }}>
              <canvas ref={imageCanvasRef} width={canvasSize.width} height={canvasSize.height} className="absolute top-0 left-0 shadow-lg"/>
              <canvas 
                ref={maskCanvasRef} 
                width={canvasSize.width} 
                height={canvasSize.height} 
                className="absolute top-0 left-0 cursor-crosshair touch-none"
                onClick={handleCanvasClick} 
                onMouseDown={startDrawing} 
                onMouseUp={stopDrawing} 
                onMouseLeave={stopDrawing} 
                onMouseMove={draw}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
               {isModelLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
               {isSegmenting && <ScanLine className="w-4 h-4 animate-pulse text-primary" />}
               <span>
                   {isModelLoading ? "Loading AI..." : 
                    isSegmenting ? "AI Processing..." :
                    selectionMode === "magic" ? (smartEdges ? "AI Smart Wand Active" : "Traditional Wand (Weak)") : "Draw to mask"}
               </span>
            </div>
          </div>
        )}
      </div>

      {image && (
        <div className="flex flex-wrap items-center gap-3 bg-card/80 p-3 rounded-xl border">
          {effectiveTool === "paint" && (
            <div className="flex gap-2">
              <Button variant={selectionMode === "magic" ? "default" : "outline"} size="sm" onClick={() => setSelectionMode("magic")}>
                <Wand2 className="w-4 h-4 mr-1" /> Magic
              </Button>
              <Button variant={selectionMode === "brush" ? "default" : "outline"} size="sm" onClick={() => setSelectionMode("brush")}>
                <Paintbrush className="w-4 h-4 mr-1" /> Brush
              </Button>
              <Button variant="outline" size="sm" onClick={clearMask}><Eraser className="w-4 h-4" /></Button>
            </div>
          )}

          {effectiveTool === "paint" && selectionMode === "magic" && (
            <>
              <div className="flex items-center gap-2 border-l border-r px-2 border-border/50">
                <Switch 
                    id="smart-edges" 
                    checked={smartEdges}
                    onCheckedChange={setSmartEdges}
                    disabled={isModelLoading}
                />
                <Label htmlFor="smart-edges" className="text-xs cursor-pointer select-none">AI Select</Label>
              </div>
              
              <div className="flex items-center gap-2">
                  <span className="text-xs">Tol.</span>
                  <input type="range" min="5" max="100" value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} className="w-16 h-2"/>
              </div>
            </>
          )}

          {effectiveTool === "paint" && selectionMode === "brush" && (
            <div className="flex items-center gap-2">
              <span className="text-xs">Size</span>
              <input type="range" min="5" max="50" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-16 h-2"/>
            </div>
          )}

          {effectiveTool === "paint" && (
            <select value={blendMode} onChange={(e) => setBlendMode(e.target.value as "overlay" | "color" | "multiply")} className="text-xs px-2 py-1 rounded border bg-background">
              <option value="color">Color</option>
              <option value="overlay">Overlay</option>
              <option value="multiply">Multiply</option>
            </select>
          )}

          <div className="flex-1 flex justify-end gap-2">
            {resultImage && <Button variant="outline" size="sm" onClick={downloadResult}><Download className="w-4 h-4" /></Button>}
          </div>
        </div>
      )}

    </div>
  );
};

export default TwoDStudio;
