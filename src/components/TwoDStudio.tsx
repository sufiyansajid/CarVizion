import React, { useRef, useState, useEffect } from "react";
import CanvasDraw from "react-canvas-draw";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Wand2, Paintbrush, Eraser, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import api from "@/store/baseApi";
import { cn } from "@/lib/utils";

interface TwoDStudioProps {
  // Props from parent (ARStudio sidebar)
  selectedTool: string;
  toolValue: any; // The checked/selected value (e.g., specific color hex, or option string)
  toolName?: string; // Human readable name
}

const TwoDStudio: React.FC<TwoDStudioProps> = ({ selectedTool, toolValue, toolName }) => {
  const [image, setImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Internal drawing state
  const [drawMode, setDrawMode] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(12);
  
  const canvasRef = useRef<any>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setResultImage(null);
        toast.success("Image uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Construct prompt based on selected tool and value
  const getPromptForTool = (): string | null => {
    if (!toolValue) return null;

    // Helper to format color if it's a hex
    const isColor = (typeof toolValue === 'string' && toolValue.startsWith('#'));
    const valueDesc = isColor ? `color ${toolValue}` : toolValue;

    switch (selectedTool) {
      case "paint":
        return `change car body paint to ${valueDesc}, high gloss, automotive finish, photorealistic`;
      case "rims":
        return `change car rims to ${valueDesc}, detailed spokes, photorealistic, automotive parts`;
      case "windowtint":
        return `apply ${valueDesc} window tint to car windows, automotive glass`;
      case "headlights":
        return `change headlights to ${valueDesc} style, automotive lighting, photorealistic`;
      case "spoilers":
        return `add a ${valueDesc} spoiler to the rear, automotive aerodynamic part, photorealistic`;
      case "decals":
        return `apply ${valueDesc} decal to the car body, automotive sticker`;
      case "wraps":
        return `wrap the car in ${valueDesc} vinyl wrap, automotive customization`;
      default:
        // Default fallback if we just have a value name
        return `modify car part: ${selectedTool} to ${valueDesc}, photorealistic`;
    }
  };

  const generateModification = async () => {
    if (!canvasRef.current || !image) {
      toast.error("Please upload an image and mask an area first.");
      return;
    }
    
    // We need a selection from the sidebar
    if (!selectedTool || !toolValue) {
      toast.error("Please select a customization option (Color, Rims, etc.) from the sidebar first.");
      return;
    }

    const prompt = getPromptForTool();
    if (!prompt) {
         toast.error("Could not generate prompt from selection.");
         return;
    }

    // Get mask
    // Using simple transparency trick 
    const rawMask = canvasRef.current.getDataURL("image/png", false, "transparent");

    try {
      setIsProcessing(true);
      toast.loading(`Generating: ${prompt}`, { id: "ai-gen" });

      const response = await api.post("/api/ai/modify", {
        image: image,
        mask: rawMask,
        prompt: prompt
      });

      if (response.data.resultUrl) {
        setResultImage(response.data.resultUrl);
        toast.success("Generation complete!", { id: "ai-gen" });
      } else {
        toast.error("No result returned", { id: "ai-gen" });
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Generation failed", { id: "ai-gen" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 relative bg-secondary/10 border-2 border-dashed border-primary/20 rounded-xl overflow-hidden min-h-[400px]">
          {!image ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
              <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-medium mb-4">Upload a Car Image to Start 2D Mode</p>
              <Button size="lg" className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                />
                Choose File
              </Button>
            </div>
          ) : (
             <div className="relative w-full h-full flex justify-center items-center bg-black/50 overflow-auto">
                 <CanvasDraw
                   ref={canvasRef}
                   brushColor="#ff0000" // Red for user visibility
                   brushRadius={brushSize}
                   lazyRadius={1}
                   imgSrc={image}
                   canvasWidth={800} // Ideally dynamic or responsive
                   canvasHeight={600}
                   className="shadow-lg"
                   enablePanAndZoom={false} 
                   hideGrid
                 />
             </div>
          )}
      </div>

      {/* 2D Specific Controls Toolbar (Brush, Eraser, etc.) */}
      {image && (
          <div className="flex flex-wrap items-center gap-4 bg-card/80 p-3 rounded-xl border">
              <div className="flex gap-2">
                 <Button 
                   variant={drawMode === "brush" ? "default" : "outline"} 
                   size="sm"
                   onClick={() => setDrawMode("brush")}
                 >
                    <Paintbrush className="w-4 h-4 mr-2" /> Mask
                 </Button>
                 <Button 
                   variant={drawMode === "eraser" ? "default" : "outline"} 
                   size="sm"
                   onClick={() => {
                       setDrawMode("eraser");
                       canvasRef.current?.eraseAll(); // Simple clear for MVP
                       toast.info("Cleared mask");
                   }}
                 >
                    <Eraser className="w-4 h-4 mr-2" /> Clear Mask
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => canvasRef.current?.undo()}>
                    <RotateCcw className="w-4 h-4" />
                 </Button>
              </div>

              <div className="flex-1 flex items-center gap-2 max-w-xs">
                 <span className="text-xs font-medium whitespace-nowrap">Brush Size</span>
                 <input 
                    type="range" 
                    min="1" max="50" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                 />
              </div>

              <div className="flex-1 flex justify-end">
                 <Button onClick={generateModification} disabled={isProcessing} className="w-full md:w-auto">
                    <Wand2 className="w-4 h-4 mr-2" /> 
                    {isProcessing ? "Generating..." : "Generate 2D View"}
                 </Button>
              </div>
          </div>
      )}

      {/* Result Preview (if any) */}
      {resultImage && (
        <Card className="border-green-500/50 bg-green-500/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="py-3 bg-green-500/10 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Generated 2D Result</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setResultImage(null)}>Close</Button>
            </CardHeader>
            <div className="p-2 flex justify-center bg-black/20">
                <img src={resultImage} alt="Result" className="max-h-[300px] object-contain rounded" />
            </div>
        </Card>
      )}
    </div>
  );
};

export default TwoDStudio;
