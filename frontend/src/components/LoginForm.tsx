import React, { useState } from "react";
import { Eye, EyeOff, Car, Zap, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login attempt:", { email, password });
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-dark-gradient" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-automotive-orange opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-automotive-orange-light opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Floating Car Icons */}
      <Car className="absolute top-10 left-10 w-8 h-8 text-automotive-orange opacity-30 animate-float" />
      <Zap className="absolute top-20 right-32 w-6 h-6 text-automotive-orange-light opacity-30 animate-float delay-500" />
      <Shield className="absolute bottom-32 left-20 w-7 h-7 text-automotive-orange opacity-30 animate-float delay-1000" />

      <div className="relative z-10 w-full max-w-md animate-slideIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="w-10 h-10 text-automotive-orange animate-glow" />
            <h1 className="text-4xl font-bold bg-car-gradient bg-clip-text text-transparent">
              CarVizion
            </h1>
          </div>
          <p className="text-muted-foreground">
            Transform your ride with AR customization
          </p>
        </div>

        <Card className="backdrop-blur-lg bg-card/50 border-border shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to continue customizing your dream car
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border focus:border-automotive-orange transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 border-border focus:border-automotive-orange transition-colors pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-car-gradient hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative">
              <Separator className="my-4" />
              <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                OR
              </span>
            </div>

            <Button
              variant="outline"
              className="w-full border-border hover:bg-muted/50 transition-colors"
            >
              Continue with Google
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <button className="text-automotive-orange hover:text-automotive-orange-light font-medium transition-colors">
                Sign up
              </button>
            </div>

            <div className="text-center">
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Forgot your password?
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
