import { useEffect, useCallback } from 'react';

type KeyHandler = () => void;

interface ShortcutMap {
  [key: string]: KeyHandler;
}

/**
 * Custom hook for managing keyboard shortcuts
 * @param shortcuts - Object mapping key combinations to handlers
 * @param enabled - Whether shortcuts are enabled (default: true)
 * 
 * @example
 * useKeyboardShortcuts({
 *   'ctrl+s': () => handleSave(),
 *   'escape': () => handleClose(),
 *   'ctrl+z': () => handleUndo(),
 * });
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutMap,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Build the key combination string
      const keys: string[] = [];
      if (event.ctrlKey || event.metaKey) keys.push('ctrl');
      if (event.altKey) keys.push('alt');
      if (event.shiftKey) keys.push('shift');
      
      // Add the actual key (lowercase)
      const key = event.key.toLowerCase();
      if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
        keys.push(key);
      }

      const combination = keys.join('+');

      // Check if we have a handler for this combination
      const handler = shortcuts[combination];
      if (handler) {
        event.preventDefault();
        event.stopPropagation();
        handler();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Hook for common dialog escape behavior
 * @param onClose - Function to call when Escape is pressed
 * @param isOpen - Whether the dialog is open
 */
export function useEscapeKey(onClose: () => void, isOpen: boolean = true) {
  useKeyboardShortcuts(
    {
      escape: onClose,
    },
    isOpen
  );
}

export default useKeyboardShortcuts;
