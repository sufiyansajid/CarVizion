import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { designApi } from "@/store/designStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useVoiceControl, parseVoiceCommand } from "@/hooks/useVoiceControl";
import {
  Camera,
  Palette,
  Settings,
  Sticker,
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
  Mic,
  MicOff,
  Car,
  Shield,
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

import { ColorPicker } from "@/components/ui/color-picker";
import type { ColorSuggestion } from "@/utils/colorAI";
import VerticalToolbar from "@/components/VerticalToolbar";
import { getDesignCritique } from "@/utils/designCritic";
import type { DesignState } from "@/utils/designCritic";
import { FeedbackModal } from "@/components/FeedbackModal";
import { ActivityLog, type LogEntry } from "@/components/ActivityLog";

// Loading fallback for lazy components
const StudioLoadingFallback = () => (
  <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-4 bg-secondary/20 rounded-lg">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
    <p className="text-muted-foreground">Loading studio...</p>
  </div>
);

interface DesignProfile {
  bodyColor?: string;
  rimColor?: string;
  windowTint: number;
  metalness: number;
  roughness: number;
  underglowColor?: string;
  underglowIntensity: number;
  headlightColor?: string;
  taillightColor?: string;
  showSpoiler: boolean;
  spoilerStyle: string;
  rimStyle: string;
  decalUrl?: string;
  wrapType?: string;
}

const ARStudio = () => {
  const [activeTab, setActiveTab] = useState("3d");
  const [selectedTool, setSelectedTool] = useState("");
  const [carModels, setCarModels] = useState<CarModelConfig[]>(CAR_MODELS);
  const [selectedModel, setSelectedModel] = useState(CAR_MODELS[0]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Mobile detection for Sheet visibility
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch models from backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoadingModels(true);
        const response = await fetch("http://localhost:3001/api/cars");
        const data = await response.json();
        if (data.cars && data.cars.length > 0) {
          setCarModels(data.cars);
          // Only set first model if not already set or if using default
          if (selectedModel.id === CAR_MODELS[0].id) {
            setSelectedModel(data.cars[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch car models:", error);
        toast.error("Using offline car models");
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure no spoilers on SUVs when model changes
  useEffect(() => {
    if (selectedModel.type === 'suv') {
      setShowSpoiler(false);
    }
  }, [selectedModel]);

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
  const [rimStyle, setRimStyle] = useState<string>('stock');
  const [decalUrl, setDecalUrl] = useState<string | undefined>(undefined);
  const [wrapType, setWrapType] = useState<string | undefined>(undefined);

  // 2D Studio Specific States (Decoupled from 3D)
  const [twoDBodyColor, setTwoDBodyColor] = useState<string | undefined>(undefined);
  const [twoDRimColor, setTwoDRimColor] = useState<string | undefined>(undefined);
  const [twoDRimStyle, setTwoDRimStyle] = useState<string>('stock');
  const [twoDWindowTint, setTwoDWindowTint] = useState<number>(0);
  const [twoDHeadlightColor, setTwoDHeadlightColor] = useState<string | undefined>(undefined);
  const [twoDUnderglowColor, setTwoDUnderglowColor] = useState<string | undefined>(undefined);
  const [twoDWrapType, setTwoDWrapType] = useState<string | undefined>(undefined);
  const [designReview, setDesignReview] = useState<{ title: string; rating: number; message: string } | null>(null);

  // Save Design State
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [designName, setDesignName] = useState("");
  const [designDescription, setDesignDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // --- LOADED DESIGN STATE (for editing saved designs) ---
  const [searchParams] = useSearchParams();
  const [loadedDesignId, setLoadedDesignId] = useState<number | null>(null);
  const [designLoaded, setDesignLoaded] = useState(false);

  // Debounced values for performance - reduces 3D re-renders during color selection
  const debouncedBodyColor = useDebounce(bodyColor, 150);
  const debouncedRimColor = useDebounce(rimColor, 150);
  const debouncedUnderglowColor = useDebounce(underglowColor, 150);
  const debouncedHeadlightColor = useDebounce(headlightColor, 150);
  const debouncedTaillightColor = useDebounce(taillightColor, 150);

  // --- STATE ISOLATION LOGIC ---
  const [designProfiles, setDesignProfiles] = useState<Record<string, DesignProfile>>({});
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync current selection to profile
  useEffect(() => {
    if (isSyncing || !selectedModel?.id) return;

    setDesignProfiles(prev => ({
      ...prev,
      [selectedModel.id]: {
        bodyColor, rimColor, windowTint, metalness, roughness,
        underglowColor, underglowIntensity, headlightColor, taillightColor,
        showSpoiler, spoilerStyle, rimStyle, decalUrl, wrapType
      }
    }));
  }, [bodyColor, rimColor, windowTint, metalness, roughness, underglowColor, underglowIntensity, headlightColor, taillightColor, showSpoiler, spoilerStyle, rimStyle, decalUrl, wrapType, isSyncing, selectedModel.id]);

  // Load profile when model changes
  useEffect(() => {
    const profile = designProfiles[selectedModel.id];
    setIsSyncing(true);

    // Ensure we are not on an SUV for spoilers
    const canHaveSpoiler = selectedModel.type !== 'suv';

    if (profile) {
      setBodyColor(profile.bodyColor);
      setRimColor(profile.rimColor);
      setWindowTint(profile.windowTint ?? 0);
      setMetalness(profile.metalness ?? 0.3);
      setRoughness(profile.roughness ?? 0.4);
      setUnderglowColor(profile.underglowColor);
      setUnderglowIntensity(profile.underglowIntensity ?? 0);
      setHeadlightColor(profile.headlightColor);
      setTaillightColor(profile.taillightColor);
      setShowSpoiler(canHaveSpoiler ? (profile.showSpoiler ?? false) : false);
      setSpoilerStyle(profile.spoilerStyle ?? "wing");
      setRimStyle(profile.rimStyle ?? "stock");
      setDecalUrl(profile.decalUrl);
      setWrapType(profile.wrapType);
    } else {
      // RESET TO DEFAULT FOR NEW CAR - Initial look is stock GLB
      setBodyColor(undefined);
      setRimColor(undefined);
      setWindowTint(0);
      setMetalness(0.5);
      setRoughness(0.5);
      setUnderglowColor(undefined);
      setUnderglowIntensity(0);
      setHeadlightColor(undefined);
      setTaillightColor(undefined);
      setShowSpoiler(false);
      setSpoilerStyle("wing");
      setRimStyle("stock");
      setDecalUrl(undefined);
      setWrapType(undefined);
    }

    const timer = setTimeout(() => setIsSyncing(false), 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel.id]);

  // --- ACTIVITY LOG STATE ---
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const lastLoggedRef = useRef<{ type: string, message: string, time: number } | null>(null);

  const addLog = (type: "system" | "color" | "part" | "navigation" | "voice", message: string) => {
    const now = Date.now();
    // Deduplicate: If same message & type within 2 seconds, ignore
    if (
      lastLoggedRef.current &&
      lastLoggedRef.current.type === type &&
      lastLoggedRef.current.message === message &&
      now - lastLoggedRef.current.time < 2000
    ) {
      return;
    }

    lastLoggedRef.current = { type, message, time: now };

    setLogs((prev) => [
      ...prev.slice(-19), // Keep last 20 logs
      {
        id: Math.random().toString(36).substring(7),
        time: new Date(),
        type,
        message,
        context: activeTab, // Capture current context
      },
    ]);
  };

  // --- LOAD SAVED DESIGN FROM URL ---
  useEffect(() => {
    const designIdParam = searchParams.get('designId');
    if (!designIdParam || designLoaded) return;

    const loadDesign = async () => {
      try {
        const id = parseInt(designIdParam, 10);
        if (isNaN(id)) return;

        const response = await designApi.getDesignById(id);
        const design = response.design;
        if (!design) return;

        // Set design metadata
        setLoadedDesignId(design.id);
        setDesignName(design.name || '');
        setDesignDescription(design.description || '');

        // Extract saved data
        const colorData = design.color_data as Record<string, unknown> || {};
        const partsData = design.parts_data as Record<string, unknown> || {};
        const modelData = design.model_data as Record<string, unknown> || {};

        // Build a DesignProfile from the saved design
        const loadedProfile: DesignProfile = {
          bodyColor: (colorData.bodyColor as string) || undefined,
          rimColor: (colorData.rimColor as string) || undefined,
          windowTint: (colorData.windowTint as number) ?? 0,
          metalness: (colorData.metalness as number) ?? 0.3,
          roughness: (colorData.roughness as number) ?? 0.4,
          underglowColor: (colorData.underglowColor as string) || undefined,
          underglowIntensity: (colorData.underglowIntensity as number) ?? 0,
          headlightColor: (colorData.headlightColor as string) || undefined,
          taillightColor: (colorData.taillightColor as string) || undefined,
          showSpoiler: (partsData.showSpoiler as boolean) ?? false,
          spoilerStyle: (partsData.spoilerStyle as string) || 'wing',
          rimStyle: (partsData.rimStyle as string) || 'stock',
          decalUrl: (partsData.decalUrl as string) || undefined,
          wrapType: (partsData.wrapType as string) || undefined,
        };

        // Pre-populate designProfiles BEFORE changing the model.
        // This ensures the model-change effect finds the profile and restores
        // from it instead of resetting to defaults.
        const targetModelId = modelData.modelId as string;
        if (targetModelId) {
          setDesignProfiles(prev => ({
            ...prev,
            [targetModelId]: loadedProfile,
          }));

          const matchingModel = carModels.find(m => m.id === targetModelId);
          if (matchingModel) {
            setSelectedModel(matchingModel);
          }
        } else {
          // No model ID saved — apply state directly to current model
          setBodyColor(loadedProfile.bodyColor);
          setRimColor(loadedProfile.rimColor);
          setWindowTint(loadedProfile.windowTint);
          setMetalness(loadedProfile.metalness);
          setRoughness(loadedProfile.roughness);
          setUnderglowColor(loadedProfile.underglowColor);
          setUnderglowIntensity(loadedProfile.underglowIntensity);
          setHeadlightColor(loadedProfile.headlightColor);
          setTaillightColor(loadedProfile.taillightColor);
          setShowSpoiler(loadedProfile.showSpoiler);
          setSpoilerStyle(loadedProfile.spoilerStyle);
          setRimStyle(loadedProfile.rimStyle);
          setDecalUrl(loadedProfile.decalUrl);
          setWrapType(loadedProfile.wrapType);
        }

        // Restore activity log
        const activityLog = (design.activity_log || []) as Array<{ type: string; message: string; context: string; time: string }>;
        const restoredLogs: LogEntry[] = activityLog.map((entry, i) => ({
          id: `restored-${i}-${Math.random().toString(36).substring(7)}`,
          time: new Date(entry.time),
          type: entry.type as LogEntry['type'],
          message: entry.message,
          context: entry.context,
        }));
        // Add the "loaded" log entry
        restoredLogs.push({
          id: Math.random().toString(36).substring(7),
          time: new Date(),
          type: 'system',
          message: `Loaded saved design: ${design.name}`,
          context: activeTab,
        });
        setLogs(restoredLogs);

        setDesignLoaded(true);
        toast.success(`Loaded design: ${design.name}`);
      } catch (error) {
        console.error('Failed to load design:', error);
        toast.error('Failed to load saved design');
      }
    };

    loadDesign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, carModels, designLoaded]);

  // REMOVED "Loaded Model" LOG
  // REMOVED "Switched Tab" LOG

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

  // Voice Control - 100% FREE!
  const handleVoiceCommand = useCallback((cmd: { transcript: string; confidence: number }) => {
    const parsed = parseVoiceCommand(cmd.transcript);
    if (!parsed) {
      toast.info(`Didn't understand: "${cmd.transcript}"`);
      return;
    }

    switch (parsed.action) {
      case 'setBodyColor':
        setBodyColor(parsed.value as string);
        toast.success(`Body color changed to ${parsed.colorName}`);
        addLog("voice", `Voice: Paint body ${parsed.colorName}`);
        break;
      case 'setRimColor':
        setRimColor(parsed.value as string);
        toast.success(`Rim color changed to ${parsed.colorName}`);
        addLog("voice", `Voice: Paint rims ${parsed.colorName}`);
        break;
      case 'setUnderglowColor':
        setUnderglowColor(parsed.value as string);
        setUnderglowIntensity(1);
        toast.success(`Underglow color changed to ${parsed.colorName}`);
        addLog("voice", `Voice: Set underglow ${parsed.colorName}`);
        break;
      case 'showSpoiler':
        setShowSpoiler(parsed.value as boolean);
        toast.success(parsed.value ? 'Spoiler added' : 'Spoiler removed');
        addLog("voice", `Voice: ${parsed.value ? 'Added' : 'Removed'} spoiler`);
        break;
      case 'setTab':
        setActiveTab(parsed.value as string);
        toast.success(`Switched to ${(parsed.value as string).toUpperCase()} studio`);
        addLog("voice", `Voice: Switch to ${parsed.value}`);
        break;
      case 'saveDesign':
        setSaveDialogOpen(true);
        toast.success('Opening save dialog');
        addLog("voice", "Voice: Save design");
        break;
      case 'setRimStyle':
        setRimStyle(parsed.value as "sport" | "classic" | "mesh" | "deepdish" | "stock");
        toast.success(`Rim style changed to ${parsed.value}`);
        addLog("voice", `Voice: Rim style ${parsed.value}`);
        break;
      case 'setWindowTint':
        setWindowTint(parsed.value as number);
        toast.success(`Window tint adjusted`);
        addLog("voice", "Voice: Adjust tint");
        break;
      case 'setHeadlightColor':
        setHeadlightColor(parsed.value as string);
        toast.success(`Headlights updated`);
        addLog("voice", "Voice: Headlights updated");
        break;
      case 'resetDesign':
        setBodyColor(undefined);
        setRimColor(undefined);
        setWindowTint(0);
        setUnderglowIntensity(0);
        setHeadlightColor(undefined);
        setTaillightColor(undefined);
        setShowSpoiler(false);
        setRimStyle('stock');
        setDecalUrl(undefined);
        setWrapType(undefined);
        setTwoDBodyColor(undefined);
        setTwoDRimColor(undefined);
        toast.success("Design reset to stock! 🔄");
        addLog("voice", "Voice: Reset design");
        break;
    }
  }, []);

  const { isListening, isSupported, toggleListening } = useVoiceControl({
    onCommand: handleVoiceCommand,
    continuous: true
  });

  // --- HELPER FOR 2D PROPS ---
  const getCurrentToolValue = () => {
    switch (selectedTool) {
      case "paint": return twoDBodyColor;
      case "rims": return twoDRimColor;
      case "windowtint": return twoDWindowTint > 0 ? "Dark" : "Light";
      case "headlights": return twoDHeadlightColor;
      case "underglow": return twoDUnderglowColor;
      case "wraps": return twoDWrapType;
      case "decals": return decalUrl; // Decals are currently shared or can be decoupled if needed
      default: return "";
    }
  };

  const setTwoDToolValue = (value: string) => {
    switch (selectedTool) {
      case "paint": setTwoDBodyColor(value); break;
      case "rims": setTwoDRimColor(value); break;
      case "windowtint": setTwoDWindowTint(parseFloat(value)); break;
      case "headlights": setTwoDHeadlightColor(value); break;
      case "underglow": setTwoDUnderglowColor(value); break;
      case "wraps": setTwoDWrapType(value); break;
      case "decals": setDecalUrl(value); break;
    }
  };

  // --- UNIFIED SETTER ---
  const handleUpdateValue = (value: string, isMaterial?: boolean, met?: number, roug?: number) => {
    if (activeTab === "2d") {
      setTwoDToolValue(value);
      addLog("color", `Changed 2D ${selectedTool} to ${value}`);
    } else {
      switch (selectedTool) {
        case "paint":
          setBodyColor(value);
          if (isMaterial) {
            setMetalness(met || 0.3);
            setRoughness(roug || 0.4);
          }
          addLog("color", `Painted body ${value}`);
          break;
        case "rims":
          setRimColor(value);
          addLog("color", `Painted rims ${value}`);
          break;
        case "windowtint":
          const tintVal = parseFloat(value);
          setWindowTint(tintVal);
          addLog("part", `Set window tint to ${tintVal * 100}%`);
          break;
        case "headlights":
          setHeadlightColor(value);
          addLog("color", `Changed headlights to ${value}`);
          break;
        case "underglow":
          setUnderglowColor(value);
          addLog("color", `Set underglow to ${value}`);
          break;
        case "wraps":
          setWrapType(value);
          addLog("part", `Applied wrap: ${value}`);
          break;
        case "rimstyle":
          setRimStyle(value as "sport" | "classic" | "mesh" | "deepdish" | "stock");
          addLog("part", `Equipped ${value} rims`);
          break;
      }
    }
  };

  const handleRunDesignReview = () => {
    const currentState: DesignState = activeTab === "2d" ? {
      bodyColor: twoDBodyColor,
      rimColor: twoDRimColor,
      wrapType: twoDWrapType,
      decalUrl: decalUrl,
      materialType: 'matte', // Simplified for demo
    } : {
      bodyColor: bodyColor,
      rimColor: rimColor,
      decalUrl: decalUrl,
      // ... 3D states
    };

    const review = getDesignCritique(currentState);
    setDesignReview(review);
    toast.success("AI Design Review Generated Locally!");
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
      // Serialize activity logs for persistence
      const serializedLogs = logs.map(log => ({
        type: log.type,
        message: log.message,
        context: log.context,
        time: log.time instanceof Date ? log.time.toISOString() : log.time,
      }));

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
          rimStyle,
          wrapType,
          decalUrl,
        },
        activity_log: serializedLogs,
      };

      if (loadedDesignId) {
        // Update existing design
        await designApi.updateDesign(loadedDesignId, designData);
        toast.success("Design updated successfully!");
      } else {
        // Create new design
        const response = await designApi.createDesign(designData);
        setLoadedDesignId(response.design.id);
        toast.success("Design saved successfully!");
      }
      setSaveDialogOpen(false);
    } catch (error: unknown) {
      console.error("Failed to save design:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to save design. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const customizationTools = useMemo(() => {
    const tools = [
      { id: "paint", name: "Paint", icon: PaintBucket },
      { id: "wraps", name: "Wraps", icon: PanelsTopLeft },
      { id: "rims", name: "Rims", icon: Settings },
      { id: "decals", name: "Decals", icon: Sticker },
      { id: "spoilers", name: "Spoilers", icon: Box },
      { id: "headlights", name: "Headlights", icon: Lightbulb },
      { id: "taillights", name: "Taillights", icon: Sun },
      { id: "underglow", name: "Under Glow", icon: Sparkles },
      { id: "windowtint", name: "Window Tint", icon: Palette },
    ];

    if (activeTab === "video") {
      const spoilerIndex = tools.findIndex(t => t.id === "spoilers");
      tools.splice(spoilerIndex + 1, 0, { id: "bumpers", name: "Bumpers", icon: Shield });
    }

    return tools;
  }, [activeTab]);


  const wrapOptions = ["Matte Black", "Chrome", "Carbon Fiber", "Camo", "Gloss Red"];
  const lightOptions = ["White", "Yellow", "Blue", "RGB Glow"];
  const tintOptions = ["Light", "Medium", "Dark", "Limo"];

  return (
    <div className="min-h-screen bg-background p-1.5 sm:p-2 md:p-4 animate-slideIn">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4 sm:mb-6">
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Studio
              </CardTitle>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 overflow-x-auto max-w-full">
                {/* Voice Control Button - FREE FEATURE! */}
                {isSupported && (
                  <Button
                    variant={isListening ? "default" : "outline"}
                    size="sm"
                    onClick={toggleListening}
                    title="Voice control: Say commands like 'change color to red'"
                    className={cn("text-xs sm:text-sm", isListening ? "animate-pulse" : "")}
                  >
                    {isListening ? <Mic className="w-4 h-4 sm:mr-1" /> : <MicOff className="w-4 h-4 sm:mr-1" />}
                    <span className="hidden sm:inline">{isListening ? "Listening..." : "Voice"}</span>
                  </Button>
                )}

                {/* Feedback Button */}
                <FeedbackModal />

                {activeTab === "3d" && (
                  <>
                    <Button
                      variant={debugMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDebugMode(!debugMode)}
                      title="Debug mode: Color-code parts"
                      className="text-xs sm:text-sm"
                    >
                      <SlidersHorizontal className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">{debugMode ? "Debug ON" : "Debug OFF"}</span>
                    </Button>

                    {/* Car Selection */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                          <Car className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Garage</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Car className="w-5 h-5 text-primary" />
                            Select Your Vehicle
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 max-h-[60vh] overflow-y-auto pr-2">
                          {isLoadingModels ? (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center gap-3">
                              <Loader2 className="w-8 h-8 animate-spin text-primary" />
                              <p className="text-muted-foreground font-medium">Loading vehicles...</p>
                            </div>
                          ) : carModels.map((car: CarModelConfig) => {
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
                        <Button variant="default" title="Save Design (Ctrl+S)" size="sm" className="text-xs sm:text-sm">
                          <Save className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Save Design</span>
                          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-primary-foreground/20 rounded hidden md:inline">⌘S</kbd>
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
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="w-full flex gap-0 overflow-hidden relative pb-16 lg:pb-0">

        {/* Main Content Area (Tabs) - Full width */}
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="mb-4 flex items-center justify-center bg-card/80 p-2 rounded-lg border w-fit mx-auto">
              <TabsList className="grid w-full grid-cols-3 gap-0.5">
                <TabsTrigger value="3d" className="text-xs sm:text-sm px-2 sm:px-3"><Box className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />3D<span className="hidden sm:inline"> Studio</span></TabsTrigger>
                <TabsTrigger value="2d" className="text-xs sm:text-sm px-2 sm:px-3"><Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />2D<span className="hidden sm:inline"> AI</span></TabsTrigger>
                <TabsTrigger value="video" className="text-xs sm:text-sm px-2 sm:px-3"><Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />AR<span className="hidden sm:inline"> Video</span></TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 bg-card/80 backdrop-blur-sm border-primary/20 rounded-xl p-2 sm:p-4 md:p-6 min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
              <TabsContent value="3d" className="h-full mt-0">
                <Suspense fallback={<StudioLoadingFallback />}>
                  <div className="relative h-full rounded-lg overflow-hidden bg-secondary/20 flex items-center justify-center">
                    <CarModel3D
                      modelId={selectedModel.id}
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
                      wrapType={wrapType}
                      decalUrl={decalUrl}
                      onPartSelect={handlePartSelect}
                    />
                  </div>
                </Suspense>
              </TabsContent>

              <TabsContent value="2d" className="h-full mt-0">
                <Suspense fallback={<StudioLoadingFallback />}>
                  <TwoDStudio
                    selectedTool={selectedTool}
                    toolValue={getCurrentToolValue() || ""}
                    onToolValueChange={setTwoDToolValue}
                    toolName={customizationTools.find(t => t.id === selectedTool)?.name}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="video" className="h-full mt-0">
                <Suspense fallback={<StudioLoadingFallback />}>
                  <VideoStudio
                    selectedTool={selectedTool}
                    bodyColor={debouncedBodyColor}
                    rimColor={debouncedRimColor}
                  />
                </Suspense>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Activity Log Overlay */}
        <div className="hidden xl:block absolute bottom-6 left-6 z-50 animate-in slide-in-from-left-10 duration-500 pointer-events-none">
          <div className="pointer-events-auto">
            <ActivityLog logs={logs} activeTab={activeTab} />
          </div>
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
                    color={(activeTab === "2d" ? twoDBodyColor : bodyColor) || "#ff5e1a"}
                    onChange={(c) => handleUpdateValue(c)}
                    carModelName={selectedModel.name}
                    onMaterialChange={(m, r) => {
                      if (activeTab === "3d") {
                        setMetalness(m);
                        setRoughness(r);
                      }
                    }}
                    onApplySuggestion={(suggestion: ColorSuggestion) => {
                      if (activeTab === "2d") {
                        setTwoDBodyColor(suggestion.colors.body);
                        setTwoDRimColor(suggestion.colors.rims);
                      } else {
                        setBodyColor(suggestion.colors.body);
                        setRimColor(suggestion.colors.rims);
                      }
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
                          size="sm" onClick={() => {
                            if (activeTab === "2d") {
                              setTwoDWrapType(w);
                              addLog("part", `Applied 2D wrap: ${w}`);
                            } else {
                              setWrapType(w);
                              addLog("part", `Applied wrap: ${w}`);
                            }
                          }} className="w-full">
                          {w}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rims Panel */}
                {selectedTool === "rims" && (
                  <div className="space-y-4">
                    {activeTab === "video" && (
                      <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg mb-4 animate-in slide-in-from-top-2">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">AR Video Mode</p>
                        <p className="text-xs text-muted-foreground">Select specific rim models (like the "rim" model) from the <span className="text-foreground font-semibold">Add Part</span> button in the video screen.</p>
                      </div>
                    )}
                    {/* Rim Style Selector - Enhanced Visual */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Rim Style</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'stock', label: 'Stock', emoji: '🚗', desc: 'Original factory rims' },
                          { value: 'concept', label: 'Concept', emoji: '💫', desc: 'Futuristic prototype' },
                          { value: 'sport_v2', label: 'Sport Pro', emoji: '🔥', desc: 'Premium forged racing' },
                          { value: 'test_rim_2', label: 'Test 2', emoji: '🧪', desc: 'Unit Check 2' },
                          { value: 'test_rim_3', label: 'Test 3', emoji: '🧪', desc: 'Unit Check 3' },
                        ].map((style) => (
                          <button
                            key={style.value}
                            onClick={() => {
                              if (activeTab === "2d") {
                                setTwoDRimStyle(style.value);
                                addLog("part", `Changed 2D rim style to ${style.label}`);
                              } else {
                                setRimStyle(style.value);
                                addLog("part", `Equipped ${style.label} rims`);
                              }
                            }}
                            className={cn(
                              "relative p-3 rounded-lg border-2 transition-all hover:scale-105",
                              (activeTab === "2d" ? twoDRimStyle : rimStyle) === style.value
                                ? "border-primary bg-primary/10 shadow-lg"
                                : "border-border bg-card hover:border-primary/50"
                            )}
                          >
                            <div className="text-3xl mb-1">{style.emoji}</div>
                            <div className="font-semibold text-sm">{style.label}</div>
                            <div className="text-xs text-muted-foreground">{style.desc}</div>
                            {(activeTab === "2d" ? twoDRimStyle : rimStyle) === style.value && (
                              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rim Color Picker */}
                    <ColorPicker
                      label="Rim Color"
                      color={(activeTab === "2d" ? twoDRimColor : rimColor) || "#ffffff"}
                      onChange={(c) => {
                        if (activeTab === "2d") {
                          setTwoDRimColor(c);
                          addLog("color", `Painted 2D rims ${c}`);
                        } else {
                          setRimColor(c);
                          addLog("color", `Painted rims ${c}`);
                        }
                      }}
                      carModelName={selectedModel.name}
                      onApplySuggestion={(suggestion: ColorSuggestion) => {
                        if (activeTab === "2d") {
                          setTwoDRimColor(suggestion.colors.rims);
                          setTwoDBodyColor(suggestion.colors.body);
                        } else {
                          setRimColor(suggestion.colors.rims);
                          setBodyColor(suggestion.colors.body);
                        }
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
                          onClick={() => {
                            const val = idx * 0.25;
                            if (activeTab === "2d") {
                              setTwoDWindowTint(val);
                              addLog("part", `Set 2D tint to ${val * 100}%`);
                            } else {
                              setWindowTint(val);
                              addLog("part", `Set window tint to ${val * 100}%`);
                            }
                          }} className="w-full">
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
                          onClick={() => {
                            const val = l === "White" ? "#ffffff" : l === "Yellow" ? "#ffff00" : "#0000ff";
                            if (activeTab === "2d") {
                              setTwoDHeadlightColor(val);
                              addLog("color", `Changed 2D headlights to ${l}`);
                            } else {
                              setHeadlightColor(val);
                              addLog("color", `Changed headlights to ${l}`);
                            }
                          }}
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
                      onChange={(c) => {
                        setTaillightColor(c);
                        addLog("color", `Changed taillights to ${c}`);
                      }}
                    />
                  </div>
                )}

                {/* Underglow Panel */}
                {selectedTool === "underglow" && (
                  <div className="space-y-4">
                    <ColorPicker
                      label="Underglow Color"
                      color={(activeTab === "2d" ? twoDUnderglowColor : underglowColor) || "transparent"}
                      onChange={(c) => {
                        handleUpdateValue(c);
                        if (activeTab === "3d" && c) setUnderglowIntensity(1);
                      }}
                    />
                    {activeTab === "3d" && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-xs">Intensity</Label>
                          <span className="text-xs font-mono">{Math.round(underglowIntensity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={underglowIntensity}
                          onChange={(e) => setUnderglowIntensity(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Spoilers Panel - Enhanced Visual */}
                {selectedTool === "spoilers" && (
                  <div>
                    {selectedModel.type === 'suv' ? (
                      <div className="p-4 bg-muted/30 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground italic">Spoilers are not recommended for SUVs and have been disabled for this model.</p>
                      </div>
                    ) : (
                      <>
                        {activeTab === "video" && (
                          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg mb-4 animate-in slide-in-from-top-2">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">AR Video Mode</p>
                            <p className="text-xs text-muted-foreground">Select spoiler models from the <span className="text-foreground font-semibold">Add Part</span> button in the video screen.</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-sm font-medium">Show Spoiler</Label>
                          <Button size="sm" variant={showSpoiler ? "default" : "outline"}
                            onClick={() => {
                              const newState = !showSpoiler;
                              setShowSpoiler(newState);
                              addLog("part", `Spoiler ${newState ? "Enabled" : "Disabled"}`);
                            }}>
                            {showSpoiler ? "ON" : "OFF"}
                          </Button>
                        </div>
                        {showSpoiler && (
                          <div>
                            <Label className="text-sm font-medium mb-3 block">Spoiler Style</Label>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { value: 'wing', label: 'Wing', emoji: '🦋', desc: 'GT racing style' },
                                { value: 'ducktail', label: 'Ducktail', emoji: '🦆', desc: 'Low profile' },
                                { value: 'lip', label: 'Lip', emoji: '👄', desc: 'Subtle edge' },
                                { value: 'gt', label: 'GT', emoji: '🏁', desc: 'High downforce' }
                              ].map(s => (
                                <button
                                  key={s.value}
                                  onClick={() => {
                                    setSpoilerStyle(s.value);
                                    addLog("part", `Equipped ${s.label} spoiler`);
                                  }}
                                  className={cn(
                                    "relative p-3 rounded-lg border-2 transition-all hover:scale-105",
                                    spoilerStyle === s.value
                                      ? "border-primary bg-primary/10 shadow-lg"
                                      : "border-border bg-card hover:border-primary/50"
                                  )}
                                >
                                  <div className="text-3xl mb-1">{s.emoji}</div>
                                  <div className="font-semibold text-sm">{s.label}</div>
                                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                                  {spoilerStyle === s.value && (
                                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Decals Panel - Enhanced Visual */}
                {selectedTool === "decals" && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Decal Styles</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'Flames', emoji: '🔥', desc: 'Racing flames', path: 'flames' },
                        { name: 'Stripes', emoji: '🏎️', desc: 'Dual stripes', path: 'stripes' },
                        { name: 'Racing', emoji: '🏁', desc: 'Racing numbers', path: 'racing' },
                        { name: 'Logo', emoji: '⭐', desc: 'Custom logo', path: 'logo' }
                      ].map(d => (
                        <button
                          key={d.name}
                          onClick={() => {
                            const url = `/decals/${d.path}.svg`;
                            if (activeTab === "2d") {
                              setDecalUrl(url);
                              addLog("part", `Applied 2D decal: ${d.name}`);
                            } else {
                              setDecalUrl(url);
                              addLog("part", `Applied decal: ${d.name}`);
                            }
                          }}
                          className={cn(
                            "relative p-3 rounded-lg border-2 transition-all hover:scale-105",
                            decalUrl?.includes(d.path)
                              ? "border-primary bg-primary/10 shadow-lg"
                              : "border-border bg-card hover:border-primary/50"
                          )}
                        >
                          <div className="text-3xl mb-1">{d.emoji}</div>
                          <div className="font-semibold text-sm">{d.name}</div>
                          <div className="text-xs text-muted-foreground">{d.desc}</div>
                          {decalUrl?.includes(d.path) && (
                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-3"
                      onClick={() => {
                        setDecalUrl(undefined);
                        addLog("part", "Removed decal");
                      }}>
                      Clear Decal
                    </Button>
                  </div>
                )}

                {/* Bumpers Panel */}
                {selectedTool === "bumpers" && (
                  <div className="bg-secondary/20 rounded-lg p-4 text-center mt-4 border border-primary/10 animate-in fade-in">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-primary/50" />
                    <p className="text-sm font-medium">Bumper Selection</p>
                    <p className="text-xs text-muted-foreground mt-1 text-balance">
                      Please select bumper models from the <span className="text-foreground font-semibold">Add Part</span> button in the video screen.
                    </p>
                  </div>
                )}


              </div>
            </div>
          )}
        </div>

        {/* ===== MOBILE TOOLBAR (< lg screens) ===== */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <VerticalToolbar
            tools={customizationTools}
            selectedTool={selectedTool}
            onToolSelect={(toolId) => setSelectedTool(selectedTool === toolId ? "" : toolId)}
            horizontal
          />
        </div>

        {/* ===== MOBILE TOOL OPTIONS SHEET ===== */}
        <Sheet open={!!selectedTool && isMobile} onOpenChange={(open) => { if (!open) setSelectedTool(""); }}>
          <SheetContent side="bottom" className="lg:hidden max-h-[70vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {React.createElement(customizationTools.find(t => t.id === selectedTool)?.icon || Box, { className: "w-5 h-5 text-primary" })}
                {customizationTools.find(t => t.id === selectedTool)?.name}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-3 pt-4">
              {/* Paint Panel */}
              {selectedTool === "paint" && (
                <ColorPicker
                  label="Body Paint"
                  color={(activeTab === "2d" ? twoDBodyColor : bodyColor) || "#ff5e1a"}
                  onChange={(c) => handleUpdateValue(c)}
                  carModelName={selectedModel.name}
                  onMaterialChange={(m, r) => {
                    if (activeTab === "3d") {
                      setMetalness(m);
                      setRoughness(r);
                    }
                  }}
                  onApplySuggestion={(suggestion: ColorSuggestion) => {
                    if (activeTab === "2d") {
                      setTwoDBodyColor(suggestion.colors.body);
                      setTwoDRimColor(suggestion.colors.rims);
                    } else {
                      setBodyColor(suggestion.colors.body);
                      setRimColor(suggestion.colors.rims);
                    }
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
                        size="sm" onClick={() => {
                          if (activeTab === "2d") {
                            setTwoDWrapType(w);
                            addLog("part", `Applied 2D wrap: ${w}`);
                          } else {
                            setWrapType(w);
                            addLog("part", `Applied wrap: ${w}`);
                          }
                        }} className="w-full">
                        {w}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rims Panel */}
              {selectedTool === "rims" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Rim Style</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'stock', label: 'Stock', emoji: '🚗', desc: 'Factory' },
                        { value: 'concept', label: 'Concept', emoji: '💫', desc: 'Futuristic' },
                        { value: 'sport_v2', label: 'Sport Pro', emoji: '🔥', desc: 'Racing' },
                        { value: 'test_rim_2', label: 'Test 2', emoji: '🧪', desc: 'Check 2' },
                        { value: 'test_rim_3', label: 'Test 3', emoji: '🧪', desc: 'Check 3' },
                      ].map((style) => (
                        <button
                          key={style.value}
                          onClick={() => {
                            if (activeTab === "2d") {
                              setTwoDRimStyle(style.value);
                              addLog("part", `Changed 2D rim style to ${style.label}`);
                            } else {
                              setRimStyle(style.value);
                              addLog("part", `Equipped ${style.label} rims`);
                            }
                          }}
                          className={cn(
                            "relative p-2 rounded-lg border-2 transition-all",
                            (activeTab === "2d" ? twoDRimStyle : rimStyle) === style.value
                              ? "border-primary bg-primary/10 shadow-lg"
                              : "border-border bg-card hover:border-primary/50"
                          )}
                        >
                          <div className="text-2xl mb-0.5">{style.emoji}</div>
                          <div className="font-semibold text-xs">{style.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <ColorPicker
                    label="Rim Color"
                    color={(activeTab === "2d" ? twoDRimColor : rimColor) || "#ffffff"}
                    onChange={(c) => {
                      if (activeTab === "2d") {
                        setTwoDRimColor(c);
                        addLog("color", `Painted 2D rims ${c}`);
                      } else {
                        setRimColor(c);
                        addLog("color", `Painted rims ${c}`);
                      }
                    }}
                    carModelName={selectedModel.name}
                    onApplySuggestion={(suggestion: ColorSuggestion) => {
                      if (activeTab === "2d") {
                        setTwoDRimColor(suggestion.colors.rims);
                        setTwoDBodyColor(suggestion.colors.body);
                      } else {
                        setRimColor(suggestion.colors.rims);
                        setBodyColor(suggestion.colors.body);
                      }
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
                        onClick={() => {
                          const val = idx * 0.25;
                          if (activeTab === "2d") {
                            setTwoDWindowTint(val);
                            addLog("part", `Set 2D tint to ${val * 100}%`);
                          } else {
                            setWindowTint(val);
                            addLog("part", `Set window tint to ${val * 100}%`);
                          }
                        }} className="w-full">
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
                        onClick={() => {
                          const val = l === "White" ? "#ffffff" : l === "Yellow" ? "#ffff00" : "#0000ff";
                          if (activeTab === "2d") {
                            setTwoDHeadlightColor(val);
                            addLog("color", `Changed 2D headlights to ${l}`);
                          } else {
                            setHeadlightColor(val);
                            addLog("color", `Changed headlights to ${l}`);
                          }
                        }}
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
                    onChange={(c) => {
                      setTaillightColor(c);
                      addLog("color", `Changed taillights to ${c}`);
                    }}
                  />
                </div>
              )}

              {/* Underglow Panel */}
              {selectedTool === "underglow" && (
                <div className="space-y-4">
                  <ColorPicker
                    label="Underglow Color"
                    color={(activeTab === "2d" ? twoDUnderglowColor : underglowColor) || "transparent"}
                    onChange={(c) => {
                      handleUpdateValue(c);
                      if (activeTab === "3d" && c) setUnderglowIntensity(1);
                    }}
                  />
                  {activeTab === "3d" && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Intensity</Label>
                        <span className="text-xs font-mono">{Math.round(underglowIntensity * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="2" step="0.1"
                        value={underglowIntensity}
                        onChange={(e) => setUnderglowIntensity(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Spoilers Panel */}
              {selectedTool === "spoilers" && (
                <div>
                  {selectedModel.type === 'suv' ? (
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground italic">Spoilers are not recommended for SUVs.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-sm font-medium">Show Spoiler</Label>
                        <Button size="sm" variant={showSpoiler ? "default" : "outline"}
                          onClick={() => {
                            const newState = !showSpoiler;
                            setShowSpoiler(newState);
                            addLog("part", `Spoiler ${newState ? "Enabled" : "Disabled"}`);
                          }}>
                          {showSpoiler ? "ON" : "OFF"}
                        </Button>
                      </div>
                      {showSpoiler && (
                        <div>
                          <Label className="text-sm font-medium mb-3 block">Spoiler Style</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: 'wing', label: 'Wing', emoji: '🦋', desc: 'GT racing' },
                              { value: 'ducktail', label: 'Ducktail', emoji: '🦆', desc: 'Low profile' },
                              { value: 'lip', label: 'Lip', emoji: '👄', desc: 'Subtle edge' },
                              { value: 'gt', label: 'GT', emoji: '🏁', desc: 'High downforce' }
                            ].map(s => (
                              <button
                                key={s.value}
                                onClick={() => {
                                  setSpoilerStyle(s.value);
                                  addLog("part", `Equipped ${s.label} spoiler`);
                                }}
                                className={cn(
                                  "relative p-2 rounded-lg border-2 transition-all",
                                  spoilerStyle === s.value
                                    ? "border-primary bg-primary/10 shadow-lg"
                                    : "border-border bg-card hover:border-primary/50"
                                )}
                              >
                                <div className="text-2xl mb-0.5">{s.emoji}</div>
                                <div className="font-semibold text-xs">{s.label}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Decals Panel */}
              {selectedTool === "decals" && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">Decal Styles</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Flames', emoji: '🔥', desc: 'Racing flames', path: 'flames' },
                      { name: 'Stripes', emoji: '🏎️', desc: 'Dual stripes', path: 'stripes' },
                      { name: 'Racing', emoji: '🏁', desc: 'Racing numbers', path: 'racing' },
                      { name: 'Logo', emoji: '⭐', desc: 'Custom logo', path: 'logo' }
                    ].map(d => (
                      <button
                        key={d.name}
                        onClick={() => {
                          const url = `/decals/${d.path}.svg`;
                          setDecalUrl(url);
                          addLog("part", `Applied decal: ${d.name}`);
                        }}
                        className={cn(
                          "relative p-2 rounded-lg border-2 transition-all",
                          decalUrl?.includes(d.path)
                            ? "border-primary bg-primary/10 shadow-lg"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                      >
                        <div className="text-2xl mb-0.5">{d.emoji}</div>
                        <div className="font-semibold text-xs">{d.name}</div>
                      </button>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-3"
                    onClick={() => {
                      setDecalUrl(undefined);
                      addLog("part", "Removed decal");
                    }}>
                    Clear Decal
                  </Button>
                </div>
              )}

              {/* Bumpers Panel */}
              {selectedTool === "bumpers" && (
                <div className="bg-secondary/20 rounded-lg p-4 text-center border border-primary/10">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-primary/50" />
                  <p className="text-sm font-medium">Bumper Selection</p>
                  <p className="text-xs text-muted-foreground mt-1">Please select bumper styles from the studio view controls.</p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

      </div> {/* End flex container */}
    </div>
  );
};

export default ARStudio;
