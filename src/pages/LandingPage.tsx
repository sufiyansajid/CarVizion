import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Car, Eye, Menu, Palette, Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const taglineSectionRef = useRef(null);
  const taglineRef = useRef(null);

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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(taglineRef.current, {
        xPercent: -77,
        ease: "none",
        scrollTrigger: {
          trigger: taglineSectionRef.current,
          start: "top 0%",
          end: "bottom+=300% top",
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
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* <section id="nav_section">
       
      </section> */}

      <section id="video_section" className="h-screen w-screen relative ">
        <nav className="absolute inset-0 z-50 bg-transparent border-b border-border/20  ">
          <div className="max-w-90rem mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between py-4 md:py-6">
              <div className="flex items-center gap-2">
                <Car className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary">CarVizion</h1>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </div>

              {/* Desktop navigation */}
              <div className="hidden md:flex items-center gap-4">
                <ThemeToggleButton
                  variant="gif"
                  url="https://media.giphy.com/media/KBbr4hHl9DSahKvInO/giphy.gif"
                />
                <Link to="/pricing">
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-primary"
                  >
                    Pricing
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="border-primary text-foreground"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          src="/video/landing-page.mp4"
        ></video>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h1
            className="text-[16vw] font-extrabold text-transparent uppercase"
            style={{
              WebkitTextStroke: "2px white", // outline color and thickness
            }}
          >
            Carvizion
          </h1>
        </div>
      </section>

      <section
        id="tagline_section"
        ref={taglineSectionRef}
        className="h-screen relative z-10 bg-secondary flex items-center justify-start px-[3vw] overflow-hidden"
      >
        <h1
          ref={taglineRef}
          className="text-[20vw] font-bold uppercase text-black dark:text-white whitespace-nowrap"
        >
          Transform Your Dream Car with AR
        </h1>
      </section>

      <section id="features_section" className="bg-background">
        <div className="grid md:grid-cols-3 gap-8 my-20 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="backdrop-blur-lg bg-card/50 border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slideIn"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="cta_section">
        <div className="text-center my-20 animate-slideIn">
          <Card className="backdrop-blur-lg bg-card/50 border-border shadow-2xl max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                Ready to Get Started?
              </CardTitle>
              <CardDescription className="text-lg">
                Join thousands of car enthusiasts who are already using
                CarVizion to customize their rides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Update bottom CTA section buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="default"
                    className="font-semibold w-full sm:w-auto"
                  >
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                No credit card required • Start customizing in seconds
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
