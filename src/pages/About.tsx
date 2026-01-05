import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Car,
  Target,
  Lightbulb,
  Heart,
  Users,
  Award,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Innovation",
      description:
        "We're constantly pushing the boundaries of AR technology to bring you the most advanced car customization experience.",
    },
    {
      icon: <Heart className="w-8 h-8 text-primary" />,
      title: "Passion",
      description:
        "We're car enthusiasts ourselves, and we understand the passion that drives you to create the perfect ride.",
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Community",
      description:
        "Building a global community of car lovers who share their designs, ideas, and inspiration with each other.",
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: "Excellence",
      description:
        "Committed to delivering the highest quality tools and features that exceed your expectations.",
    },
  ];

  const stats = [
    {
      label: "Active Users",
      value: "50K+",
      icon: <Users className="w-6 h-6" />,
    },
    {
      label: "Designs Created",
      value: "200K+",
      icon: <Car className="w-6 h-6" />,
    },
    { label: "Countries", value: "50+", icon: <Globe className="w-6 h-6" /> },
    {
      label: "Satisfaction",
      value: "98%",
      icon: <Award className="w-6 h-6" />,
    },
  ];

  const milestones = [
    {
      year: "2023",
      title: "The Beginning",
      description:
        "CarVizion was born from a simple idea: what if you could see your car customizations before making any changes?",
    },
    {
      year: "2024",
      title: "AR Revolution",
      description:
        "We launched our first AR visualization tool, revolutionizing how people customize their vehicles.",
    },
    {
      year: "2025",
      title: "Global Expansion",
      description:
        "Reached 50K+ users worldwide and introduced AI-powered design recommendations.",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-10 sm:top-20 left-5 sm:left-20 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-20 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-slideIn">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 sm:mb-6">
            About CarVizion
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            We're on a mission to revolutionize car customization through
            cutting-edge AR technology and AI-powered design tools.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="backdrop-blur-lg bg-card/50 border-border shadow-2xl mb-20">
          <CardHeader className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
              <Lightbulb className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold mb-4">
              Our Mission
            </CardTitle>
            <CardDescription className="text-lg max-w-3xl mx-auto">
              To empower car enthusiasts, designers, and professionals with the
              most advanced AR visualization tools, making car customization
              accessible, intuitive, and inspiring for everyone. We believe that
              everyone should be able to see their vision come to life before
              making any permanent changes.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="backdrop-blur-lg bg-card/50 border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      {value.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold mb-2">
                        {value.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {value.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="backdrop-blur-lg bg-card/50 border-border shadow-lg text-center"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <Card
                key={index}
                className="backdrop-blur-lg bg-card/50 border-border shadow-xl"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {milestone.year}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <Card className="backdrop-blur-lg bg-card/50 border-border shadow-2xl mb-20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-4">
              Join Our Team
            </CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              We're always looking for passionate individuals who share our
              vision. If you're excited about AR technology, car customization,
              or building amazing user experiences, we'd love to hear from you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">View Open Positions</Link>
            </Button>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="backdrop-blur-lg bg-card/50 border-border shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-4">
              Ready to Transform Your Car?
            </CardTitle>
            <CardDescription className="text-lg">
              Join thousands of car enthusiasts who are already using CarVizion
              to bring their visions to life.
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
              <Link to="/features">Explore Features</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
