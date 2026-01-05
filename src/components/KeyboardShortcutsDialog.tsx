import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: KeyboardShortcut[] = [
  // Navigation
  { keys: ["Ctrl", "H"], description: "Go to Home", category: "Navigation" },
  { keys: ["Ctrl", "S"], description: "Save Design", category: "AR Studio" },
  { keys: ["Ctrl", "Z"], description: "Undo", category: "AR Studio" },
  { keys: ["Ctrl", "Y"], description: "Redo", category: "AR Studio" },
  { keys: ["Ctrl", "R"], description: "Reset to Default", category: "AR Studio" },
  { keys: ["1-9"], description: "Select Tool", category: "AR Studio" },
  { keys: ["Esc"], description: "Close Panel", category: "General" },
  { keys: ["?"], description: "Show Shortcuts", category: "General" },
];

const KeyboardShortcutsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Show shortcuts on "?"
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen(true);
      }
      // Close on Escape
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [open]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <>
      {/* Button to trigger shortcuts modal */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-3 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all hover:scale-105"
        title="Keyboard Shortcuts (?)"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="w-5 h-5 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Master these shortcuts to work faster in CarVizion
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <kbd
                            key={keyIdx}
                            className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Press <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">?</kbd> anytime to see this dialog
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KeyboardShortcutsDialog;
