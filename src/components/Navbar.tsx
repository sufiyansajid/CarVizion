import { useEffect, useState } from "react";
import {
  Car,
  Menu,
  Star,
  Users,
  Sparkles,
  User,
  LogOut,
  Home,
  ImageIcon,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatarUrl } from "@/lib/imageUtils";
import api from "@/store/baseApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import HamburgerMenuOverlay from "@/components/ui/HamburgerMenuOverlay";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        try {
          const response = await api.get("/api/users/profile");
          setUser(response.data.user);
        } catch (error) {
          // Token might be invalid
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    checkAuth();
  }, [location.pathname]); // Re-check on navigation if needed

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full shadow-lg transition-all duration-300 bg-black border-b border-white/10"
      )}
    >
      <div className="max-w-90rem mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-2 sm:py-3">
          <Link to="/" className="flex items-center">
            <img
              src="/logo-solid-black.png"
              alt="CarVizion Logo"
              className="h-16 sm:h-18 w-auto object-contain"
            />
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggleButton
              variant="gif"
              url="https://media.giphy.com/media/KBbr4hHl9DSahKvInO/giphy.gif"
            />
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-auto p-1.5 bg-black/40 text-white hover:bg-black/60"
                    )}
                  >
                    <Avatar className="h-7 w-7 border border-white/20">
                      <AvatarImage
                        src={getAvatarUrl(user.avatarUrl)}
                      />
                      <AvatarFallback className="bg-primary/20 text-xs">
                        {user.firstName?.[0]?.toUpperCase()}
                        {user.lastName?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/ar-studio" className="cursor-pointer">
                      <Car className="mr-2 h-4 w-4" />
                      <span>AR Studio</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <HamburgerMenuOverlay
                items={[
                  { label: "Home", icon: <Home className="w-5 h-5 text-primary" />, onClick: () => navigate("/") },
                  { label: "3D Studio", icon: <Car className="w-5 h-5 text-primary" />, onClick: () => navigate("/ar-studio") },
                  { label: "Image Studio", icon: <ImageIcon className="w-5 h-5 text-primary" />, onClick: () => navigate("/image-studio") },
                  { label: "Pricing", icon: <Star className="w-5 h-5 text-primary" />, onClick: () => navigate("/pricing") },
                  { label: "About Us", icon: <Users className="w-5 h-5 text-primary" />, onClick: () => navigate("/about") },
                  { label: "Sign In", icon: <User className="w-5 h-5 text-primary" />, onClick: () => navigate("/login") },
                  { label: "Get Started", icon: <Sparkles className="w-5 h-5 text-primary" />, onClick: () => navigate("/register") },
                ]}
                buttonTop="28px"
                // buttonLeft removed to use default right placement
                buttonSize="sm"
                buttonColor="transparent"
                textColor="#ffffff"
                overlayBackground="rgba(0,0,0,0.95)"
                zIndex={60}
                className="md:hidden"
                menuDirection="vertical"
                menuAlignment="center"
                enableBlur={true}
                customButton={
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Menu className="h-6 w-6 text-white" />
                  </div>
                }
              />
            )}
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4 text-white">
            <Link to="/features">
              <Button
                variant="ghost"
                className="hover:text-primary text-white"
              >
                Features
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                variant="ghost"
                className="hover:text-primary text-white"
              >
                Pricing
              </Button>
            </Link>
            <Link to="/about">
              <Button
                variant="ghost"
                className="hover:text-primary text-white"
              >
                About
              </Button>
            </Link>
            <ThemeToggleButton
              variant="gif"
              url="https://media.giphy.com/media/KBbr4hHl9DSahKvInO/giphy.gif"
              className="text-white hover:text-primary hover:bg-white/10"
            />
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-2 hover:bg-white/10 h-auto py-2 px-3 text-white"
                    )}
                  >
                    <Avatar className="h-8 w-8 border-2 border-white/20">
                      <AvatarImage
                        src={getAvatarUrl(user.avatarUrl)}
                      />
                      <AvatarFallback className="bg-primary/20 text-xs">
                        {user.firstName?.[0]?.toUpperCase()}
                        {user.lastName?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline-block">
                      {user.firstName} {user.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/ar-studio" className="cursor-pointer">
                      <Car className="mr-2 h-4 w-4" />
                      <span>AR Studio</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className={cn(
                      "bg-transparent border-white hover:bg-white/10 text-white"
                    )}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="default"
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav >
  );
};

export default Navbar;
