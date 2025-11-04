import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Camera,
  Upload,
  Palette,
  Settings,
  Sticker,
  CarFront,
  Lightbulb,
  Sun,
  Sparkles,
  PanelsTopLeft,
  PaintBucket,
  Save,
  Undo2,
  Redo2,
  Play,
  Square,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ARStudio = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedTool, setSelectedTool] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const customizationTools = [
    { id: "paint", name: "Paint", icon: PaintBucket },
    { id: "wraps", name: "Wraps", icon: PanelsTopLeft },
    { id: "rims", name: "Rims", icon: Settings },
    { id: "decals", name: "Decals", icon: Sticker },
    { id: "bumpers", name: "Bumpers", icon: CarFront },
    { id: "sideskirts", name: "Side Skirts", icon: CarFront },
    { id: "headlights", name: "Headlights", icon: Lightbulb },
    { id: "taillights", name: "Taillights", icon: Sun },
    { id: "underglow", name: "Under Glow", icon: Sparkles },
    { id: "windowtint", name: "Window Tint", icon: Palette },
  ];

  const colorOptions = [
    "#ff5e1a",
    "#ef4444",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ffffff",
    "#000000",
  ];

  const wrapOptions = [
    "Matte Black",
    "Chrome",
    "Carbon Fiber",
    "Camo",
    "Gloss Red",
  ];
  const lightOptions = ["White", "Yellow", "Blue", "RGB Glow"];
  const tintOptions = ["Light", "Medium", "Dark", "Limo"];

  return (
    <div className="min-h-screen bg-background p-4 animate-slideIn">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-primary">
                AR Customization Studio
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Undo2 className="w-4 h-4 mr-2" /> Undo
                </Button>
                <Button variant="outline" size="sm">
                  <Redo2 className="w-4 h-4 mr-2" /> Redo
                </Button>
                <Button variant="default">
                  <Save className="w-4 h-4 mr-2" /> Save Design
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardContent className="p-4 md:p-6 h-[600px]">
              <div className="relative h-full rounded-lg overflow-hidden bg-secondary/20 flex items-center justify-center">
                {isRecording ? (
                  <video
                    ref={(video) => {
                      if (
                        video &&
                        video.srcObject === null &&
                        navigator.mediaDevices
                      ) {
                        navigator.mediaDevices
                          .getUserMedia({ video: true })
                          .then((stream) => {
                            video.srcObject = stream;
                            video.play();
                          })
                          .catch((err) =>
                            console.error("Camera access denied:", err)
                          );
                      }
                    }}
                    className="w-full h-full object-contain"
                    autoPlay
                    muted
                  />
                ) : uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Car Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Camera className="w-16 h-16 mb-4 animate-float" />
                    <h3 className="text-xl font-semibold mb-2">
                      No Image Selected
                    </h3>
                    <p className="text-center mb-6">
                      Upload a car image or start live camera feed
                    </p>
                  </div>
                )}

                {/* Always Visible Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                  <Button
                    variant="default"
                    onClick={() => setIsRecording(true)}
                    disabled={isRecording}
                  >
                    <Play className="w-4 h-4 mr-2" /> Start Camera
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => {
                      const video = document.querySelector("video");
                      if (video && video.srcObject) {
                        const stream = video.srcObject as MediaStream;
                        stream.getTracks().forEach((track) => track.stop()); // stop all tracks
                        video.srcObject = null; // 👈 clear video source
                      }
                      setIsRecording(false);
                    }}
                    disabled={!isRecording}
                  >
                    <Square className="w-4 h-4 mr-2" /> Stop Camera
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" /> Upload Image
                  </Button>

                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Tools (fixed layout, no flicker) */}
        <div className="space-y-3 order-1 lg:order-2 sticky top-4 overflow-y-auto max-h-[80vh]">
          {customizationTools.map((tool) => (
            <div key={tool.id}>
              <Button
                variant={selectedTool === tool.id ? "default" : "outline"}
                className={cn(
                  "w-full justify-start transition-all",
                  selectedTool === tool.id
                    ? "text-primary-foreground"
                    : "text-foreground hover:text-accent-foreground"
                )}
                onClick={() =>
                  setSelectedTool(selectedTool === tool.id ? "" : tool.id)
                }
              >
                <tool.icon className="w-4 h-4 mr-2" />
                {tool.name}
              </Button>

              {/* Collapsible panel directly below button */}
              {selectedTool === tool.id && (
                <div className="mt-2 transition-all duration-300 ease-in-out">
                  {/* Paint */}
                  {tool.id === "paint" && (
                    <>
                      <Card className="bg-card/80 border-border mb-3">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            Paint Colors
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-4 gap-2">
                          {colorOptions.map((color, i) => (
                            <button
                              key={i}
                              style={{ backgroundColor: color }}
                              className="w-8 h-8 rounded-md border hover:scale-110 transition"
                            />
                          ))}
                        </CardContent>
                      </Card>
                      <AdjustmentCard
                        title="Paint Adjustments"
                        sliders={["Brightness", "Saturation", "Hue"]}
                      />
                    </>
                  )}

                  {/* Wraps */}
                  {tool.id === "wraps" && (
                    <>
                      <Card className="bg-card/80 border-border mb-3">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Wrap Styles</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                          {wrapOptions.map((wrap) => (
                            <Button key={wrap} variant="outline" size="sm">
                              {wrap}
                            </Button>
                          ))}
                        </CardContent>
                      </Card>
                      <AdjustmentCard
                        title="Wrap Adjustments"
                        sliders={["Gloss", "Reflectivity"]}
                      />
                    </>
                  )}

                  {/* Rims */}
                  {tool.id === "rims" && (
                    <Card className="bg-card/80 border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Rim Styles</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-2">
                        {["Sport", "Classic", "Racing", "Luxury"].map(
                          (style) => (
                            <Button key={style} variant="outline" size="sm">
                              {style}
                            </Button>
                          )
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Decals */}
                  {tool.id === "decals" && (
                    <Card className="bg-card/80 border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Decal Options</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-2">
                        {["Stripes", "Flames", "Racing", "Custom"].map(
                          (decal) => (
                            <Button key={decal} variant="outline" size="sm">
                              {decal}
                            </Button>
                          )
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Headlights / Taillights */}
                  {(tool.id === "headlights" || tool.id === "taillights") && (
                    <Card className="bg-card/80 border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          {tool.name} Colors
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-2">
                        {lightOptions.map((opt) => (
                          <Button key={opt} variant="outline" size="sm">
                            {opt}
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Under Glow */}
                  {tool.id === "underglow" && (
                    <>
                      <Card className="bg-card/80 border-border mb-3">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Glow Colors</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-4 gap-2">
                          {colorOptions.map((c, i) => (
                            <button
                              key={i}
                              style={{ backgroundColor: c }}
                              className="w-8 h-8 rounded-md border hover:scale-110 transition"
                            />
                          ))}
                        </CardContent>
                      </Card>
                      <AdjustmentCard
                        title="Glow Intensity"
                        sliders={["Intensity"]}
                      />
                    </>
                  )}

                  {/* Window Tint */}
                  {tool.id === "windowtint" && (
                    <Card className="bg-card/80 border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Tint Levels</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-2">
                        {tintOptions.map((t) => (
                          <Button key={t} variant="outline" size="sm">
                            {t}
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* 🔧 Small reusable adjustment card component */
const AdjustmentCard = ({
  title,
  sliders,
}: {
  title: string;
  sliders: string[];
}) => (
  <Card className="bg-card/80 border-border">
    <CardHeader className="pb-2 flex items-center gap-2">
      <SlidersHorizontal className="w-4 h-4" />
      <CardTitle className="text-sm">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {sliders.map((label) => (
        <div key={label}>
          <label className="text-xs">{label}</label>
          <input
            type="range"
            min="0"
            max="100"
            className="w-full accent-primary"
          />
        </div>
      ))}
    </CardContent>
  </Card>
);

export default ARStudio;
