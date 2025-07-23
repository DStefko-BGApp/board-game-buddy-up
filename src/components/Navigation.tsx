import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  BookOpen, 
  Dice6, 
  Calendar, 
  Users,
  HelpCircle,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  Settings
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navItems = [
    { to: "/", icon: Crown, label: "Home" },
    { to: "/library", icon: BookOpen, label: "My Games" },
    { to: "/randomizer", icon: Dice6, label: "Dice & Tools" },
    { to: "/game-nights", icon: Calendar, label: "Game Nights" },
    { to: "/friends", icon: Users, label: "Friends" },
    { to: "/faq", icon: HelpCircle, label: "FAQ" },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b shadow-card-gaming sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Crown className="h-8 w-8 animate-gradient-fade" />
            <span className="text-xl font-bold animate-gradient-fade">
              GameNight
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
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
            
            {/* Auth buttons */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
              {user ? (
                <>
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`
                    }
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">
                      {user.user_metadata?.display_name || user.email}
                    </span>
                    <span className="lg:hidden">Account</span>
                  </NavLink>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button asChild variant="gaming" size="sm">
                  <NavLink to="/auth">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </NavLink>
                </Button>
              )}
            </div>
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
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
              
              {/* Mobile Auth */}
              <div className="pt-4 mt-4 border-t border-border">
                {user ? (
                  <>
                    <NavLink
                      to="/settings"
                      className={({ isActive }) =>
                        `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>{user.user_metadata?.display_name || user.email}</span>
                    </NavLink>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button 
                    asChild 
                    variant="gaming" 
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <NavLink to="/auth">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </NavLink>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;