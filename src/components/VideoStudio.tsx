import { useRef, useState } from "react";
import { Camera, Video, Download, RotateCcw, Box, Trash2, Plus, Move, Rotate3d, Maximize, MousePointer2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ARCamera } from "./AR/ARCamera";
import { ARRenderer, type ARPart } from "./AR/ARRenderer";
import { MindARViewer } from "./AR/MindARViewer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoStudioProps {
  selectedTool: string;
  bodyColor?: string;
  rimColor?: string;
}

const TOOL_MODELS: Record<string, string[]> = {
  paint: [],
  bumpers: ["/models/bumper2.glb", "/models/bumper3.glb", "/models/bumper4.glb"],
  spoilers: ["/models/universal_spoiler_1.glb", "/models/spoiler2.glb"],
  rims: [
    "/models/rim.glb",
    "/models/wheel.glb",
    "/models/wheel2.glb",
    "/models/rims/concept_car_rim.glb",
    "/models/rims/weed_car_rims.glb",
    "/models/rims/morello_cerchi_-_rims_-_murgese_v.glb"
  ],
};

const VideoStudio = ({ selectedTool, bodyColor, rimColor }: VideoStudioProps) => {
  const [isActive, setIsActive] = useState(false);
  const [useTracking, setUseTracking] = useState(false);
  const [activeParts, setActiveParts] = useState<ARPart[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<"translate" | "rotate" | "scale">("translate");
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleAR = () => {
    setIsActive(!isActive);
  };

  const addPart = (modelPath: string) => {
    // Determine part type based on path or current tool
    let partType: 'body' | 'bumper' | 'spoiler' | 'rim' = 'body';
    if (modelPath.includes('rim') || modelPath.includes('wheel')) partType = 'rim';
    else if (modelPath.includes('bumper')) partType = 'bumper';
    else if (modelPath.includes('spoiler')) partType = 'spoiler';

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
    setIsSelectionModalOpen(false);
    toast.success(`${modelPath.split('/').pop()?.replace('.glb', '')} added to scene`);
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

  const updatePartColor = (id: string, color: string) => {
    setActiveParts(activeParts.map(p => {
      if (p.id === id) {
        if (p.partType === 'rim') {
          return { ...p, rimColor: color };
        } else {
          return { ...p, bodyColor: color };
        }
      }
      return p;
    }));
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
                modelPath={activeParts.find(p => p.id === selectedPartId)?.modelPath || activeParts[0]?.modelPath || "/models/universal_spoiler_1.glb"}
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
              Start the camera and select parts to view them in augmented reality.
            </p>
          </div>
        )}

        {/* Global Add Button */}
        {isActive && !selectedPartId && (
          <div className="absolute top-6 left-6 z-40">
            <Button
              onClick={() => setIsSelectionModalOpen(true)}
              className="rounded-full shadow-2xl h-12 w-12 p-0 bg-primary hover:scale-110 transition-transform"
            >
              <Plus className="h-6 w-6" />
            </Button>
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

            <p className="text-sm font-bold mb-4 truncate text-foreground/90 flex items-center gap-2">
              <Box className="w-3 h-3 text-primary" />
              {activeParts.find(p => p.id === selectedPartId)?.modelPath.split('/').pop()?.replace('.glb', '')}
            </p>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Transform</span>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={transformMode === "translate" ? "default" : "secondary"}
                  size="sm"
                  className="h-10 px-0"
                  onClick={() => setTransformMode("translate")}
                >
                  <Move className="h-4 w-4" />
                </Button>
                <Button
                  variant={transformMode === "rotate" ? "default" : "secondary"}
                  size="sm"
                  className="h-10 px-0"
                  onClick={() => setTransformMode("rotate")}
                >
                  <Rotate3d className="h-4 w-4" />
                </Button>
                <Button
                  variant={transformMode === "scale" ? "default" : "secondary"}
                  size="sm"
                  className="h-10 px-0"
                  onClick={() => setTransformMode("scale")}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>

              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mt-2">Color</span>
              <div className="flex flex-wrap gap-2">
                {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#000000', '#ffffff', '#C0C0C0'].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition-transform shadow-sm"
                    style={{ backgroundColor: color }}
                    onClick={() => updatePartColor(selectedPartId!, color)}
                  />
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-9 border-primary/20" onClick={() => setIsSelectionModalOpen(true)}>
                  Replace
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-xs h-9" onClick={() => setSelectedPartId(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Toolbar */}
        {isActive && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button size="lg" onClick={captureImage} className="shadow-2xl bg-primary hover:bg-primary/90">
              <Download className="w-5 h-5 mr-2" /> Save Design
            </Button>
            <Button size="lg" variant="secondary" onClick={() => setUseTracking(!useTracking)} className="backdrop-blur-md border border-white/10">
              <Box className="w-5 h-5 mr-2 text-primary" />
              {useTracking ? "Static Mode" : "Tracking Mode"}
            </Button>
          </div>
        )}
      </div>

      {/* Simplified Bottom Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-xl border border-primary/10 shadow-lg flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm">Design Library</h4>
            <p className="text-xs text-muted-foreground">Select parts to add to your vehicle</p>
          </div>
          <Button variant="default" onClick={() => setIsSelectionModalOpen(true)} disabled={!isActive}>
            <Plus className="w-4 h-4 mr-2" /> Add Part
          </Button>
        </div>

        <div className="bg-card p-4 rounded-xl border border-primary/10 shadow-lg">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Move className="w-4 h-4 text-primary" /> Active Scene ({activeParts.length})
          </h4>
          <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-2">
            {activeParts.length > 0 ? (
              activeParts.map((part) => (
                <div
                  key={part.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer",
                    selectedPartId === part.id ? "bg-primary/20 border-primary shadow-sm" : "bg-secondary/50 border-transparent hover:border-muted-foreground/30"
                  )}
                  onClick={() => setSelectedPartId(part.id)}
                >
                  <span className="text-xs font-semibold">{part.modelPath.split('/').pop()?.replace('.glb', '')}</span>
                  <button className="hover:text-destructive transition-colors ml-1" onClick={(e) => { e.stopPropagation(); removePart(part.id); }}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No parts added yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-card px-6 py-4 rounded-xl border border-primary/10 shadow-lg">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} /> {isActive ? 'Camera Online' : 'Camera Service Offline'}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 font-medium">
            Precision AR Tracking Active
          </div>
        </div>

        <Button
          variant={isActive ? "destructive" : "default"}
          onClick={toggleAR}
          className="min-w-[160px] font-bold shadow-lg"
        >
          {isActive ? (
            <><RotateCcw className="w-4 h-4 mr-2" /> Shut Down AR</>
          ) : (
            <><Camera className="w-4 h-4 mr-2" /> Initialize AR View</>
          )}
        </Button>
      </div>

      {/* Dedicated Model Selection Modal (Resolution for "modal not showing") */}
      <Dialog open={isSelectionModalOpen} onOpenChange={setIsSelectionModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-2xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold italic">
              <Box className="w-6 h-6 text-primary" />
              ADD 3D PART
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-6 pt-4">
            {Object.entries(TOOL_MODELS).map(([category, models]) => (
              models.length > 0 && (
                <div key={category} className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-2">{category}</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {models.map((model) => (
                      <button
                        key={model}
                        onClick={() => addPart(model)}
                        className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/30 border border-white/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                      >
                        <div className="w-12 h-12 mb-2 bg-background/50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Box className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-tight">{model.split('/').pop()?.replace('.glb', '')}</span>
                        <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoStudio;


