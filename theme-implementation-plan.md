# Theme Implementation Plan

## Overview

This document outlines the implementation plan for adding dark/light theme toggle functionality to the CarVizion application. The toggle will be placed in the header navigation and will persist across sessions.

## Implementation Steps

### 1. Theme Context and Provider

Create a theme context to manage the theme state across the application.

**File: `src/contexts/ThemeContext.tsx`**

```typescript
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("dark");

  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme class to document element
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
```

### 2. Update CSS Variables

Update the CSS variables in `src/index.css` to support both dark and light themes.

**File: `src/index.css`**
Add light theme variables:

```css
@layer base {
  :root {
    --background: 0 0% 3%;
    --foreground: 210 40% 98%;

    --card: 0 0% 6%;
    --card-foreground: 210 40% 98%;

    --popover: 0 0% 6%;
    --popover-foreground: 210 40% 98%;

    --primary: 14 100% 60%;
    --primary-foreground: 0 0% 98%;

    --secondary: 210 40% 12%;
    --secondary-foreground: 210 40% 98%;

    --muted: 210 40% 12%;
    --muted-foreground: 215.4 16.3% 56.9%;

    --accent: 14 100% 60%;
    --accent-foreground: 0 0% 98%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 14 100% 60%;

    --radius: 0.75rem;
  }

  .light {
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 47.4% 11.2%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;

    --primary: 14 100% 60%;
    --primary-foreground: 0 0% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 14 100% 60%;
    --accent-foreground: 0 0% 98%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 14 100% 60%;

    --radius: 0.75rem;
  }

  body {
    @apply bg-background text-foreground font-sans;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  }

  .light body {
    background: linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%);
  }
}
```

### 3. Theme Toggle Component

Create a reusable theme toggle component.

**File: `src/components/ThemeToggle.tsx`**

```typescript
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4 text-automotive-orange" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
      />
      <Moon className="h-4 w-4 text-automotive-orange" />
    </div>
  );
}
```

### 4. Update App Component

Wrap the application with the ThemeProvider.

**File: `src/App.tsx`**

```typescript
import { Toaster as Sonner, Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ARStudio from "./pages/ARStudio";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="relative z-10">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ar-studio" element={<ARStudio />} />
            <Route path="/pricing" element={<Pricing />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
```

### 5. Add Theme Toggle to Headers

Add the theme toggle to the navigation bar in index.tsx and other pages.

**File: `src/pages/index.tsx`**
Add the theme toggle to the navigation section (around line 73):

```tsx
// Import the ThemeToggle component
import { ThemeToggle } from "@/components/ThemeToggle";

// In the navigation bar (around line 73)
<div className="flex items-center gap-4">
  <ThemeToggle />
  <Link to="/profile">
    <Button variant="ghost" className="text-foreground ">
      Profile
    </Button>
  </Link>
  {/* ... other navigation items ... */}
</div>;
```

Similar updates would be needed for other pages like Profile.tsx and ARStudio.tsx.

## Files to be Modified/Created

1. `src/contexts/ThemeContext.tsx` - New file for theme context
2. `src/components/ThemeToggle.tsx` - New component for theme toggle
3. `src/index.css` - Update CSS variables for light theme
4. `src/App.tsx` - Wrap with ThemeProvider
5. `src/pages/index.tsx` - Add theme toggle to header
6. `src/pages/Profile.tsx` - Add theme toggle to header
7. `src/pages/ARStudio.tsx` - Add theme toggle to header

## Testing Plan

1. Verify theme toggle appears in all headers
2. Test switching between dark and light themes
3. Verify theme persists after page refresh
4. Check that all UI elements properly adapt to both themes
5. Test on different pages to ensure consistency
