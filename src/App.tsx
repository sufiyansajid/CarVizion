import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import ErrorBoundary from "@/components/ErrorBoundary";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ARStudio from "./pages/ARStudio";

import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

import Navbar from "./components/Navbar";
import KeyboardShortcutsDialog from "./components/KeyboardShortcutsDialog";


const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <>
      <Navbar />
      {/* Only add top padding on non-home pages - home page has full-screen video */}
      <div className={isHomePage ? "" : "pt-16 sm:pt-20"}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ar-studio" element={<ARStudio />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>

      <TooltipProvider>
        {/* Skip to content link for keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
        >
          Skip to main content
        </a>
        <div id="main-content" className="relative z-10">
          <BrowserRouter>
            <AppContent />
            <KeyboardShortcutsDialog />
          </BrowserRouter>
        </div>
        <Toaster position="top-center" richColors />
      </TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
