import * as React from "react";
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
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/20 flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Car className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary">CarVizion</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggleButton
            variant="gif"
            url="https://media.giphy.com/media/KBbr4hHl9DSahKvInO/giphy.gif?cid=790b76112m5eeeydoe7et0cr3j3ekb1erunxozyshuhxx2vl&ep=v1_stickers_search&rid=giphy.gif&ct=s"
          />
          <Link to="/profile">
            <Button variant="ghost" className="text-foreground ">
              Profile
            </Button>
          </Link>
          <Link to="/pricing">
            <Button variant="ghost" className="text-foreground ">
              Pricing
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" className="text-foreground ">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-gradient-to-r from-automotive-orange to-automotive-orange-light hover:opacity-90 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8 animate-slideIn">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
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

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="font-semibold text-lg group">
                  Start Customizing
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg">
                Watch Demo
              </Button>
            </div>
          </div>
          <Spline scene="https://prod.spline.design/EqALjFSvPIIg9NgO/scene.splinecode" />
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
                Join thousands of car enthusiasts who are already using
                CarVizion to customize their rides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-automotive-orange to-automotive-orange-light hover:opacity-90 text-white font-semibold px-8 py-3 w-full sm:w-auto"
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
      <Zap className="absolute top-32 right-20 w-6 h-6 text-primary opacity-30 animate-float delay-500" />
      <Shield className="absolute bottom-40 left-20 w-7 h-7 text-primary opacity-30 animate-float delay-1000" />
      <Car className="absolute top-1/2 left-10 w-8 h-8 text-primary opacity-20 animate-float" />
    </div>
  );
};

export default Index;
