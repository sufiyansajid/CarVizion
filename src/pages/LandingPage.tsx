import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Car,
  CheckCircle,
  Clock,
  Eye,
  Globe,
  Menu,
  Palette,
  Settings,
  Star,
  Users,
  Sparkles,
  Zap,
  Layers,
  User,
  LogOut,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
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
import api from "@/store/baseApi";
import { toast } from "sonner";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const taglineSectionRef = useRef<HTMLDivElement | null>(null);
  const taglineRef = useRef<HTMLHeadingElement | null>(null);
  const floatingIconsRef = useRef<HTMLDivElement | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

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
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const features = [
    {
      icon: <Eye className="w-8 h-8 text-primary" />,
      title: "Augmented Reality",
      description:
        "Visualize modifications in real-time with cutting-edge AR technology",
    },
    {
      icon: <Palette className="w-8 h-8 text-primary" />,
      title: "AI-Powered Design",
      description:
        "Get personalized recommendations based on your style preferences",
    },
    {
      icon: <Settings className="w-8 h-8 text-primary" />,
      title: "3D Customization",
      description:
        "Modify colors, body kits, rims, and lighting with precision",
    },
  ];

  const stats = [
    {
      label: "Cars Customized",
      value: "12K+",
      icon: <Car className="w-6 h-6" />,
    },
    {
      label: "Avg. Session Time",
      value: "18m",
      icon: <Clock className="w-6 h-6" />,
    },
    {
      label: "Customer Satisfaction",
      value: "4.9/5",
      icon: <Star className="w-6 h-6" />,
    },
    {
      label: "Global Community",
      value: "25+ Countries",
      icon: <Globe className="w-6 h-6" />,
    },
  ];

  const workflowSteps = [
    {
      title: "Scan or Upload",
      description:
        "Start with a quick scan of your vehicle or upload existing photos for instant processing.",
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
    },
    {
      title: "Customize in 3D",
      description:
        "Experiment with colors, body kits, lighting, and accessories inside immersive AR scenes.",
      icon: <Settings className="w-6 h-6 text-primary" />,
    },
    {
      title: "Share & Collaborate",
      description:
        "Invite friends or clients to view live previews, comment, and co-create the perfect configuration.",
      icon: <Users className="w-6 h-6 text-primary" />,
    },
  ];

  const testimonials = [
    {
      name: "Maya R.",
      role: "Professional Detailer",
      quote:
        "CarVizion helps me show clients the finished look before I touch their cars. It’s boosted my close rate by 40%.",
    },
    {
      name: "Jordan P.",
      role: "Motorsport Enthusiast",
      quote:
        "Swapping rims, colors, and lighting setups in AR is addictive—and seeing it in real-time sealed the deal.",
    },
    {
      name: "Lucas T.",
      role: "Custom Shop Owner",
      quote:
        "The collaborative workspace lets my designers and customers iterate together seamlessly.",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(taglineRef.current, {
        xPercent: -77,
        ease: "none",
        scrollTrigger: {
          trigger: taglineSectionRef.current,
          start: "top 0%",
          end: "bottom+=200% top",
          scrub: 2,
          pin: true,
          // markers: true,
        },
      });

      gsap.to("#video_section video", {
        opacity: 0,
        scrollTrigger: {
          trigger: taglineSectionRef.current,
          start: "top 100%",
          end: "top 30%",
          scrub: true,
        },
      });

      // Floating icons animation
      if (floatingIconsRef.current) {
        const icons = floatingIconsRef.current.children;
        Array.from(icons).forEach((icon: any, index: number) => {
          const randomY = gsap.utils.random(-30, 30);
          const randomX = gsap.utils.random(-20, 20);
          const randomRot = gsap.utils.random(-15, 15);
          const randomDur = gsap.utils.random(2, 4);

          gsap.to(icon, {
            y: randomY,
            x: randomX,
            rotation: randomRot,
            duration: randomDur,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.2,
          });
        });
      }

      gsap.utils.toArray<HTMLElement>(".stat-card").forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
          },
        });
      });

      gsap.utils
        .toArray<HTMLElement>(".workflow-step")
        .forEach((step, index) => {
          gsap.from(step, {
            opacity: 0,
            x: index % 2 === 0 ? -60 : 60,
            duration: 0.9,
            scrollTrigger: {
              trigger: step,
              start: "top 85%",
            },
          });
        });

      gsap.utils
        .toArray<HTMLElement>(".testimonial-card")
        .forEach((card, index) => {
          gsap.from(card, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            delay: index * 0.15,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
            },
          });
        });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Sticky Header - Above Video Section */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-transparent border-b border-white/20 shadow-lg backdrop-blur-sm">
        <div className="max-w-90rem mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4 md:py-6">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
              <Car className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow">
                CarVizion
              </h1>
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
                      className="bg-black/40 text-white hover:bg-black/60 h-auto p-1.5"
                    >
                      <Avatar className="h-7 w-7 border border-white/20">
                        <AvatarImage
                          src={
                            user.avatarUrl
                              ? user.avatarUrl.startsWith("/uploads")
                                ? `http://localhost:3001${user.avatarUrl}`
                                : user.avatarUrl
                              : undefined
                          }
                        />
                        <AvatarFallback className="bg-primary/20 text-white text-xs">
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/40 text-white hover:bg-black/60"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              )}
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-4 text-white">
              <Link to="/features">
                <Button
                  variant="ghost"
                  className="text-white hover:text-primary"
                >
                  Features
                </Button>
              </Link>
              <Link to="/pricing">
                <Button
                  variant="ghost"
                  className="text-white hover:text-primary"
                >
                  Pricing
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant="ghost"
                  className="text-white hover:text-primary"
                >
                  About
                </Button>
              </Link>
              <ThemeToggleButton
                variant="gif"
                url="https://media.giphy.com/media/KBbr4hHl9DSahKvInO/giphy.gif"
              />
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-white hover:bg-white/10 h-auto py-2 px-3"
                    >
                      <Avatar className="h-8 w-8 border-2 border-white/20">
                        <AvatarImage
                          src={
                            user.avatarUrl
                              ? user.avatarUrl.startsWith("/uploads")
                                ? `http://localhost:3001${user.avatarUrl}`
                                : user.avatarUrl
                              : undefined
                          }
                        />
                        <AvatarFallback className="bg-primary/20 text-white text-xs">
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
                      className="border-white text-white hover:bg-white/10"
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
      </nav>

      <section
        id="video_section"
        className="h-[85vh] md:h-screen w-screen relative"
      >
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          // src="/video/256067.mp4"
          src="/video/video.mp4"
          // src="https://drive.google.com/file/d/1e82PiUzQd3co8Io46ik0whR1Irji80Aa/view?usp=sharing"
        ></video>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pb-16 sm:pb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background/80" />
          <h1
            className="text-[10vw] sm:text-[14vw] md:text-[16vw] font-extrabold text-transparent uppercase"
            style={{
              WebkitTextStroke: "2px white", // outline color and thickness
            }}
          >
            Carvizion
          </h1>
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl lg:text-2xl text-foreground/80 max-w-xl px-4">
            Immerse yourself in a new era of automotive visualization. Design
            with precision, share with confidence.
          </p>
          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 z-10 px-4">
            <Link to="/register">
              <Button
                size="lg"
                className="font-semibold shadow-lg shadow-primary/30 w-full sm:w-auto text-sm sm:text-base"
              >
                Launch AR Studio
              </Button>
            </Link>
            <Link to="/demo">
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-foreground w-full sm:w-auto text-sm sm:text-base"
              >
                Book Live Demo
              </Button>
            </Link>
          </div>
          <div className="absolute bottom-6 sm:bottom-10 flex flex-col items-center gap-2 text-foreground/70 animate-bounce z-20">
            <span className="text-[10px] sm:text-xs tracking-[0.4em] uppercase">
              Explore
            </span>
            <div className="w-px h-8 sm:h-12 bg-foreground/40" />
          </div>
        </div>
      </section>

      <section
        id="tagline_section"
        ref={taglineSectionRef}
        className="h-screen relative z-10 bg-secondary flex items-center justify-start px-4 sm:px-[3vw] overflow-hidden"
      >
        {/* Floating Icons */}
        <div
          ref={floatingIconsRef}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-[10%] left-[5%] text-primary/20 dark:text-primary/30">
            <Sparkles className="w-8 h-8 md:w-12 md:h-12" />
          </div>
          <div className="absolute top-[20%] right-[8%] text-primary/20 dark:text-primary/30">
            <Zap className="w-6 h-6 md:w-10 md:h-10" />
          </div>
          <div className="absolute bottom-[15%] left-[10%] text-primary/20 dark:text-primary/30">
            <Layers className="w-7 h-7 md:w-11 md:h-11" />
          </div>
          <div className="absolute top-[50%] right-[5%] text-primary/20 dark:text-primary/30">
            <Palette className="w-8 h-8 md:w-12 md:h-12" />
          </div>
          <div className="absolute bottom-[25%] right-[15%] text-primary/20 dark:text-primary/30">
            <Eye className="w-6 h-6 md:w-10 md:h-10" />
          </div>
          <div className="absolute top-[35%] left-[15%] text-primary/20 dark:text-primary/30">
            <Settings className="w-7 h-7 md:w-11 md:h-11" />
          </div>
        </div>

        <h1
          ref={taglineRef}
          className="text-[12vw] sm:text-[16vw] md:text-[18vw] lg:text-[20vw] font-bold uppercase text-black dark:text-white whitespace-nowrap"
        >
          Transform Your Dream Car with AR
        </h1>
      </section>

      <section
        id="features_section"
        className="bg-background py-12 sm:py-16 md:py-20"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 my-10 sm:my-16 md:my-20 max-w-6xl mx-auto px-4 sm:px-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="feature-card backdrop-blur-lg bg-card/50 border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slideIn"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground text-sm sm:text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-secondary/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="stat-card rounded-2xl bg-card border border-border/40 p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 shadow-md"
              >
                <div className="rounded-full bg-primary/15 p-2 sm:p-3 text-primary">
                  {stat.icon}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <p className="uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs text-primary">
            Workflow
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground px-4">
            From Inspiration to AR Reality in Minutes
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            CarVizion guides you through every stage of the customization
            journey with intuitive tools and intelligent recommendations that
            stay true to your vision.
          </p>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 md:mt-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {workflowSteps.map((step, index) => (
            <Card
              key={index}
              className="workflow-step bg-card/60 border-border/60 backdrop-blur-xl shadow-xl"
            >
              <CardHeader className="space-y-3 sm:space-y-4">
                <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  {step.icon}
                </div>
                <CardTitle className="text-lg sm:text-xl text-foreground">
                  {index + 1}. {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-sm sm:text-base">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-secondary/30 py-12 sm:py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <p className="uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs text-primary">
            Testimonials
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground px-4">
            Trusted by Creators and Custom Shops Worldwide
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Hear from the makers who bring their boldest ideas to life with
            CarVizion's powerful visualization toolkit.
          </p>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 md:mt-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="testimonial-card bg-card/70 border-border/60 backdrop-blur-xl shadow-lg"
            >
              <CardContent className="pt-6 sm:pt-8 md:pt-10 space-y-4 sm:space-y-6">
                <p className="text-base sm:text-lg italic text-foreground">
                  "{testimonial.quote}"
                </p>
                <div className="text-left">
                  <p className="font-semibold text-primary text-sm sm:text-base">
                    {testimonial.name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="cta_section"
        className="py-12 sm:py-16 md:py-20 pb-20 sm:pb-24 md:pb-32"
      >
        <div className="text-center my-10 sm:my-16 md:my-20 animate-slideIn px-4 sm:px-6">
          <Card className="backdrop-blur-lg bg-card/50 border-border shadow-2xl max-w-2xl mx-auto">
            <CardHeader className="px-4 sm:px-6 pt-6 sm:pt-8">
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                Ready to Get Started?
              </CardTitle>
              <CardDescription className="text-sm sm:text-base md:text-lg mt-2">
                Join thousands of car enthusiasts who are already using
                CarVizion to customize their rides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
              {/* Update bottom CTA section buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="default"
                    className="font-semibold w-full sm:w-auto text-sm sm:text-base"
                  >
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                No credit card required • Start customizing in seconds
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/40 border-t border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Car className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-bold text-primary">CarVizion</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Transform your dream car with cutting-edge AR technology. Design
                with precision, share with confidence.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/features"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/ar-studio"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    AR Studio
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <a
                    href="mailto:info@carvizion.com"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    info@carvizion.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <a
                    href="tel:+1234567890"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    +1 (234) 567-890
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    123 Innovation Drive
                    <br />
                    Tech City, TC 12345
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="border-t border-border/20 pt-8 mb-8">
            <div className="max-w-md mx-auto text-center space-y-4">
              <h4 className="text-lg font-semibold text-foreground">
                Stay Updated
              </h4>
              <p className="text-sm text-muted-foreground">
                Subscribe to our newsletter for the latest updates and features
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="whitespace-nowrap">
                  Subscribe
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/20 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                © {new Date().getFullYear()} CarVizion. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
