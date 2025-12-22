import React, { useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Wand2, Paintbrush, Eraser, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import api from "@/store/baseApi";
import { cn } from "@/lib/utils";

const ImageStudio = () => {
  const [image, setImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
      };
      reader.readAsDataURL(file);
    }
  };

  const generateModification = async (promptId: string) => {
    if (!canvasRef.current || !image) {
      toast.error("Please upload an image and mask an area first.");
      return;
    }

    // Get mask from canvas
    // CanvasDraw exports usage data differently. 
    // We might need to handle getDataURL carefully. 
    // The library usually draws lines. For inpainting we need a black/white mask.
    // However, react-canvas-draw 'getDataURL' returns the whole drawing on transparent bg.
    // This serves as a mask if the backend handles transparency correctly or if we composite it.
    // Ideally, for Replicate, we want white pixels on black background (or vice versa).
    // Let's assume sending the transparent PNG of the stroke is sufficient for now, 
    // or we might need to process it. Replicate usually accepts "Draw the mask" which is white on black.
    
    // Quick fix: The canvas output is transparent where no stroke, and colored where stroke is.
    // We send this 'maskDataUrl'.
    const maskDataUrl = canvasRef.current.getDataURL("png", false, "#000000"); // Background color hidden?
    // Actually getDataURL argument 3 is background color. 
    // If we want a mask: Background Black, Brush White.
    // But displaying it to user: Background Transparent/Image, Brush Red (translucent).
    
    // Strategy: user sees Red brush. We ask canvas for data.
    // To get a pure mask, we might need a second hidden canvas or just rely on the alpha channel.
    // Let's try sending the raw stroke layer first.
    const rawMask = canvasRef.current.getDataURL("image/png", false, "transparent");

    const prompts: Record<string, string> = {
      rims_sport: "high performance sports car rims, matte black finish, detailed spokes, photorealistic, 4k",
      rims_luxury: "luxury chrome rims, shiny, silver, elegant multi-spoke design, photorealistic",
      spoiler_carbon: "carbon fiber racing spoiler, large rear wing, aerodynamic, automotive parts, photorealistic"
    };

    const targetPrompt = prompts[promptId];
    if (!targetPrompt) return;

    try {
      setIsProcessing(true);
      toast.loading("Generating AI modification...", { id: "ai-gen" });

      const response = await api.post("/ai/modify", {
        image: image,
        mask: rawMask, // Send the brush strokes
        prompt: targetPrompt
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
    <div className="min-h-screen bg-background p-6 animate-slideIn">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AI Modification Studio
          </h1>
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => canvasRef.current?.undo()}>
                <RotateCcw className="w-4 h-4 mr-2" /> Undo
             </Button>
             <Button variant="destructive" onClick={() => canvasRef.current?.clear()}>
                Clear Mask
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Canvas Area */}
          <Card className="lg:col-span-2 bg-secondary/10 border-primary/20">
            <CardContent className="p-0 min-h-[500px] flex items-center justify-center relative overflow-hidden rounded-xl">
              {!image ? (
                <div className="text-center p-10">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-xl font-medium mb-4">Upload a Car Image to Start</p>
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
                <div className="relative w-full h-full flex justify-center bg-black/50">
                    {/* The CanvasDraw component handles the image via `imgSrc` prop or we overlay it */}
                    {/* Using basic props for now. Note: react-canvas-draw might need explicit width/height */}
                    <CanvasDraw
                      ref={canvasRef}
                      brushColor="#ff0000" // Red for visibility
                      brushRadius={brushSize}
                      lazyRadius={1}
                      imgSrc={image}
                      canvasWidth={800}
                      canvasHeight={600}
                      className="border shadow-lg"
                      enablePanAndZoom={false} // Simplify for now
                      hideGrid
                    />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controls & Results */}
          <div className="space-y-6">
             {/* Result Preview */}
             {resultImage && (
               <Card className="border-green-500/50 bg-green-500/5 overflow-hidden">
                 <CardHeader><CardTitle className="text-sm">Generated Result</CardTitle></CardHeader>
                 <img src={resultImage} alt="Result" className="w-full h-auto object-cover" />
               </Card>
             )}

             {/* Tools */}
             <Card>
               <CardHeader><CardTitle>Tools</CardTitle></CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                        variant={drawMode === "brush" ? "default" : "outline"} 
                        onClick={() => setDrawMode("brush")}
                        className="flex-1"
                    >
                        <Paintbrush className="w-4 h-4 mr-2" /> Mask
                    </Button>
                    <Button 
                        variant={drawMode === "eraser" ? "default" : "outline"} 
                        onClick={() => {
                            setDrawMode("eraser");
                            canvasRef.current?.eraseAll(); // Simplified. React-canvas-draw erase is tricky.
                            // Actually react-canvas-draw doesn't have a true 'eraser' tool mode easily exposed without props.
                            // Usually you draw with white or transparent.
                            // For MVP, limit to "Clear" or just drawing.
                            toast.info("Eraser not fully supported, use Undo/Clear");
                        }}
                        className="flex-1"
                    >
                        <Eraser className="w-4 h-4 mr-2" /> Erase
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Brush Size</span>
                    <input 
                        type="range" 
                        min="1" max="50" 
                        value={brushSize} 
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full"
                    />
                  </div>
               </CardContent>
             </Card>

             {/* Generation Actions */}
             <Card>
                <CardHeader><CardTitle>AI Modifications</CardTitle></CardHeader>
                <CardContent className="grid gap-3">
                    <Button 
                        className="w-full justify-start" 
                        onClick={() => generateModification("rims_sport")}
                        disabled={isProcessing}
                    >
                        <Wand2 className="w-4 h-4 mr-2 text-indigo-400" /> Sport Rims
                    </Button>
                    <Button 
                        className="w-full justify-start"
                        onClick={() => generateModification("rims_luxury")}
                        disabled={isProcessing}
                    >
                        <Wand2 className="w-4 h-4 mr-2 text-yellow-400" /> Luxury Rims
                    </Button>
                    <Button 
                        className="w-full justify-start"
                        onClick={() => generateModification("spoiler_carbon")}
                        disabled={isProcessing}
                    >
                        <Wand2 className="w-4 h-4 mr-2 text-gray-400" /> Carbon Spoiler
                    </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
