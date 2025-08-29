import * as React from "react";
import {
  Car,
  Zap,
  Shield,
  ArrowRight,
  Eye,
  Palette,
  Settings,
  Menu,
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
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import Spline from "@splinetool/react-spline";

const Index = () => {
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

  return (
    <div className="min-h-screen relative ">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
              <Link to="/profile">
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary"
                >
                  Profile
                </Button>
              </Link>
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

      {/* Hero Section - Update grid layout */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Transform Your <span className="text-primary">Dream Car</span>{" "}
              with AR
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Experience the future of automotive customization with our
              cutting-edge AR technology. Visualize, customize, and perfect your
              ride before making any changes.
            </p>

            {/* Key Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  {React.cloneElement(feature.icon, {
                    className: "w-6 h-6 text-primary",
                  })}
                  <span className="text-lg">{feature.description}</span>
                </div>
              ))}
            </div>

            {/* Update CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  variant="default"
                  className="font-semibold text-lg group w-full sm:w-auto"
                >
                  Start Customizing
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-lg w-full sm:w-auto"
              >
                Watch Demo
              </Button>
            </div>
          </div>
          {/* 3D Model */}
          <div className="aspect-square lg:aspect-auto">
            <Spline scene="https://prod.spline.design/EqALjFSvPIIg9NgO/scene.splinecode" />
          </div>
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

      {/* CTA Section */}
      <div className="text-center mt-20 animate-slideIn">
        <Card className="backdrop-blur-lg bg-card/50 border-border shadow-2xl max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Ready to Get Started?
            </CardTitle>
            <CardDescription className="text-lg">
              Join thousands of car enthusiasts who are already using CarVizion
              to customize their rides
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

      {/* Floating Elements */}
      <Zap className="absolute top-32 right-20 w-6 h-6 text-primary opacity-30 animate-float delay-500" />
      <Shield className="absolute bottom-40 left-20 w-7 h-7 text-primary opacity-30 animate-float delay-1000" />
      <Car className="absolute top-1/2 left-10 w-8 h-8 text-primary opacity-20 animate-float" />
    </div>
  );
};

export default Index;
