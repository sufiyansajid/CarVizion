import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  X,
  Star,
  Zap,
  Shield,
  Crown,
  Camera,
  Palette,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with car customization",
      features: [
        { name: "Basic car models", included: true },
        { name: "5 color presets", included: true },
        { name: "Standard filters", included: true },
        { name: "Save up to 3 designs", included: true },
        { name: "Basic export quality", included: true },
        { name: "Premium AR filters", included: false },
        { name: "Custom decals & stickers", included: false },
        { name: "Unlimited saves", included: false },
        { name: "4K export quality", included: false },
        { name: "Priority support", included: false },
      ],
      buttonText: "Get Started",
      buttonVariant: "outline",
      popular: false,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "Unlock premium features for professional customization",
      features: [
        { name: "Basic car models", included: true },
        { name: "50+ color presets", included: true },
        { name: "Premium AR filters", included: true },
        { name: "Custom decals & stickers", included: true },
        { name: "Unlimited saves", included: true },
        { name: "4K export quality", included: true },
        { name: "Priority support", included: true },
        { name: "Advanced lighting effects", included: true },
        { name: "Exclusive car models", included: true },
        { name: "Commercial license", included: false },
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "default",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$29.99",
      period: "per month",
      description: "For dealerships and professional designers",
      features: [
        { name: "Everything in Pro", included: true },
        { name: "Commercial license", included: true },
        { name: "White-label solution", included: true },
        { name: "API access", included: true },
        { name: "Custom integrations", included: true },
        { name: "Dedicated support", included: true },
        { name: "Team collaboration", included: true },
        { name: "Analytics dashboard", included: true },
        { name: "Custom branding", included: true },
        { name: "Bulk operations", included: true },
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-slideIn">
          <h1 className="text-5xl font-bold text-primary mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Unlock the full potential of AR car customization with our premium
            features. Start free and upgrade when you're ready for more.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge
              variant="outline"
              className="px-4 py-2 text-automotive-orange border-automotive-orange"
            >
              <Star className="h-4 w-4 mr-2" />
              14-day free trial
            </Badge>
            <Badge
              variant="outline"
              className="px-4 py-2 text-automotive-orange-light border-automotive-orange-light"
            >
              <Shield className="h-4 w-4 mr-2" />
              No credit card required
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative backdrop-blur-lg bg-card/50 border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slideIn ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-car-gradient text-white px-4 py-1">
                    <Crown className="h-4 w-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold bg-car-gradient bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    /{plan.period}
                  </span>
                </div>
                <CardDescription className="mt-4 text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  asChild
                  variant={plan.buttonVariant as "default" | "outline"}
                  className={`w-full h-12 ${
                    plan.buttonVariant === "default"
                      ? "bg-car-gradient hover:opacity-90 text-white"
                      : "border-automotive-orange text-automotive-orange hover:bg-automotive-orange hover:text-white"
                  }`}
                >
                  <Link
                    to={plan.name === "Enterprise" ? "/contact" : "/register"}
                  >
                    {plan.buttonText}
                  </Link>
                </Button>

                <Separator />

                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-automotive-orange flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Highlights */}
        <Card className="backdrop-blur-lg bg-card/50 border-border shadow-xl hover:shadow-2xl transition-all duration-300 mb-16 animate-slideIn">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Zap className="h-6 w-6 text-automotive-orange animate-glow" />
              Why Choose Pro?
            </CardTitle>
            <CardDescription>
              Discover the advanced features that make your car customizations
              stand out
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-car-gradient rounded-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Premium AR Filters
                </h3>
                <p className="text-sm text-muted-foreground">
                  Advanced augmented reality filters for realistic car
                  visualization
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-car-gradient rounded-full flex items-center justify-center">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Custom Decals</h3>
                <p className="text-sm text-muted-foreground">
                  Upload and apply your own custom decals and stickers
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-car-gradient rounded-full flex items-center justify-center">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">4K Export</h3>
                <p className="text-sm text-muted-foreground">
                  Export your designs in ultra-high 4K resolution
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-car-gradient rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Priority Support
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get help faster with our dedicated priority support team
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pricing;
