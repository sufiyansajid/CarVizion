import {
  Car,
  Zap,
  Shield,
  ArrowRight,
  Eye,
  Palette,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

const index = () => {
  const features = [
    {
      icon: <Eye className="w-8 h-8 text-automotive-orange" />,
      title: "Augmented Reality",
      description:
        "Visualize modifications in real-time with cutting-edge AR technology",
    },
    {
      icon: <Palette className="w-8 h-8 text-automotive-orange" />,
      title: "AI-Powered Design",
      description:
        "Get personalized recommendations based on your style preferences",
    },
    {
      icon: <Settings className="w-8 h-8 text-automotive-orange" />,
      title: "3D Customization",
      description:
        "Modify colors, body kits, rims, and lighting with precision",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-dark-gradient" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-automotive-orange opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-automotive-orange-light opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Car className="w-8 h-8 text-automotive-orange animate-glow" />
          <h1 className="text-2xl font-bold bg-car-gradient bg-clip-text text-transparent">
            CarVizion
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/profile">
            <Button variant="ghost" className="text-foreground">
              Profile
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" className="text-foreground">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-car-gradient hover:opacity-90 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto animate-slideIn">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Transform Your{" "}
            <span className="bg-car-gradient bg-clip-text text-transparent">
              Dream Car
            </span>{" "}
            with AR
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Experience the future of automotive customization with our
            cutting-edge AR technology. Visualize, customize, and perfect your
            ride before making any changes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-car-gradient hover:opacity-90 text-white font-semibold px-8 py-4 text-lg group"
              >
                Start Customizing
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-automotive-orange text-automotive-orange hover:bg-automotive-orange hover:text-white px-8 py-4 text-lg"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="backdrop-blur-lg bg-card/50 border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slideIn"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-automotive-orange/10 rounded-full flex items-center justify-center">
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

        {/* CTA Section */}
        <div className="text-center mt-20 animate-slideIn">
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-car-gradient hover:opacity-90 text-white font-semibold px-8 py-3 w-full sm:w-auto"
                  >
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-automotive-orange text-automotive-orange hover:bg-automotive-orange hover:text-white px-8 py-3 w-full sm:w-auto"
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
      </div>

      {/* Floating Elements */}
      <Zap className="absolute top-32 right-20 w-6 h-6 text-automotive-orange opacity-30 animate-float delay-500" />
      <Shield className="absolute bottom-40 left-20 w-7 h-7 text-automotive-orange opacity-30 animate-float delay-1000" />
      <Car className="absolute top-1/2 left-10 w-8 h-8 text-automotive-orange-light opacity-20 animate-float" />
    </div>
  );
};

export default index;
