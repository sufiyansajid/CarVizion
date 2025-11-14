import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
  Palette,
  Settings,
  Sparkles,
  Zap,
  Layers,
  Globe,
  Users,
  Camera,
  Download,
  Share2,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const Features = () => {
  const mainFeatures = [
    {
      icon: <Eye className="w-8 h-8 text-primary" />,
      title: "Augmented Reality",
      description:
        "Visualize modifications in real-time with cutting-edge AR technology. See your customizations come to life before making any changes.",
      highlights: [
        "Real-time AR preview",
        "Multiple viewing angles",
        "Lighting simulation",
        "Environment mapping",
      ],
    },
    {
      icon: <Palette className="w-8 h-8 text-primary" />,
      title: "AI-Powered Design",
      description:
        "Get personalized recommendations based on your style preferences. Our AI learns your taste and suggests perfect customizations.",
      highlights: [
        "Smart color matching",
        "Style recommendations",
        "Trend analysis",
        "Personalized suggestions",
      ],
    },
    {
      icon: <Settings className="w-8 h-8 text-primary" />,
      title: "3D Customization",
      description:
        "Modify colors, body kits, rims, and lighting with precision. Every detail is customizable to match your vision.",
      highlights: [
        "Unlimited color options",
        "Body kit modifications",
        "Rim and tire selection",
        "Advanced lighting effects",
      ],
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Collaboration Tools",
      description:
        "Work together with friends, designers, or clients. Share designs, get feedback, and co-create the perfect look.",
      highlights: [
        "Real-time collaboration",
        "Comment and feedback",
        "Design sharing",
        "Team workspaces",
      ],
    },
    {
      icon: <Camera className="w-8 h-8 text-primary" />,
      title: "High-Quality Export",
      description:
        "Export your designs in stunning 4K resolution. Perfect for presentations, social media, or printing.",
      highlights: [
        "4K export quality",
        "Multiple formats",
        "Batch export",
        "Custom dimensions",
      ],
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "Cloud Sync",
      description:
        "Access your designs from anywhere. All your work is automatically saved and synced across all your devices.",
      highlights: [
        "Automatic cloud backup",
        "Cross-device access",
        "Version history",
        "Secure storage",
      ],
    },
  ];

  const additionalFeatures = [
    {
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      title: "Premium Filters",
      description: "Advanced AR filters for realistic visualization",
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "Lightning Fast",
      description: "Optimized performance for smooth experience",
    },
    {
      icon: <Layers className="w-6 h-6 text-primary" />,
      title: "Layer Management",
      description: "Organize and manage complex customizations",
    },
    {
      icon: <Share2 className="w-6 h-6 text-primary" />,
      title: "Easy Sharing",
      description: "Share designs with one click",
    },
    {
      icon: <Download className="w-6 h-6 text-primary" />,
      title: "Offline Mode",
      description: "Work on designs without internet",
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
      title: "Quality Assurance",
      description: "Industry-standard quality checks",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-16 animate-slideIn">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
            Powerful Features
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to transform your car customization experience.
            From AR visualization to AI-powered design, we've got you covered.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <Card
              key={index}
              className="backdrop-blur-lg bg-card/50 border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slideIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            And So Much More
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card
                key={index}
                className="backdrop-blur-lg bg-card/50 border-border shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="backdrop-blur-lg bg-card/50 border-border shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-4">
              Ready to Experience These Features?
            </CardTitle>
            <CardDescription className="text-lg">
              Start customizing your dream car today with our powerful AR
              visualization tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="group">
              <Link to="/register">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Features;
