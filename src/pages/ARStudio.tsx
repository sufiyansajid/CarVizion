import React, { useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { designApi } from "@/store/designStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Lazy load heavy components
const CarModel3D = lazy(() => import("@/components/CarModel3D"));
const TwoDStudio = lazy(() => import("@/components/TwoDStudio"));
const VideoStudio = lazy(() => import("@/components/VideoStudio"));

import { CAR_MODELS, getCarTypeBadge, type CarModelConfig } from "@/config/carModels";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Car } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";
import type { ColorSuggestion } from "@/utils/colorAI";
import VerticalToolbar from "@/components/VerticalToolbar";

// Loading fallback for lazy components
const StudioLoadingFallback = () => (
  <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-4 bg-secondary/20 rounded-lg">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
    <p className="text-muted-foreground">Loading studio...</p>
  </div>
);

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
  const [metalness, setMetalness] = useState<number>(0.3); // Reduced from 0.8 for realistic car paint
  const [roughness, setRoughness] = useState<number>(0.4); // Increased from 0.2 for matte finish
  const [underglowColor, setUnderglowColor] = useState<string | undefined>(undefined);
  const [underglowIntensity, setUnderglowIntensity] = useState<number>(0);
  const [headlightColor, setHeadlightColor] = useState<string | undefined>(undefined);
  const [taillightColor, setTaillightColor] = useState<string | undefined>(undefined);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [spoilerStyle, setSpoilerStyle] = useState<string>("wing");
  const [rimStyle, setRimStyle] = useState<'sport' | 'classic' | 'mesh' | 'deepdish' | 'stock'>('sport');
  const [decalUrl, setDecalUrl] = useState<string | null>(null);
  const [wrapType, setWrapType] = useState<string | null>(null);

  // Save Design State
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [designName, setDesignName] = useState("");
  const [designDescription, setDesignDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Debounced values for performance - reduces 3D re-renders during color selection
  const debouncedBodyColor = useDebounce(bodyColor, 150);
  const debouncedRimColor = useDebounce(rimColor, 150);
  const debouncedUnderglowColor = useDebounce(underglowColor, 150);
  const debouncedHeadlightColor = useDebounce(headlightColor, 150);
  const debouncedTaillightColor = useDebounce(taillightColor, 150);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+s': () => {
      if (!saveDialogOpen) {
        setSaveDialogOpen(true);
      } else if (designName.trim()) {
        handleSaveDesign();
      }
    },
    'escape': () => {
      if (saveDialogOpen) setSaveDialogOpen(false);
    },
  });

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

  // --- SAVE DESIGN HANDLER ---
  const handleSaveDesign = async () => {
    if (!designName.trim()) {
      toast.error("Please enter a design name");
      return;
    }

    setIsSaving(true);
    try {
      const designData = {
        name: designName.trim(),
        description: designDescription.trim() || `Custom ${selectedModel.name} design`,
        model_data: {
          modelId: selectedModel.id,
          modelPath: selectedModel.path,
        },
        color_data: {
          bodyColor,
          rimColor,
          windowTint,
          underglowColor,
          underglowIntensity,
          headlightColor,
          taillightColor,
        },
        parts_data: {
          showSpoiler,
          spoilerStyle,
          wrapType,
          decalUrl,
        },
      };

      await designApi.createDesign(designData);
      toast.success("Design saved successfully!");
      setSaveDialogOpen(false);
      setDesignName("");
      setDesignDescription("");
    } catch (error: any) {
      console.error("Failed to save design:", error);
      toast.error(error.response?.data?.message || "Failed to save design. Please try again.");
    } finally {
      setIsSaving(false);
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

  // Helper function to render tool panels (used for mobile view)
  const renderToolPanel = (toolId: string) => {
    switch (toolId) {
      case "paint":
        return (
          <Card className="bg-card/80 border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Body Paint</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-6 gap-2">
              {colorOptions.map((c, i) => (
                <button key={i} style={{ backgroundColor: c }}
                  className={cn("w-8 h-8 rounded border", bodyColor === c && "ring-2 ring-primary")}
                  onClick={() => setBodyColor(c)}
                />
              ))}
            </CardContent>
          </Card>
        );
      case "wraps":
        return (
          <Card className="bg-card/80 border-border">
            <CardContent className="grid grid-cols-2 gap-2 pt-4">
              {wrapOptions.map((w, i) => (
                <Button key={i} variant={wrapType === w ? "default" : "secondary"} size="sm" onClick={() => setWrapType(w)}>
                  {w}
                </Button>
              ))}
            </CardContent>
          </Card>
        );
      case "rims":
        return (
          <Card className="bg-card/80 border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Rim Colors</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-6 gap-2">
              {colorOptions.map((c, i) => (
                <button key={i} style={{ backgroundColor: c }}
                  className={cn("w-8 h-8 rounded border", rimColor === c && "ring-2 ring-primary")}
                  onClick={() => setRimColor(c)}
                />
              ))}
            </CardContent>
          </Card>
        );
      case "windowtint":
        return (
          <Card className="bg-card/80 border-border">
            <CardContent className="grid grid-cols-4 gap-2 pt-4">
              {tintOptions.map((t, idx) => (
                <Button key={t} size="sm" variant={windowTint === idx * 0.25 ? "default" : "outline"} onClick={() => setWindowTint(idx * 0.25)}>{t}</Button>
              ))}
            </CardContent>
          </Card>
        );
      case "headlights":
        return (
          <Card className="bg-card/80 border-border">
            <CardContent className="grid grid-cols-2 gap-2 pt-4">
              {lightOptions.map(l => (
                <Button key={l} size="sm" variant={headlightColor === (l === "White" ? "#ffffff" : l === "Yellow" ? "#ffff00" : "#0000ff") ? "default" : "outline"} 
                  onClick={() => setHeadlightColor(l === "White" ? "#ffffff" : l === "Yellow" ? "#ffff00" : "#0000ff")}
                >{l}</Button>
              ))}
            </CardContent>
          </Card>
        );
      case "underglow":
        return (
          <Card className="bg-card/80 border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Underglow Color</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-6 gap-2">
              {colorOptions.map((c, i) => (
                <button key={i} style={{ backgroundColor: c }}
                  className={cn("w-8 h-8 rounded border", underglowColor === c && "ring-2 ring-primary")}
                  onClick={() => setUnderglowColor(c)}
                />
              ))}
            </CardContent>
          </Card>
        );
      case "spoilers":
        return (
          <Card className="bg-card/80 border-border">
            <CardContent className="pt-4">
              <Button variant={showSpoiler ? "default" : "outline"} size="sm" className="w-full" onClick={() => setShowSpoiler(!showSpoiler)}>
                {showSpoiler ? "Hide Spoiler" : "Show Spoiler"}
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card className="bg-card/80 border-border">
            <CardContent className="py-6 text-center text-muted-foreground">
              <p className="text-sm">🚧 Coming Soon</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 animate-slideIn">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4 sm:mb-6">
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Studio
              </CardTitle>
              <div className="flex flex-wrap gap-2">

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
                      <DialogTitle className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-primary" />
                        Select Your Vehicle
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                      {CAR_MODELS.map((car: CarModelConfig) => {
                        const typeBadge = getCarTypeBadge(car.type);
                        return (
                          <div
                            key={car.id}
                            className={cn(
                              "cursor-pointer rounded-xl border-2 p-4 transition-all hover:scale-[1.02] hover:shadow-lg",
                              selectedModel.id === car.id 
                                ? "border-primary bg-primary/5 shadow-md" 
                                : "border-muted hover:border-primary/50"
                            )}
                            onClick={() => {
                              setSelectedModel(car);
                              toast.success(`Switched to ${car.name}`);
                            }}
                          >
                            <div className="aspect-video rounded-lg bg-gradient-to-br from-secondary to-muted mb-3 flex items-center justify-center relative overflow-hidden group">
                              {car.thumbnail ? (
                                <img 
                                  src={car.thumbnail} 
                                  alt={car.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={cn("flex items-center justify-center", car.thumbnail ? "hidden" : "")}>
                                <Car className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                              {selectedModel.id === car.id && (
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-foreground">{car.name}</h3>
                              <Badge variant="secondary" className={typeBadge.className}>
                                {typeBadge.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{car.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Save Design Dialog */}
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" title="Save Design (Ctrl+S)">
                      <Save className="w-4 h-4 mr-2" /> Save Design
                      <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-primary-foreground/20 rounded hidden sm:inline">⌘S</kbd>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Save className="w-5 h-5 text-primary" />
                        Save Your Design
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="designName">Design Name *</Label>
                        <Input
                          id="designName"
                          placeholder="Enter a name for your design"
                          value={designName}
                          onChange={(e) => setDesignName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="designDescription">Description (optional)</Label>
                        <Input
                          id="designDescription"
                          placeholder="Describe your customization"
                          value={designDescription}
                          onChange={(e) => setDesignDescription(e.target.value)}
                        />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-sm">
                        <p className="font-medium mb-1">Design includes:</p>
                        <ul className="text-muted-foreground space-y-1">
                          <li>• Vehicle: {selectedModel.name}</li>
                          {bodyColor && <li>• Body Color: {bodyColor}</li>}
                          {rimColor && <li>• Rim Color: {rimColor}</li>}
                          {wrapType && <li>• Wrap: {wrapType}</li>}
                          {showSpoiler && <li>• Spoiler: Enabled</li>}
                        </ul>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSaveDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleSaveDesign}
                          disabled={isSaving || !designName.trim()}
                        >
                          {isSaving ? "Saving..." : "Save Design"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="w-full flex gap-0 overflow-hidden">

        {/* Main Content Area (Tabs) - Full width */}
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="mb-4 flex items-center justify-center bg-card/80 p-2 rounded-lg border w-fit mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="3d" className="text-xs sm:text-sm"><Box className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /><span className="hidden xs:inline">3D</span><span className="xs:hidden">3D</span><span className="hidden sm:inline"> Studio</span></TabsTrigger>
                <TabsTrigger value="2d" className="text-xs sm:text-sm"><Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /><span className="hidden xs:inline">2D</span><span className="xs:hidden">2D</span><span className="hidden sm:inline"> AI</span></TabsTrigger>
                <TabsTrigger value="video" className="text-xs sm:text-sm"><Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /><span className="hidden xs:inline">AR</span><span className="xs:hidden">AR</span><span className="hidden sm:inline"> Video</span></TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 bg-card/80 backdrop-blur-sm border-primary/20 rounded-xl p-2 sm:p-4 md:p-6 min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
              <TabsContent value="3d" className="h-full mt-0">
                <Suspense fallback={<StudioLoadingFallback />}>
                  <div className="relative h-full rounded-lg overflow-hidden bg-secondary/20 flex items-center justify-center">
                    <CarModel3D
                      modelPath={selectedModel.path}
                      bodyColor={debouncedBodyColor}
                      rimColor={debouncedRimColor}
                      windowTint={windowTint}
                      metalness={metalness}
                      roughness={roughness}
                      underglowColor={debouncedUnderglowColor}
                      underglowIntensity={underglowIntensity}
                      headlightColor={debouncedHeadlightColor}
                      taillightColor={debouncedTaillightColor}
                      debugMode={debugMode}
                      showSpoiler={showSpoiler}
                      spoilerStyle={spoilerStyle}
                      rimStyle={rimStyle}
                      decalUrl={decalUrl || undefined}
                      onPartSelect={handlePartSelect}
                    />
                  </div>
                </Suspense>
              </TabsContent>

              <TabsContent value="2d" className="h-full mt-0">
                <Suspense fallback={<StudioLoadingFallback />}>
                  <TwoDStudio
                    selectedTool={selectedTool}
                    toolValue={getCurrentToolValue()}
                    toolName={customizationTools.find(t => t.id === selectedTool)?.name}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="video" className="h-full mt-0">
                <Suspense fallback={<StudioLoadingFallback />}>
                  <VideoStudio selectedTool={selectedTool} />
                </Suspense>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Vertical Icon Toolbar - RIGHT SIDE - Desktop only */}
        <div className="hidden lg:flex flex-shrink-0 gap-0">
          <VerticalToolbar 
            tools={customizationTools}
            selectedTool={selectedTool}
            onToolSelect={(toolId) => setSelectedTool(selectedTool === toolId ? "" : toolId)}
          />
          
          {/* Slide-out Panel for Tool Options */}
          {selectedTool && (
            <div className="w-80 bg-card/95 backdrop-blur-sm border-l border-border p-4 animate-in slide-in-from-right-5 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {React.createElement(customizationTools.find(t => t.id === selectedTool)?.icon || Box, { className: "w-5 h-5 text-primary" })}
                  {customizationTools.find(t => t.id === selectedTool)?.name}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTool("")}>
                  ✕
                </Button>
              </div>
              
              <div className="space-y-3">
                {/* Paint Panel */}
                {selectedTool === "paint" && (
                  <ColorPicker 
                    label="Body Paint"
                    color={bodyColor || "#ff5e1a"}
                    onChange={setBodyColor}
                    carModelName={selectedModel.name}
                    onMaterialChange={(m, r) => {
                      setMetalness(m);
                      setRoughness(r);
                    }}
                    onApplySuggestion={(suggestion: ColorSuggestion) => {
                      setBodyColor(suggestion.colors.body);
                      setRimColor(suggestion.colors.rims);
                      toast.success(`Applied: ${suggestion.name} 🎨`);
                    }}
                  />
                )}
                
                {/* Wraps Panel */}
                {selectedTool === "wraps" && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Wrap Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {wrapOptions.map((w, i) => (
                        <Button key={i} variant={wrapType === w ? "default" : "secondary"} 
                          size="sm" onClick={() => setWrapType(w)} className="w-full">
                          {w}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Rims Panel */}
                {selectedTool === "rims" && (
                  <div className="space-y-4">
                    {/* Rim Style Selector */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Rim Style</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'sport', label: 'Sport', emoji: '⚡' },
                          { value: 'classic', label: 'Classic', emoji: '👑' },
                          { value: 'mesh', label: 'Mesh', emoji: '🕸️' },
                          { value: 'deepdish', label: 'Deep Dish', emoji: '🥘' },
                          { value: 'stock', label: 'Stock', emoji: '🔧' }
                        ].map((style) => (
                          <Button
                            key={style.value}
                            variant={rimStyle === style.value ? "default" : "secondary"}
                            size="sm"
                            onClick={() => setRimStyle(style.value as any)}
                            className="w-full"
                          >
                            <span className="mr-1">{style.emoji}</span>
                            {style.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Rim Color Picker */}
                    <ColorPicker 
                      label="Rim Color"
                      color={rimColor || "#ffffff"}
                      onChange={setRimColor}
                      carModelName={selectedModel.name}
                      onApplySuggestion={(suggestion: ColorSuggestion) => {
                        setRimColor(suggestion.colors.rims);
                        setBodyColor(suggestion.colors.body);
                        toast.success(`Applied: ${suggestion.name} 🎨`);
                      }}
                    />
                  </div>
                )}
                
                {/* Window Tint Panel */}
                {selectedTool === "windowtint" && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Window Tint</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {tintOptions.map((t, idx) => (
                        <Button key={t} size="sm" 
                          variant={windowTint === idx * 0.25 ? "default" : "outline"}
                          onClick={() => setWindowTint(idx * 0.25)} className="w-full">
                          {t}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Headlights Panel */}
                {selectedTool === "headlights" && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Headlight Color</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {lightOptions.map(l => (
                        <Button key={l} size="sm" 
                          variant={headlightColor === (l === "White" ? "#ffffff" : l === "Yellow" ? "#ffff00" : "#0000ff") ? "default" : "outline"}
                          onClick={() => setHeadlightColor(l === "White" ? "#ffffff" : l === "Yellow" ? "#ffff00" : "#0000ff")}
                          className="w-full">
                          {l}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Taillights Panel */}
                {selectedTool === "taillights" && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Taillight Color</Label>
                    <ColorPicker 
                      label="Taillight Color"
                      color={taillightColor || "#ff0000"}
                      onChange={setTaillightColor}
                    />
                  </div>
                )}
                
                {/* Underglow Panel */}
                {selectedTool === "underglow" && (
                  <div className="space-y-4">
                    <ColorPicker 
                      label="Underglow Color"
                      color={underglowColor || "#ff0000"}
                      onChange={setUnderglowColor}
                      carModelName={selectedModel.name}
                      onApplySuggestion={(suggestion: ColorSuggestion) => {
                        setUnderglowColor(suggestion.colors.accents);
                        toast.success(`Applied: ${suggestion.name} 🎨`);
                      }}
                    />
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Intensity</Label>
                      <input type="range" min="0" max="2" step="0.1" value={underglowIntensity}
                        onChange={(e) => setUnderglowIntensity(parseFloat(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                )}
                
                {/* Spoilers Panel */}
                {selectedTool === "spoilers" && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Show Spoiler</Label>
                      <Button size="sm" variant={showSpoiler ? "default" : "outline"}
                        onClick={() => setShowSpoiler(!showSpoiler)}>
                        {showSpoiler ? "ON" : "OFF"}
                      </Button>
                    </div>
                    {showSpoiler && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Spoiler Style</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Wing", "Ducktail", "Lip", "GT"].map(s => (
                            <Button key={s} size="sm" 
                              variant={spoilerStyle === s.toLowerCase() ? "default" : "secondary"}
                              onClick={() => setSpoilerStyle(s.toLowerCase())} className="w-full">
                              {s}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Decals Panel */}
                {selectedTool === "decals" && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Preset Decals</Label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {["Flames", "Stripes", "Racing", "Logo"].map(d => (
                        <Button key={d} size="sm" 
                          variant={decalUrl?.includes(d.toLowerCase()) ? "default" : "secondary"}
                          onClick={() => setDecalUrl(`/decals/${d.toLowerCase()}.png`)} className="w-full">
                          {d}
                        </Button>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="w-full" 
                      onClick={() => setDecalUrl(null)}>
                      Clear Decal
                    </Button>
                  </div>
                )}
                
                {/* Coming Soon for other tools */}
                {["bumpers", "sideskirts"].includes(selectedTool) && (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-sm">🚧 Coming Soon</p>
                    <p className="text-xs mt-1">Requires custom 3D models</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* OLD Sidebar Tools - Hidden, keeping for reference */}
        <div className="hidden" style={{ display: 'none' }}>
          {/* Mobile Horizontal Toolbar */}
          <div className="lg:hidden">
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-4 px-4">
              {customizationTools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "flex-shrink-0 transition-all",
                    selectedTool === tool.id ? "text-primary-foreground" : "text-foreground"
                  )}
                  onClick={() => setSelectedTool(selectedTool === tool.id ? "" : tool.id)}
                >
                  <tool.icon className="w-4 h-4 mr-1" />
                  <span className="text-xs">{tool.name}</span>
                </Button>
              ))}
            </div>
            {/* Mobile Tool Panel - Inline */}
            {selectedTool && (
              <div className="mt-3 animate-in slide-in-from-top-2">
                {renderToolPanel(selectedTool)}
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
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
          </div>{/* End Desktop Sidebar */}
        </div>{/* End Sidebar Tools */}
      </div> {/* End flex container */}
    </div>
  );
};

export default ARStudio;