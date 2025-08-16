import React, { useState } from "react";
import { Eye, EyeOff, Car, Zap, Shield, ArrowRight, Check } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    newsletter: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (!formData.acceptTerms) {
      alert("Please accept the terms and conditions!");
      return;
    }

    setIsLoading(true);

    // Simulate registration process
    setTimeout(() => {
      setIsLoading(false);
      console.log("Registration attempt:", formData);
    }, 2000);
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return "bg-red-500";
    if (strength < 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 2) return "Weak";
    if (strength < 4) return "Medium";
    return "Strong";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-dark-gradient" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-automotive-orange opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-automotive-orange-light opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Floating Car Icons */}
      <Car className="absolute top-10 right-10 w-8 h-8 text-automotive-orange opacity-30 animate-float" />
      <Zap className="absolute top-32 left-32 w-6 h-6 text-automotive-orange-light opacity-30 animate-float delay-500" />
      <Shield className="absolute bottom-32 right-20 w-7 h-7 text-automotive-orange opacity-30 animate-float delay-1000" />

      <div className="relative z-10 w-full max-w-md animate-slideIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="w-10 h-10 text-automotive-orange animate-glow" />
            <h1 className="text-4xl font-bold bg-car-gradient bg-clip-text text-transparent">
              CarVizion
            </h1>
          </div>
          <p className="text-muted-foreground">
            Join the future of car customization
          </p>
        </div>

        <Card className="backdrop-blur-lg bg-card/50 border-border shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create Account
            </CardTitle>
            <CardDescription className="text-center">
              Start your journey with AR car customization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      updateFormData("firstName", e.target.value)
                    }
                    className="bg-background/50 border-border focus:border-automotive-orange transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                    className="bg-background/50 border-border focus:border-automotive-orange transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
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
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
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
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 rounded-full flex-1 ${
                            level <= passwordStrength(formData.password)
                              ? getStrengthColor(
                                  passwordStrength(formData.password)
                                )
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Strength:{" "}
                      {getStrengthText(passwordStrength(formData.password))}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      updateFormData("confirmPassword", e.target.value)
                    }
                    className="bg-background/50 border-border focus:border-automotive-orange transition-colors pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500">
                      Passwords do not match
                    </p>
                  )}
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword &&
                  formData.password && (
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Passwords match
                    </p>
                  )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) =>
                      updateFormData("acceptTerms", checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <button
                      type="button"
                      className="text-automotive-orange hover:text-automotive-orange-light"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      className="text-automotive-orange hover:text-automotive-orange-light"
                    >
                      Privacy Policy
                    </button>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) =>
                      updateFormData("newsletter", checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="newsletter"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Subscribe to newsletter for updates and tips
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-car-gradient hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 group"
                disabled={isLoading || !formData.acceptTerms}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Create Account
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
                Already have an account?{" "}
              </span>
              <Link
                to="/login"
                className="text-automotive-orange hover:text-automotive-orange-light font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          By creating an account, you're joining thousands of car enthusiasts
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
