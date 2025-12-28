import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Unused: Input import removed
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
// Unused: designApi, api imports removed
import {
  Camera,
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
  SlidersHorizontal,
  Box,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
// Import the Wrapper Components
import CarModel3D from "@/components/CarModel3D";
import TwoDStudio from "@/components/TwoDStudio";
import VideoStudio from "@/components/VideoStudio";
import { CAR_MODELS } from "@/config/carModels";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Car } from "lucide-react";

const ARStudio = () => {
  const [activeTab, setActiveTab] = useState("3d");
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedModel, setSelectedModel] = useState(CAR_MODELS[0]);

  // 3D Model View State
  const [debugMode, setDebugMode] = useState(false);

  // Customization States (Shared)
  const [bodyColor, setBodyColor] = useState<string | undefined>(undefined);
  const [rimColor, setRimColor] = useState<string | undefined>(undefined);
  const [windowTint, setWindowTint] = useState<number>(0);
  const metalness = 0.8;
  const roughness = 0.2;
  const underglowColor = undefined;
  const underglowIntensity = 0;
  const [headlightColor, setHeadlightColor] = useState<string | undefined>(undefined);
  const [taillightColor, setTaillightColor] = useState<string | undefined>(undefined);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [spoilerStyle, setSpoilerStyle] = useState<string>("wing");
  const [decalUrl, setDecalUrl] = useState<string | null>(null);
  const [wrapType, setWrapType] = useState<string | null>(null);

  // --- HELPER FOR 2D PROPS ---
  const getCurrentToolValue = () => {
    switch (selectedTool) {
      case "paint": return bodyColor;
      case "rims": return rimColor;
      case "windowtint": return windowTint > 0 ? "Dark" : "Light"; // Simplified for text prompt
      case "headlights": return headlightColor;
      case "underglow": return underglowColor;
      case "wraps": return wrapType;
      // Add more as needed
      default: return null;
    }
  };

  // --- INTERACTION HANDLER ---
  const handlePartSelect = (partId: string) => {
    if (selectedTool !== partId) {
      setSelectedTool(partId);
      // Helper to get tool name for Toast
      const toolName = customizationTools.find(t => t.id === partId)?.name || partId;
      toast.info(`Editing ${toolName}`, { duration: 1500 });
    }
  };

  const customizationTools = [
    { id: "paint", name: "Paint", icon: PaintBucket },
    { id: "wraps", name: "Wraps", icon: PanelsTopLeft },
    { id: "rims", name: "Rims", icon: Settings },
    { id: "decals", name: "Decals", icon: Sticker },
    { id: "spoilers", name: "Spoilers", icon: Box },
    { id: "bumpers", name: "Bumpers", icon: CarFront },
    { id: "sideskirts", name: "Side Skirts", icon: CarFront },
    { id: "headlights", name: "Headlights", icon: Lightbulb },
    { id: "taillights", name: "Taillights", icon: Sun },
    { id: "underglow", name: "Under Glow", icon: Sparkles },
    { id: "windowtint", name: "Window Tint", icon: Palette },
  ];

  const colorOptions = ["#ff5e1a", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ffffff", "#000000"];
  const wrapOptions = ["Matte Black", "Chrome", "Carbon Fiber", "Camo", "Gloss Red"];
  const lightOptions = ["White", "Yellow", "Blue", "RGB Glow"];
  const tintOptions = ["Light", "Medium", "Dark", "Limo"];

  return (
    <div className="min-h-screen bg-background p-4 animate-slideIn">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                CarVizion Studio
              </CardTitle>
              <div className="flex gap-2">

                {activeTab === "3d" && (
                  <Button
                    variant={debugMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDebugMode(!debugMode)}
                    title="Debug mode: Color-code parts"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    {debugMode ? "Debug ON" : "Debug OFF"}
                  </Button>
                )}

                {/* Car Selection */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Car className="w-4 h-4 mr-2" /> Garage
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Select Vehicle</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      {CAR_MODELS.map((car: any) => (
                        <div
                          key={car.id}
                          className={cn(
                            "cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-accent",
                            selectedModel.id === car.id ? "border-primary bg-accent/50" : "border-muted"
                          )}
                          onClick={() => {
                            setSelectedModel(car);
                            toast.success(`Switched to ${car.name}`);
                          }}
                        >
                          <div className="aspect-video rounded-lg bg-muted mb-3 flex items-center justify-center">
                            <Car className="w-12 h-12 text-muted-foreground" />
                          </div>
                          <h3 className="font-bold">{car.name}</h3>
                          <p className="text-sm text-muted-foreground">{car.description}</p>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="default" onClick={() => toast.success("Feature coming soon")}>
                  <Save className="w-4 h-4 mr-2" /> Save Design
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Main Content Area (Tabs) */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="mb-4 flex items-center justify-center bg-card/80 p-2 rounded-lg border w-fit mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="3d"><Box className="w-4 h-4 mr-2" /> 3D Studio</TabsTrigger>
                <TabsTrigger value="2d"><Camera className="w-4 h-4 mr-2" /> 2D AI</TabsTrigger>
                <TabsTrigger value="video"><Video className="w-4 h-4 mr-2" /> AR Video</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 bg-card/80 backdrop-blur-sm border-primary/20 rounded-xl p-4 md:p-6 min-h-[600px]">
              <TabsContent value="3d" className="h-full mt-0">
                <div className="relative h-full rounded-lg overflow-hidden bg-secondary/20 flex items-center justify-center">
                  <CarModel3D
                    modelPath={selectedModel.path}
                    bodyColor={bodyColor}
                    rimColor={rimColor}
                    windowTint={windowTint}
                    metalness={metalness}
                    roughness={roughness}
                    underglowColor={underglowColor}
                    underglowIntensity={underglowIntensity}
                    headlightColor={headlightColor}
                    debugMode={debugMode}
                    showSpoiler={showSpoiler}
                    decalUrl={decalUrl || undefined}
                    onPartSelect={handlePartSelect}
                  />
                </div>
              </TabsContent>

                <div className="flex-1 bg-card/80 backdrop-blur-sm border-primary/20 rounded-xl p-4 md:p-6 min-h-[600px]">
                    <TabsContent value="3d" className="h-full mt-0">
                         <div className="relative h-full rounded-lg overflow-hidden bg-secondary/20 flex items-center justify-center">
                            <CarModel3D
                              modelPath={selectedModel.path}
                              bodyColor={bodyColor}
                              rimColor={rimColor}
                              windowTint={windowTint}
                              metalness={metalness}
                              roughness={roughness}
                              underglowColor={underglowColor}
                              underglowIntensity={underglowIntensity}
                              headlightColor={headlightColor}
                              taillightColor={taillightColor}
                              wrapType={wrapType || undefined}
                              spoilerStyle={spoilerStyle}
                              spoilerColor={bodyColor}
                              debugMode={debugMode}
                              showSpoiler={showSpoiler}
                              decalUrl={decalUrl || undefined}
                              onPartSelect={handlePartSelect}
                            />
                         </div>
                    </TabsContent>
              <TabsContent value="2d" className="h-full mt-0">
                <TwoDStudio
                  selectedTool={selectedTool}
                  toolValue={getCurrentToolValue()}
                  toolName={customizationTools.find(t => t.id === selectedTool)?.name}
                />
              </TabsContent>

              <TabsContent value="video" className="h-full mt-0">
                <VideoStudio selectedTool={selectedTool} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Sidebar Tools (Shared across tabs) */}
        <div className="space-y-3 order-1 lg:order-2 sticky top-4 overflow-y-auto max-h-[80vh]">
          <Card className="bg-card/90 mb-4 border-l-4 border-l-primary">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground mb-1">Current Mode</p>
              <h3 className="text-lg font-bold flex items-center">
                {activeTab === "3d" ? <><Box className="w-4 h-4 mr-2 text-primary" /> 3D Interactive</> :
                  activeTab === "2d" ? <><Camera className="w-4 h-4 mr-2 text-blue-500" /> 2D AI Gen</> :
                    <><Video className="w-4 h-4 mr-2 text-red-500" /> AR Video</>}
              </h3>
            </CardContent>
          </Card>

          {customizationTools.map((tool) => (
            <div key={tool.id}>
              <Button
                variant={selectedTool === tool.id ? "default" : "outline"}
                className={cn(
                  "w-full justify-start transition-all",
                  selectedTool === tool.id ? "text-primary-foreground" : "text-foreground"
                )}
                onClick={() => setSelectedTool(selectedTool === tool.id ? "" : tool.id)}
              >
                <tool.icon className="w-4 h-4 mr-2" />
                {tool.name}
              </Button>

              {/* Collapsible Panels */}
              {selectedTool === tool.id && (
                <div className="mt-2 transition-all duration-300 animate-in slide-in-from-top-2">
                  {/* Paint Panel */}
                  {tool.id === "paint" && (
                    <Card className="bg-card/80 border-border mb-3">
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Body Paint</CardTitle></CardHeader>
                      <CardContent className="grid grid-cols-4 gap-2">
                        {colorOptions.map((c, i) => (
                          <button key={i} style={{ backgroundColor: c }}
                            className={cn("w-8 h-8 rounded border", bodyColor === c && "ring-2 ring-primary")}
                            onClick={() => setBodyColor(c)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {/* Wraps Panel */}
                  {tool.id === "wraps" && (
                    <Card className="bg-card/80 border-border mb-3">
                      <CardContent className="grid grid-cols-2 gap-2 mt-4">
                        {wrapOptions.map((w, i) => (
                          <Button key={i} variant={wrapType === w ? "default" : "secondary"} size="sm" onClick={() => setWrapType(w)}>
                            {w}
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {/* Rims Panel */}
                  {tool.id === "rims" && (
                    <Card className="bg-card/80 border-border mb-3">
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Rim Colors</CardTitle></CardHeader>
                      <CardContent className="grid grid-cols-4 gap-2">
                        {colorOptions.map((c, i) => (
                          <button key={i} style={{ backgroundColor: c }}
                            className={cn("w-8 h-8 rounded border", rimColor === c && "ring-2 ring-primary")}
                            onClick={() => setRimColor(c)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {/* Window Tint Panel */}
                  {tool.id === "windowtint" && (
                    <Card className="bg-card/80 border-border mb-3">
                      <CardContent className="grid grid-cols-2 gap-2 mt-4">
                        {tintOptions.map((t, idx) => (
                          <Button key={t} size="sm" variant={windowTint === idx * 0.25 ? "default" : "outline"} onClick={() => setWindowTint(idx * 0.25)}>{t}</Button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {/* Headlights Panel */}
                  {tool.id === "headlights" && (
                      <Card className="bg-card/80 border-border mb-3">
                          <CardContent className="grid grid-cols-2 gap-2 mt-4">
                             {lightOptions.map(l => (
                                 <Button key={l} size="sm" variant={headlightColor === (l === "White" ? "#ffffff" : l === "Yellow" ? "#ffff00" : "#0000ff") ? "default" : "outline"} 
                                    onClick={() => setHeadlightColor(l === "White" ? "#ffffff" : l === "Yellow" ? "#ffff00" : "#0000ff")}
                                 >{l}</Button>
                             ))}
                          </CardContent>
                      </Card>
                    <Card className="bg-card/80 border-border mb-3">
                      <CardContent className="grid grid-cols-2 gap-2 mt-4">
                        {lightOptions.map(l => (
                          <Button key={l} size="sm" variant="outline"
                            onClick={() => setHeadlightColor(l === "White" ? "#ffffff" : l === "Yellow" ? "#ffff00" : "#0000ff")}
                          >{l}</Button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {/* Taillights Panel */}
                  {tool.id === "taillights" && (
                      <Card className="bg-card/80 border-border mb-3">
                          <CardHeader className="pb-2"><CardTitle className="text-sm">Taillight Colors</CardTitle></CardHeader>
                          <CardContent className="grid grid-cols-4 gap-2">
                             {["#ff0000", "#ff3300", "#cc0000", "#ff6600", "#990000", "#ffffff", "#ff00ff", "#ffff00"].map((c, i) => (
                                 <button key={i} style={{backgroundColor: c}} 
                                     className={cn("w-8 h-8 rounded border", taillightColor === c && "ring-2 ring-primary")}
                                     onClick={() => setTaillightColor(c)} 
                                 />
                             ))}
                          </CardContent>
                      </Card>
                  )}
                  {/* Spoilers Panel */}
                  {tool.id === "spoilers" && (
                      <Card className="bg-card/80 border-border mb-3">
                          <CardContent className="space-y-3 mt-4">
                             <div className="flex items-center justify-between">
                               <span className="text-sm">Show Spoiler</span>
                               <Button size="sm" variant={showSpoiler ? "default" : "outline"} onClick={() => setShowSpoiler(!showSpoiler)}>
                                 {showSpoiler ? "ON" : "OFF"}
                               </Button>
                             </div>
                             {showSpoiler && (
                               <div className="grid grid-cols-2 gap-2 pt-2">
                                 {["Wing", "Ducktail", "Lip", "GT"].map(s => (
                                   <Button key={s} size="sm" variant={spoilerStyle === s.toLowerCase() ? "default" : "secondary"} onClick={() => setSpoilerStyle(s.toLowerCase())}>{s}</Button>
                                 ))}
                               </div>
                             )}
                          </CardContent>
                      </Card>
                  )}
                  {/* Underglow Panel */}
                  {tool.id === "underglow" && (
                      <Card className="bg-card/80 border-border mb-3">
                          <CardHeader className="pb-2"><CardTitle className="text-sm">Underglow</CardTitle></CardHeader>
                          <CardContent className="space-y-3">
                             <div className="grid grid-cols-4 gap-2">
                               {["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#00ffff", "#ffff00", "#ff6600", "#ffffff"].map((c, i) => (
                                   <button key={i} style={{backgroundColor: c}} 
                                       className={cn("w-8 h-8 rounded border", underglowColor === c && "ring-2 ring-primary")}
                                       onClick={() => { setUnderglowColor(c); setUnderglowIntensity(1); }} 
                                   />
                               ))}
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-xs">Intensity</span>
                               <input type="range" min="0" max="2" step="0.1" value={underglowIntensity} 
                                 onChange={(e) => setUnderglowIntensity(parseFloat(e.target.value))} 
                                 className="flex-1 h-2 bg-secondary rounded-lg cursor-pointer"
                               />
                             </div>
                          </CardContent>
                      </Card>
                  )}
                  {/* Decals Panel */}
                  {tool.id === "decals" && (
                      <Card className="bg-card/80 border-border mb-3">
                          <CardContent className="space-y-3 mt-4">
                             <p className="text-xs text-muted-foreground">Select preset decals:</p>
                             <div className="grid grid-cols-2 gap-2">
                               {["Flames", "Stripes", "Racing", "Logo"].map(d => (
                                 <Button key={d} size="sm" variant={decalUrl?.includes(d.toLowerCase()) ? "default" : "secondary"} 
                                   onClick={() => setDecalUrl(`/decals/${d.toLowerCase()}.png`)}>
                                   {d}
                                 </Button>
                               ))}
                             </div>
                             <Button size="sm" variant="outline" className="w-full" onClick={() => setDecalUrl(null)}>Clear Decal</Button>
                          </CardContent>
                      </Card>
                  )}
                  {/* Bumpers - Coming Soon */}
                  {tool.id === "bumpers" && (
                      <Card className="bg-card/80 border-border mb-3">
                          <CardContent className="py-6 text-center text-muted-foreground">
                            <p className="text-sm">🚧 Coming Soon</p>
                            <p className="text-xs mt-1">Requires custom 3D models</p>
                          </CardContent>
                      </Card>
                  )}
                  {/* Side Skirts - Coming Soon */}
                  {tool.id === "sideskirts" && (
                      <Card className="bg-card/80 border-border mb-3">
                          <CardContent className="py-6 text-center text-muted-foreground">
                            <p className="text-sm">🚧 Coming Soon</p>
                            <p className="text-xs mt-1">Requires custom 3D models</p>
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

export default ARStudio;