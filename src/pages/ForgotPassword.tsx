import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authApi } from "@/store/authStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.forgotPassword(email);
      
      // In a real app, we wouldn't show the token. 
      // But for dev, we show it so the user can copy it.
      if (response.resetToken) {
          toast.success("Reset link sent! Redirecting...", {
              description: `Dev Token: ${response.resetToken}`,
              duration: 10000,
          });
          // Redirect to reset password page with token in state (optional) or just let them input it
           setTimeout(() => {
                navigate("/reset-password", { state: { token: response.resetToken, email } });
           }, 2000);
      } else {
          toast.success(response.message || "Reset link sent!");
      }

    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to send reset link";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="w-10 h-10 text-primary " />
            <h1 className="text-4xl font-bold text-primary">CarVizion</h1>
            </div>
        </div>

        <Card className="backdrop-blur-lg bg-card/50 border-border shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-background/50"
                    required
                    />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => navigate("/login")} className="text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
