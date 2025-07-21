import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  BookOpen, 
  Dice6, 
  Calendar, 
  Trophy, 
  Users,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: "/", icon: Crown, label: "Home" },
    { to: "/library", icon: BookOpen, label: "My Games" },
    { to: "/randomizer", icon: Dice6, label: "Dice & Tools" },
    { to: "/game-nights", icon: Calendar, label: "Game Nights" },
    { to: "/scores", icon: Trophy, label: "Scores" },
    { to: "/friends", icon: Users, label: "Friends" },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b shadow-card-gaming sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Crown className="h-8 w-8 text-primary" />
              <Dice6 className="absolute -top-1 -left-1 h-4 w-4 text-primary/80" />
            </div>
            <span className="text-xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
              GameNight
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;