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
  Car,
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
      <div className="absolute inset-0 bg-dark-gradient" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-automotive-orange opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-automotive-orange-light opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-automotive-orange opacity-5 rounded-full blur-3xl animate-pulse delay-500" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-slideIn">
          <h1 className="text-5xl font-bold bg-car-gradient bg-clip-text text-transparent mb-6">
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
                plan.popular ? "ring-2 ring-automotive-orange" : ""
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
        <Card
          className="backdrop-blur-lg bg-card/50 border-border shadow-xl hover:shadow-2xl transition-all duration-300 mb-16 animate-slideIn"
          style={{ animationDelay: "600ms" }}
        >
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

        {/* FAQ Section */}
        <Card
          className="backdrop-blur-lg bg-card/50 border-border shadow-xl hover:shadow-2xl transition-all duration-300 animate-slideIn"
          style={{ animationDelay: "800ms" }}
        >
          <CardHeader>
            <CardTitle className="text-2xl">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Can I cancel anytime?
                </h4>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time. Your
                  premium features will remain active until the end of your
                  billing period.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Is there a free trial?
                </h4>
                <p className="text-muted-foreground">
                  Yes! We offer a 14-day free trial for the Pro plan. No credit
                  card required to start.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  What payment methods do you accept?
                </h4>
                <p className="text-muted-foreground">
                  We accept all major credit cards, PayPal, and bank transfers
                  for Enterprise plans.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Can I upgrade or downgrade?
                </h4>
                <p className="text-muted-foreground">
                  Absolutely! You can change your plan at any time from your
                  account settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Elements */}
        <Zap className="absolute top-32 right-20 w-6 h-6 text-automotive-orange opacity-30 animate-float delay-500" />
        <Shield className="absolute bottom-40 left-20 w-7 h-7 text-automotive-orange opacity-30 animate-float delay-1000" />
        <Car className="absolute top-1/2 left-10 w-8 h-8 text-automotive-orange-light opacity-20 animate-float" />
        <Crown className="absolute top-1/4 right-1/4 w-6 h-6 text-automotive-orange opacity-25 animate-float delay-700" />
      </div>
    </div>
  );
};

export default Pricing;
