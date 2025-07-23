import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Dice6, 
  Calendar, 
  Users, 
  Crown,
  ArrowRight,
  Star
} from "lucide-react";
import heroImage from "@/assets/hero-gaming.jpg";

const Index = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Game Library",
      description: "Organize and manage your personal board game collection",
      link: "/library",
      color: "text-primary",
    },
    {
      icon: Dice6,
      title: "Dice & Tools",
      description: "Roll dice, flip coins, and make random decisions",
      link: "/randomizer",
      color: "text-gaming-blue",
    },
    {
      icon: Calendar,
      title: "Game Nights",
      description: "Plan and organize gaming sessions with friends",
      link: "/game-nights",
      color: "text-gaming-slate",
    },
    {
      icon: Users,
      title: "Friends",
      description: "Connect with other board game enthusiasts",
      link: "/friends",
      color: "text-gaming-green",
    },
  ];

  return (
    <div className="min-h-screen page-background">
      {/* Hero Section */}
      <section 
        className="relative h-[70vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-gaming opacity-50 rounded-full blur-lg"></div>
              <Crown className="h-16 w-16 relative text-white filter drop-shadow-lg" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent leading-tight">
              GameNight
            </h1>
          </div>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Your all-in-one social board game companion. Manage your collection, 
            plan game nights, and connect with friends.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="gaming" size="lg" className="text-lg px-8 py-4 hover-scale shadow-xl">
              <Link to="/auth?tab=signup">
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="hero" size="lg" className="text-lg px-8 py-4 hover-scale">
              <Link to="/randomizer">
                Roll Some Dice
                <Dice6 className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 section-background cozy-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need for Game Night</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From organizing your collection to planning game nights and connecting with friends, 
              GameNight has all the tools you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link} className="group">
                <Card className="h-full hover:shadow-gaming transition-all duration-300 hover:-translate-y-2 cursor-pointer relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-white/10 backdrop-blur-sm">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-gaming opacity-10 rounded-full -translate-y-10 translate-x-10 group-hover:opacity-20 transition-opacity"></div>
                  <CardHeader className="relative">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-xl bg-gradient-gaming/10 group-hover:scale-110 transition-transform">
                        <feature.icon className={`h-8 w-8 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
                    <div className="flex items-center text-primary font-semibold group-hover:gap-3 transition-all">
                      Explore
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-0 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 wooden-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Join the Community</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with board game enthusiasts and level up your game nights
            </p>
            <Button asChild variant="gaming" size="lg" className="text-lg px-8 py-4 hover-scale shadow-xl">
              <Link to="/auth?tab=signup">
                Join the Community
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-gaming texture-subtle cozy-section">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Level Up Your Game Nights?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start organizing your collection and planning amazing game sessions today.
          </p>
          <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-3">
            <Link to="/auth?tab=signup">
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
