import { useRef, useState } from "react";
import { Camera, Video, Download, RotateCcw, Box, Trash2, Plus, Move, Rotate3d, Maximize, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ARCamera } from "./AR/ARCamera";
import { ARRenderer, type ARPart } from "./AR/ARRenderer";
import { MindARViewer } from "./AR/MindARViewer";

interface VideoStudioProps {
  selectedTool: string;
  bodyColor?: string;
  rimColor?: string;
}

const TOOL_MODELS: Record<string, string[]> = {
  paint: ["/models/Car3D.glb"],
  bumpers: ["/models/bumper2.glb", "/models/bumper3.glb", "/models/bumper4.glb"],
  spoilers: ["/models/universal_spoiler_1.glb", "/models/spoiler2.glb"],
  rims: ["/models/rim.glb", "/models/wheel.glb", "/models/wheel2.glb"],
};

const VideoStudio = ({ selectedTool, bodyColor, rimColor }: VideoStudioProps) => {
  const [isActive, setIsActive] = useState(false);
  const [useTracking, setUseTracking] = useState(false);
  const [activeParts, setActiveParts] = useState<ARPart[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<"translate" | "rotate" | "scale">("translate");

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleAR = () => {
    setIsActive(!isActive);
  };

  const addPart = (modelPath: string) => {
    // Determine part type based on selectedTool
    let partType: 'body' | 'bumper' | 'spoiler' | 'rim' = 'body';
    if (selectedTool === 'paint') partType = 'body';
    else if (selectedTool === 'bumpers') partType = 'bumper';
    else if (selectedTool === 'spoilers') partType = 'spoiler';
    else if (selectedTool === 'rims') partType = 'rim';

    const newPart: ARPart = {
      id: `part-${Date.now()}`,
      modelPath,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
      bodyColor,
      rimColor,
      partType,
    };
    setActiveParts([...activeParts, newPart]);
    setSelectedPartId(newPart.id);
    setTransformMode("translate");
    toast.success("Part added to scene");
  };

  const removePart = (id: string) => {
    setActiveParts(activeParts.filter(p => p.id !== id));
    if (selectedPartId === id) setSelectedPartId(null);
    toast.info("Part removed");
  };

  const updatePart = (id: string, position: [number, number, number], rotation: [number, number, number], scale: number) => {
    setActiveParts(activeParts.map(p =>
      p.id === id ? { ...p, position, rotation, scale } : p
    ));
  };

  const captureImage = async () => {
    if (!videoRef.current || !isActive) return;

    try {
      const canvas = document.createElement("canvas");
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw 3D content if present
      const threeCanvas = containerRef.current?.querySelector("canvas");
      if (threeCanvas) {
        ctx.drawImage(threeCanvas, 0, 0, canvas.width, canvas.height);
      }

      // Download
      const link = document.createElement("a");
      link.download = `carvizion-capture-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Image saved to downloads!");
    } catch (err) {
      console.error("Capture failed:", err);
      toast.error("Failed to capture image");
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div
        ref={containerRef}
        className="relative flex-1 bg-black rounded-xl overflow-hidden group min-h-[500px]"
      >
        {isActive ? (
          <>
            {useTracking ? (
              <MindARViewer
                modelPath={activeParts[0]?.modelPath || "/models/universal_spoiler_1.glb"}
                onReady={() => console.log("MindAR Ready")}
              />
            ) : (
              <>
                <ARCamera
                  isActive={isActive}
                  videoRef={videoRef}
                  onStreamReady={() => console.log("Stream Ready")}
                />
                <ARRenderer
                  isActive={isActive}
                  models={activeParts}
                  selectedId={selectedPartId}
                  transformMode={transformMode}
                  onSelect={setSelectedPartId}
                  onUpdate={updatePart}
                />
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
            <Video className="w-16 h-16 mb-4 opacity-50 text-primary animate-pulse" />
            <h3 className="text-xl font-semibold text-foreground">AR Preview Ready</h3>
            <p className="max-w-xs text-center mt-2">
              Start the camera and use the 'Add' buttons below to place parts on the car.
            </p>
          </div>
        )}

        {/* Professional Selection Overlay */}
        {selectedPartId && (
          <div className="absolute top-6 left-6 bg-background/90 backdrop-blur-xl p-4 rounded-2xl border border-primary/20 shadow-2xl z-50 animate-in fade-in slide-in-from-left-4 max-w-[240px]">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <MousePointer2 className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Selection</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removePart(selectedPartId)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm font-bold mb-4 truncate text-foreground/90">
              {activeParts.find(p => p.id === selectedPartId)?.modelPath.split('/').pop()?.replace('.glb', '')}
            </p>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Transform Mode</span>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={transformMode === "translate" ? "default" : "secondary"}
                  size="sm"
                  className="h-10 px-0"
                  onClick={() => setTransformMode("translate")}
                  title="Move"
                >
                  <Move className="h-4 w-4" />
                </Button>
                <Button
                  variant={transformMode === "rotate" ? "default" : "secondary"}
                  size="sm"
                  className="h-10 px-0"
                  onClick={() => setTransformMode("rotate")}
                  title="Rotate"
                >
                  <Rotate3d className="h-4 w-4" />
                </Button>
                <Button
                  variant={transformMode === "scale" ? "default" : "secondary"}
                  size="sm"
                  className="h-10 px-0"
                  onClick={() => setTransformMode("scale")}
                  title="Resize"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-9 border-primary/20 hover:bg-primary/5" onClick={() => setSelectedPartId(null)}>
                Finish Adjusting
              </Button>
            </div>
          </div>
        )}

        {/* Floating Toolbar */}
        {isActive && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button size="lg" onClick={captureImage} className="shadow-2xl bg-primary hover:bg-primary/90">
              <Download className="w-5 h-5 mr-2" /> Save Design
            </Button>
            <Button size="lg" variant="secondary" onClick={() => setUseTracking(!useTracking)} className="backdrop-blur-md">
              <Box className="w-5 h-5 mr-2" />
              {useTracking ? "Static Mode" : "Tracking Mode"}
            </Button>
          </div>
        )}
      </div>

      {/* Part Selection & Active List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-xl border border-primary/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Available for {selectedTool || 'Parts'}
            </h4>
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedTool && TOOL_MODELS[selectedTool] ? (
              TOOL_MODELS[selectedTool].map((model) => (
                <Button
                  key={model}
                  variant="outline"
                  size="sm"
                  className="bg-secondary/30"
                  disabled={!isActive}
                  onClick={() => addPart(model)}
                >
                  <Box className="w-3 h-3 mr-2" />
                  {model.split('/').pop()?.replace('.glb', '')}
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">Select a category in the sidebar (Bumpers, Spoilers, Rims) to see available AR models.</p>
            )}
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-primary/10 shadow-lg">
          <h4 className="font-bold flex items-center gap-2 mb-4">
            <Move className="w-4 h-4 text-primary" /> Active Scene ({activeParts.length})
          </h4>
          <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-2">
            {activeParts.length > 0 ? (
              activeParts.map((part) => (
                <div
                  key={part.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer",
                    selectedPartId === part.id ? "bg-primary/20 border-primary" : "bg-secondary/50 border-transparent hover:border-muted-foreground/30"
                  )}
                  onClick={() => setSelectedPartId(part.id)}
                >
                  <span className="text-xs font-medium">{part.modelPath.split('/').pop()?.replace('.glb', '')}</span>
                  <button
                    className="hover:text-destructive transition-colors ml-1"
                    onClick={(e) => { e.stopPropagation(); removePart(part.id); }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No active parts in scene.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-card px-6 py-4 rounded-xl border border-primary/10 shadow-lg">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> Transform Active
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" /> Move Precision: High
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant={isActive ? "destructive" : "default"}
            onClick={toggleAR}
            className="min-w-[160px] font-bold"
          >
            {isActive ? (
              <><RotateCcw className="w-4 h-4 mr-2" /> Power Down AR</>
            ) : (
              <><Camera className="w-4 h-4 mr-2" /> Initialize Camera</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;


