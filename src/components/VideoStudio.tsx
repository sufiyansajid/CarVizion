import { useRef, useState } from "react";
// Unused: Card, CardContent imports removed
import { Camera, Video, Download, RotateCcw, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ARCamera } from "./AR/ARCamera";
import { ARRenderer } from "./AR/ARRenderer";
import { MindARViewer } from "./AR/MindARViewer";

interface VideoStudioProps {
  selectedTool: string;
}

const VideoStudio = ({ selectedTool }: VideoStudioProps) => {
  const [isActive, setIsActive] = useState(false);
  const [useTracking, setUseTracking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleAR = () => {
    setIsActive(!isActive);
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
                modelPath="/models/universal_spoiler_1.glb"
                onReady={() => console.log("MindAR Ready")}
              />
            ) : (
              <>
                <ARCamera
                  isActive={isActive}
                  videoRef={videoRef}
                  onStreamReady={() => console.log("Stream Ready")}
                />
                {selectedTool === "spoilers" && (
                  <ARRenderer
                    isActive={isActive}
                    modelPath="/models/universal_spoiler_1.glb"
                    modelScale={0.8}
                    modelPosition={[0, -0.5, 0]}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
            <Video className="w-16 h-16 mb-4 opacity-50 text-primary animate-pulse" />
            <h3 className="text-xl font-semibold text-foreground">AR Preview Ready</h3>
            <p className="max-w-xs text-center mt-2">
              Select 'Spoilers' in the sidebar and start the camera to visualize modifications in AR.
            </p>
          </div>
        )}

        {/* Floating Controls */}
        {isActive && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="lg" onClick={captureImage} className="shadow-2xl">
              <Download className="w-5 h-5 mr-2" /> Capture & Save
            </Button>
            <Button size="lg" variant="secondary" onClick={() => setUseTracking(!useTracking)}>
              <Box className="w-5 h-5 mr-2" />
              {useTracking ? "Switch to Static" : "Enable Tracking"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-primary/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="font-medium">{isActive ? 'Camera Active' : 'Camera Powered Off'}</span>
        </div>

        <div className="flex gap-3">
          <Button
            variant={isActive ? "destructive" : "default"}
            onClick={toggleAR}
            className="min-w-[140px]"
          >
            {isActive ? (
              <><RotateCcw className="w-4 h-4 mr-2" /> Stop Camera</>
            ) : (
              <><Camera className="w-4 h-4 mr-2" /> Start Camera</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;

