import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ToolbarItem {
  id: string;
  name: string;
  icon: LucideIcon;
}

interface VerticalToolbarProps {
  tools: ToolbarItem[];
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  horizontal?: boolean;
}

const VerticalToolbar: React.FC<VerticalToolbarProps> = ({
  tools,
  selectedTool,
  onToolSelect,
  horizontal = false,
}) => {
  if (horizontal) {
    return (
      <div className="flex-shrink-0 w-full bg-card/95 backdrop-blur-sm border-t border-border flex items-center px-2 py-2 gap-1.5 overflow-x-auto scrollbar-hide">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id === selectedTool ? "" : tool.id)}
            className={cn(
              "relative flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-200",
              selectedTool === tool.id
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            aria-label={tool.name}
            title={tool.name}
          >
            <tool.icon className="w-5 h-5" />
            {selectedTool === tool.id && (
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-primary rounded-b-full" />
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-20 bg-card/95 backdrop-blur-sm border-r border-border flex flex-col items-center py-6 gap-3 min-h-[calc(100vh-12rem)]">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id === selectedTool ? "" : tool.id)}
          className={cn(
            "group relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md",
            selectedTool === tool.id
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-105 hover:shadow-lg"
          )}
          aria-label={tool.name}
          title={tool.name}
        >
          <tool.icon className="w-7 h-7" />
          {/* Tooltip on hover */}
          <span className="absolute left-full ml-3 px-3 py-1.5 bg-popover border border-border rounded-md text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
            {tool.name}
          </span>
          {/* Active indicator */}
          {selectedTool === tool.id && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
          )}
        </button>
      ))}   </div>
  );
};

export default VerticalToolbar;
