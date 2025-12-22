import React, { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const VideoStudio = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
     if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
     }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-6">
       <div className="relative w-full max-w-2xl aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover" 
          />
          {!videoRef.current?.srcObject && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
                  <Video className="w-16 h-16 mb-4 opacity-50" />
                  <p>Camera is currently off</p>
              </div>
          )}
       </div>
       
       <div className="flex gap-4">
          <Button onClick={startCamera}>
             <Camera className="w-4 h-4 mr-2" /> Start Camera
          </Button>
          <Button variant="destructive" onClick={stopCamera}>
             Stop Camera
          </Button>
       </div>
       
       <p className="text-sm text-muted-foreground max-w-md">
          AR Video mode is under development. In the future, this will allow real-time overlay of modifications on your camera feed.
       </p>
    </div>
  );
};

export default VideoStudio;
