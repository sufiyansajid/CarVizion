import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Camera,
  Upload,
  Palette,
  Settings,
  Sticker,
  Save,
  Undo2,
  Redo2,
  Play,
  Square,
} from "lucide-react";

const ARStudio = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedTool, setSelectedTool] = useState("colors");
  const [opacity, setOpacity] = useState([80]);
  const [size, setSize] = useState([50]);
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
    { id: "colors", name: "Colors", icon: Palette },
    { id: "rims", name: "Rims", icon: Settings },
    { id: "decals", name: "Decals", icon: Sticker },
  ];

  const colorOptions = [
    "#ff5e1a", // Primary
    "#ef4444", // Red
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Yellow
    "#8b5cf6", // Purple
    "#ffffff", // White
    "#000000", // Black
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4 animate-slideIn">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AR Customization Studio
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="animate-glow">
                  <Undo2 className="w-4 h-4 mr-2" />
                  Undo
                </Button>
                <Button variant="outline" size="sm" className="animate-glow">
                  <Redo2 className="w-4 h-4 mr-2" />
                  Redo
                </Button>
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Design
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Canvas Area */}
        <div className="lg:col-span-3">
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20 h-[600px]">
            <CardContent className="p-6 h-full">
              <div className="relative h-full rounded-lg overflow-hidden bg-secondary/20">
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Car for customization"
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

                    {/* Camera Controls */}
                    <div className="flex gap-4 mb-4">
                      <Button
                        variant={isRecording ? "destructive" : "default"}
                        onClick={() => setIsRecording(!isRecording)}
                        className="animate-glow"
                      >
                        {isRecording ? (
                          <>
                            <Square className="w-4 h-4 mr-2" />
                            Stop Camera
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Camera
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="animate-glow"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                    </div>

                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {/* AR Overlay Elements would go here */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Placeholder for AR modifications */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customization Toolbar */}
        <div className="space-y-4">
          {/* Tool Selection */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {customizationTools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedTool(tool.id)}
                >
                  <tool.icon className="w-4 h-4 mr-2" />
                  {tool.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Color Palette */}
          {selectedTool === "colors" && (
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 animate-slideIn">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {colorOptions.map((color, index) => (
                    <button
                      key={index}
                      className="w-10 h-10 rounded-lg border-2 border-border hover:border-primary transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => {}}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rims Options */}
          {selectedTool === "rims" && (
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 animate-slideIn">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Rim Styles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {["Sport", "Classic", "Racing", "Luxury"].map((style) => (
                    <Button
                      key={style}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {style}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Decals */}
          {selectedTool === "decals" && (
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 animate-slideIn">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Decals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {["Stripes", "Flames", "Racing", "Custom"].map((decal) => (
                    <Button
                      key={decal}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {decal}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Adjustment Controls */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Opacity
                </label>
                <Slider
                  value={opacity}
                  onValueChange={setOpacity}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">
                  {opacity[0]}%
                </span>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Size</label>
                <Slider
                  value={size}
                  onValueChange={setSize}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">
                  {size[0]}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ARStudio;
