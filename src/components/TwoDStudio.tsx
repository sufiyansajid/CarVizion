import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Wand2, Paintbrush, Eraser, MousePointer2, Download, Sparkles, Loader2, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/store/baseApi";

interface TwoDStudioProps {
  selectedTool: string;
  toolValue: any;
  toolName?: string;
}

const TwoDStudio: React.FC<TwoDStudioProps> = ({ selectedTool: _selectedTool, toolValue }) => {
  const [image, setImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [selectionMode, setSelectionMode] = useState<"magic" | "brush">("magic");
  const [brushSize, setBrushSize] = useState(15);
  const [tolerance, setTolerance] = useState(32);
  const [blendMode, setBlendMode] = useState<"overlay" | "color" | "multiply">("color");
  
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 800;
          const maxHeight = 600;
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
    const maskCanvas = maskCanvasRef.current;
    if (!imageCanvas || !maskCanvas) return;

    const ctx = imageCanvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      maskCtx.clearRect(0, 0, width, height);
      setOriginalImageData(ctx.getImageData(0, 0, width, height));
    };
    img.src = imageSrc;
  };

  // Magic Wand flood fill
  const magicWandSelect = useCallback((startX: number, startY: number) => {
    const imageCanvas = imageCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!imageCanvas || !maskCanvas) return;

    const ctx = imageCanvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;

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
      mask[idx + 3] = 180;
      
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    // Merge with existing mask
    const existingMask = maskCtx.getImageData(0, 0, canvasSize.width, canvasSize.height);
    for (let i = 0; i < mask.length; i += 4) {
      if (mask[i + 3] > 0) {
        existingMask.data[i] = 255;
        existingMask.data[i + 1] = 100;
        existingMask.data[i + 2] = 100;
        existingMask.data[i + 3] = 120;
      }
    }
    
    maskCtx.putImageData(existingMask, 0, 0);
    toast.success(`Selected ${visited.size} pixels`);
  }, [canvasSize, tolerance]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectionMode !== "magic") return;
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvasSize.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvasSize.height / rect.height));
    magicWandSelect(x, y);
  }, [selectionMode, canvasSize, magicWandSelect]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectionMode !== "brush") return;
    setIsDrawing(true);
    draw(e);
  }, [selectionMode]);

  const stopDrawing = useCallback(() => setIsDrawing(false), []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    if (selectionMode !== "brush") return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasSize.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasSize.height / rect.height);
    ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  }, [isDrawing, selectionMode, canvasSize, brushSize]);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling
    if (selectionMode !== "brush") return;
    setIsDrawing(true);
    
    const touch = e.touches[0];
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvasSize.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvasSize.height / rect.height);
    ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  }, [selectionMode, canvasSize, brushSize]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || selectionMode !== "brush") return;
    
    const touch = e.touches[0];
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvasSize.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvasSize.height / rect.height);
    ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  }, [isDrawing, selectionMode, canvasSize, brushSize]);

  const handleTouchEnd = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvasSize.width, canvasSize.height);
    if (originalImageData && imageCanvasRef.current) {
      imageCanvasRef.current.getContext('2d')?.putImageData(originalImageData, 0, 0);
    }
    setResultImage(null);
    toast.info("Cleared");
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  };

  const getMaskDataUrl = (): string | null => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    const maskData = ctx.getImageData(0, 0, canvasSize.width, canvasSize.height);
    const data = maskData.data;
    
    // Convert to proper black/white mask
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        data[i] = data[i + 1] = data[i + 2] = 255;
        data[i + 3] = 255;
      } else {
        data[i] = data[i + 1] = data[i + 2] = 0;
        data[i + 3] = 255;
      }
    }
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasSize.width;
    tempCanvas.height = canvasSize.height;
    tempCanvas.getContext('2d')?.putImageData(maskData, 0, 0);
    return tempCanvas.toDataURL('image/png');
  };

  // Local color overlay (instant, no API)
  const applyLocalColor = () => {
    const imageCanvas = imageCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!imageCanvas || !maskCanvas || !originalImageData) {
      toast.error("Please upload an image first.");
      return;
    }

    const color = typeof toolValue === 'string' && toolValue.startsWith('#') ? toolValue : '#ff0000';
    const rgb = hexToRgb(color);
    if (!rgb) { toast.error("Invalid color."); return; }

    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;
    const maskData = maskCtx.getImageData(0, 0, canvasSize.width, canvasSize.height);
    
    let selectedCount = 0;
    for (let i = 3; i < maskData.data.length; i += 4) {
      if (maskData.data[i] > 0) selectedCount++;
    }
    if (selectedCount === 0) { toast.error("Select an area first."); return; }

    const newImageData = new ImageData(new Uint8ClampedArray(originalImageData.data), canvasSize.width, canvasSize.height);
    const pixels = newImageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      if (maskData.data[i + 3] > 0) {
        const [origR, origG, origB] = [pixels[i], pixels[i + 1], pixels[i + 2]];
        let newR = origR, newG = origG, newB = origB;
        
        if (blendMode === "color") {
          const lum = 0.299 * origR + 0.587 * origG + 0.114 * origB;
          const colorLum = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
          const scale = colorLum > 0 ? lum / colorLum : 1;
          newR = Math.min(255, rgb.r * scale);
          newG = Math.min(255, rgb.g * scale);
          newB = Math.min(255, rgb.b * scale);
        } else if (blendMode === "multiply") {
          newR = (origR * rgb.r) / 255;
          newG = (origG * rgb.g) / 255;
          newB = (origB * rgb.b) / 255;
        } else { // overlay
          newR = origR < 128 ? (2 * origR * rgb.r) / 255 : 255 - (2 * (255 - origR) * (255 - rgb.r)) / 255;
          newG = origG < 128 ? (2 * origG * rgb.g) / 255 : 255 - (2 * (255 - origG) * (255 - rgb.g)) / 255;
          newB = origB < 128 ? (2 * origB * rgb.b) / 255 : 255 - (2 * (255 - origB) * (255 - rgb.b)) / 255;
        }
        
        const blend = maskData.data[i + 3] / 255;
        pixels[i] = Math.round(origR * (1 - blend * 0.8) + newR * blend * 0.8);
        pixels[i + 1] = Math.round(origG * (1 - blend * 0.8) + newG * blend * 0.8);
        pixels[i + 2] = Math.round(origB * (1 - blend * 0.8) + newB * blend * 0.8);
      }
    }

    const ctx = imageCanvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(newImageData, 0, 0);
      setResultImage(imageCanvas.toDataURL('image/png'));
      maskCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      toast.success(`Applied ${blendMode} color!`);
    }
  };

  // AI-powered generation (uses Hugging Face)
  const applyWithAI = async () => {
    if (!image) { toast.error("Upload image first."); return; }
    
    const mask = getMaskDataUrl();
    if (!mask) { toast.error("Select an area first."); return; }
    
    const color = typeof toolValue === 'string' && toolValue.startsWith('#') ? toolValue : 'red';
    const prompt = `car with ${color} paint, automotive, photorealistic, high quality`;

    try {
      setIsProcessing(true);
      toast.loading("Generating with AI (may take 10-30s)...", { id: "ai-gen" });

      const response = await api.post("/api/ai/modify", {
        image: imageCanvasRef.current?.toDataURL('image/png'),
        mask: mask,
        prompt: prompt
      });

      if (response.data.resultUrl) {
        setResultImage(response.data.resultUrl);
        toast.success("AI generation complete!", { id: "ai-gen" });
      } else if (response.data.loading) {
        toast.info("Model is loading, try again in 20s", { id: "ai-gen" });
      } else {
        toast.error("No result", { id: "ai-gen" });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "AI generation failed", { id: "ai-gen" });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.download = 'customized-car.png';
    link.href = resultImage;
    link.click();
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 relative bg-secondary/10 border-2 border-dashed border-primary/20 rounded-xl overflow-hidden min-h-[400px]">
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
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
              {selectionMode === "magic" ? "Tap to select" : "Draw to mask"}
            </div>
          </div>
        )}
      </div>

      {image && (
        <div className="flex flex-wrap items-center gap-3 bg-card/80 p-3 rounded-xl border">
          <div className="flex gap-2">
            <Button variant={selectionMode === "magic" ? "default" : "outline"} size="sm" onClick={() => setSelectionMode("magic")}>
              <MousePointer2 className="w-4 h-4 mr-1" /> Magic
            </Button>
            <Button variant={selectionMode === "brush" ? "default" : "outline"} size="sm" onClick={() => setSelectionMode("brush")}>
              <Paintbrush className="w-4 h-4 mr-1" /> Brush
            </Button>
            <Button variant="outline" size="sm" onClick={clearMask}><Eraser className="w-4 h-4" /></Button>
          </div>

          {selectionMode === "magic" && (
            <div className="flex items-center gap-2">
              <span className="text-xs">Tolerance</span>
              <input type="range" min="5" max="100" value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} className="w-16 h-2"/>
            </div>
          )}
          {selectionMode === "brush" && (
            <div className="flex items-center gap-2">
              <span className="text-xs">Size</span>
              <input type="range" min="5" max="50" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-16 h-2"/>
            </div>
          )}

          <select value={blendMode} onChange={(e) => setBlendMode(e.target.value as any)} className="text-xs px-2 py-1 rounded border bg-background">
            <option value="color">Color</option>
            <option value="overlay">Overlay</option>
            <option value="multiply">Multiply</option>
          </select>

          <div className="flex-1 flex justify-end gap-2">
            <Button onClick={applyLocalColor} variant="outline" size="sm">
              <Wand2 className="w-4 h-4 mr-1" /> Local Color
            </Button>
            <Button onClick={applyWithAI} disabled={isProcessing} size="sm">
              {isProcessing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
              {isProcessing ? "Processing..." : "AI Generate"}
            </Button>
            {resultImage && <Button variant="outline" size="sm" onClick={downloadResult}><Download className="w-4 h-4" /></Button>}
          </div>
        </div>
      )}

      {resultImage && (
        <>
          <Card className="border-green-500/50 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-500" />
                AI Generated Result
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => setFullscreenPreview(true)} title="View fullscreen">
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={downloadResult} title="Download">
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setResultImage(null)}>×</Button>
              </div>
            </CardHeader>
            <div 
              className="p-4 flex justify-center bg-black/20 cursor-pointer hover:bg-black/30 transition-colors"
              onClick={() => setFullscreenPreview(true)}
            >
              <img src={resultImage} alt="Result" className="max-h-[250px] object-contain rounded shadow-lg" />
            </div>
          </Card>

          {/* Fullscreen Preview Dialog */}
          <Dialog open={fullscreenPreview} onOpenChange={setFullscreenPreview}>
            <DialogContent className="max-w-[90vw] max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  AI Generated Result
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4">
                <div className="bg-black/20 rounded-lg p-4 max-h-[70vh] overflow-auto">
                  <img src={resultImage} alt="Result" className="max-w-full max-h-[65vh] object-contain rounded" />
                </div>
                <div className="flex gap-3">
                  <Button onClick={downloadResult}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                  <Button variant="outline" onClick={() => setFullscreenPreview(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default TwoDStudio;
