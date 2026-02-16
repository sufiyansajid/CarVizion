
import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Activity, GripHorizontal } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

export type LogType = "system" | "color" | "part" | "navigation" | "voice";

export interface LogEntry {
  id: string;
  time: Date;
  type: LogType;
  message: string;
  context: string; // "3d" | "2d" | "video"
}

interface ActivityLogProps {
  logs: LogEntry[];
  activeTab: string;
  className?: string; // Allow custom positioning
}

export function ActivityLog({ logs, activeTab, className }: ActivityLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Filter logs based on active tab
  const filteredLogs = logs.filter(log => log.context === activeTab);

  // Auto-scroll to bottom on new log
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [filteredLogs]);

  const getIcon = (type: LogType) => {
      switch (type) {
        case "voice": return "🎤";
        case "color": return "🎨";
        case "part": return "🔧";
        case "navigation": return "🧭";
        default: return "🖥️";
      }
  };

  const getTitle = () => {
      switch(activeTab) {
          case '3d': return '3D Modifications';
          case '2d': return '2D AI Modifications';
          case 'video': return 'AR Video Modifications';
          default: return 'Activity Log';
      }
  }

  return (
    <motion.div
        drag
        dragListener={false}
        dragControls={dragControls}
        dragMomentum={false}
        whileDrag={{ scale: 1.02, cursor: "grabbing" }}
        className={className}
    >
        <Card className="w-80 h-64 bg-black/60 backdrop-blur-md border-white/10 flex flex-col shadow-xl overflow-hidden">
        <div 
            className="p-2 border-b border-white/10 flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors"
            onPointerDown={(e) => dragControls.start(e)}
        >
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Activity className="w-3 h-3 text-green-400" />
            {getTitle()}
            </div>
            <div className="flex items-center gap-2">
                <div className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-muted-foreground font-mono">
                    {filteredLogs.length} events
                </div>
                <GripHorizontal className="w-3 h-3 text-muted-foreground/50" />
            </div>
        </div>
        
        <ScrollArea className="flex-1 p-2" ref={scrollRef}>
            <div className="space-y-1.5">
            <AnimatePresence initial={false}>
                {filteredLogs.length === 0 && (
                    <div className="text-muted-foreground text-xs text-center py-8 italic opacity-50">
                        No modifications yet...
                    </div>
                )}
                {filteredLogs.map((log) => (
                <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group flex items-start gap-2 text-xs p-1.5 rounded hover:bg-white/5 transition-colors"
                >
                    <span className="text-muted-foreground/50 font-mono text-[10px] whitespace-nowrap mt-0.5">
                    {log.time.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="opacity-80">{getIcon(log.type)}</span>
                            <span className="text-gray-200 truncate font-medium">{log.message}</span>
                        </div>
                    </div>
                </motion.div>
                ))}
            </AnimatePresence>
            </div>
        </ScrollArea>
        </Card>
    </motion.div>
  );
}
