import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Dice6, 
  Calendar, 
  Trophy, 
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
      color: "text-gaming-purple",
    },
    {
      icon: Calendar,
      title: "Game Nights",
      description: "Plan and organize gaming sessions with friends",
      link: "/game-nights",
      color: "text-gaming-orange",
    },
    {
      icon: Trophy,
      title: "Score Tracker",
      description: "Keep track of game results and player statistics",
      link: "/scores",
      color: "text-gaming-green",
    },
    {
      icon: Users,
      title: "Friends",
      description: "Connect with other board game enthusiasts",
      link: "/friends",
      color: "text-gaming-red",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-[70vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Crown className="h-12 w-12" />
              <Dice6 className="absolute -top-1 -left-1 h-6 w-6 opacity-90" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">GameNight</h1>
          </div>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Your all-in-one social board game companion. Manage your collection, 
            plan game nights, and connect with friends.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="gaming" size="lg" className="text-lg px-8 py-3">
              <Link to="/library">
                Explore Your Library
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="hero" size="lg" className="text-lg px-8 py-3">
              <Link to="/randomizer">
                Roll Some Dice
                <Dice6 className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need for Game Night</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From organizing your collection to tracking scores and connecting with friends, 
              GameNight has all the tools you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link}>
                <Card className="h-full hover:shadow-gaming transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                    <div className="flex items-center mt-4 text-primary font-medium">
                      Learn more
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Join the Community</h2>
            <p className="text-xl text-muted-foreground">
              Thousands of board game enthusiasts are already using GameNight
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                <div className="text-muted-foreground">Games Tracked</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-gaming-green mb-2">5K+</div>
                <div className="text-muted-foreground">Game Nights Planned</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-gaming-orange mb-2">2K+</div>
                <div className="text-muted-foreground">Active Players</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-gaming-purple mb-2">4.9</div>
                <div className="text-muted-foreground flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  User Rating
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-gaming">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Level Up Your Game Nights?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start organizing your collection and planning amazing game sessions today.
          </p>
          <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-3">
            <Link to="/library">
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
