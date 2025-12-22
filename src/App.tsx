import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ARStudio from "./pages/ARStudio";

import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <TooltipProvider>
      <div className="relative z-10">
        <BrowserRouter>
          <Routes>
            {/* <Route path="/" element={<Index />} /> */}
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
        </BrowserRouter>
      </div>
      <Toaster position="top-center" richColors />
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
