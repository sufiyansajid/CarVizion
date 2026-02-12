import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (): any;
    };
    webkitSpeechRecognition: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (): any;
    };
  }
}

interface VoiceCommand {
  transcript: string;
  confidence: number;
}

interface UseVoiceControlOptions {
  onCommand?: (command: VoiceCommand) => void;
  continuous?: boolean;
  language?: string;
}

/**
 * Voice Control Hook - 100% FREE, no API needed!
 * Uses browser's Web Speech API for hands-free customization
 * 
 * Usage:
 * const { isListening, startListening, stopListening } = useVoiceControl({
 *   onCommand: (cmd) => handleVoiceCommand(cmd.transcript)
 * });
 */
export function useVoiceControl(options: UseVoiceControlOptions = {}) {
  const {
    onCommand,
    continuous = true,
    language = 'en-US'
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const shouldBeListeningRef = useRef(false); // Track intended state

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
    };

    recognition.onresult = (event: { results: { transcript: string; confidence: number }[][] }) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase();
      const confidence = event.results[last][0].confidence;

      console.log('Heard:', transcript, '(confidence:', confidence, ')');

      if (onCommand) {
        onCommand({ transcript, confidence });
      }
    };

    recognition.onerror = (event: { error: string }) => {
      console.error('Voice recognition error:', event.error);
      if (event.error === 'no-speech') {
        toast.error('No speech detected. Try again.');
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone permission denied');
      }
      setIsListening(false);
      shouldBeListeningRef.current = false;
    };

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      // Only restart if user INTENDS to keep listening
      if (shouldBeListeningRef.current && continuous) {
        console.log('↻ Restarting voice recognition...');
        try {
          recognition.start();
        } catch {
          console.log('Could not restart recognition');
          setIsListening(false);
          shouldBeListeningRef.current = false;
        }
      } else {
        setIsListening(false);
      }
    };

    if (isListening) {
      shouldBeListeningRef.current = true;
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
        shouldBeListeningRef.current = false;
      }
    } else {
      shouldBeListeningRef.current = false;
    }

    return () => {
      shouldBeListeningRef.current = false;
      try {
        recognition.stop();
      } catch {
        // Ignore errors on cleanup
      }
    };
  }, [isListening, continuous, language, onCommand]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice control not supported in your browser');
      return;
    }
    setIsListening(true);
    toast.success('🎤 Listening... Try: "Change color to red"');
  }, [isSupported]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    toast.info('🎤 Stopped listening');
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening
  };
}

/**
 * Parse voice commands into actions
 * Example: "change color to red" -> { action: 'setColor', value: '#ff0000' }
 */
export function parseVoiceCommand(transcript: string) {
  const lower = transcript.toLowerCase();

  // Color commands - Realistic automotive colors
  const colorMap: Record<string, string> = {
    'red': '#8b0000',
    'dark red': '#8b0000',
    'racing red': '#8b0000',
    'blue': '#0f4c81',
    'navy': '#1c4587',
    'navy blue': '#1c4587',
    'royal blue': '#0f4c81',
    'black': '#1a1a1a',
    'midnight black': '#1a1a1a',
    'white': '#f8f8f8',
    'pearl white': '#f8f8f8',
    'silver': '#c0c0c0',
    'gray': '#2d2d2d',
    'grey': '#2d2d2d',
    'charcoal': '#2d2d2d',
    'bronze': '#8b4513',
    'green': '#0d4d0d',
    'yellow': '#ffd700',
    'orange': '#ff5e1a',
    'purple': '#4b0082',
    'pink': '#c71585'
  };

  for (const [colorName, colorValue] of Object.entries(colorMap)) {
    if (lower.includes(colorName)) {
      if (lower.includes('rim') || lower.includes('wheel')) {
        return { action: 'setRimColor', value: colorValue, colorName };
      } else if (lower.includes('underglow') || lower.includes('under glow')) {
        return { action: 'setUnderglowColor', value: colorValue, colorName };
      } else {
        return { action: 'setBodyColor', value: colorValue, colorName };
      }
    }
  }

  // Spoiler commands
  if (lower.includes('show spoiler') || lower.includes('add spoiler')) {
    return { action: 'showSpoiler', value: true };
  }
  if (lower.includes('hide spoiler') || lower.includes('remove spoiler')) {
    return { action: 'showSpoiler', value: false };
  }

  // Tab switching
  if (lower.includes('3d') || lower.includes('three d')) {
    return { action: 'setTab', value: '3d' };
  }
  if (lower.includes('2d') || lower.includes('two d') || lower.includes('ai')) {
    return { action: 'setTab', value: '2d' };
  }
  if (lower.includes('video') || lower.includes('ar')) {
    return { action: 'setTab', value: 'video' };
  }

  // Save command
  if (lower.includes('save') || lower.includes('save design')) {
    return { action: 'saveDesign', value: true };
  }

  // --- NEW COMMANDS ---

  // Window Tint
  if (lower.includes('window') || lower.includes('tint')) {
    if (lower.includes('dark') || lower.includes('limo') || lower.includes('black')) return { action: 'setWindowTint', value: 0.9 };
    if (lower.includes('medium')) return { action: 'setWindowTint', value: 0.5 };
    if (lower.includes('light')) return { action: 'setWindowTint', value: 0.2 };
    if (lower.includes('clear') || lower.includes('remove') || lower.includes('no tint')) return { action: 'setWindowTint', value: 0 };
  }

  // Rim Styles
  if (lower.includes('rim') || lower.includes('wheel')) {
    if (lower.includes('sport')) return { action: 'setRimStyle', value: 'sport' };
    if (lower.includes('classic') || lower.includes('vintage')) return { action: 'setRimStyle', value: 'classic' };
    if (lower.includes('mesh') || lower.includes('wire')) return { action: 'setRimStyle', value: 'mesh' };
    if (lower.includes('deep') || lower.includes('dish')) return { action: 'setRimStyle', value: 'deepdish' };
    if (lower.includes('stock') || lower.includes('original')) return { action: 'setRimStyle', value: 'stock' };
  }

  // Lights
  if ((lower.includes('light') || lower.includes('led'))) {
    if (lower.includes('off') || lower.includes('disable')) return { action: 'setHeadlightColor', value: '#000000' }; // Black = off
    if (lower.includes('on') || lower.includes('enable')) return { action: 'setHeadlightColor', value: '#ffffff' };
    
    // Check colors for lights specifically
    for (const [colorName, colorValue] of Object.entries(colorMap)) {
      if (lower.includes(colorName)) {
        return { action: 'setHeadlightColor', value: colorValue };
      }
    }
  }

  return null;
}
