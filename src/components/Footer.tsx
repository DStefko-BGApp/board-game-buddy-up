import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Crown, Mail, HelpCircle } from "lucide-react";
import { ContactSupportDialog } from "@/components/ContactSupportDialog";

const Footer = () => {
  return (
    <footer className="bg-card/80 backdrop-blur-sm border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and Copyright */}
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 animate-gradient-fade" />
            <div className="text-center md:text-left">
              <span className="text-lg font-bold bg-gradient-to-r from-primary via-gaming-green to-primary bg-clip-text text-transparent">
                GameNight
              </span>
              <p className="text-sm text-muted-foreground">
                © 2024 GameNight. Level up your game nights.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground">•</span>
            <a 
              href="mailto:support@gamenight.example.com" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <span className="text-muted-foreground">•</span>
            <a 
              href="mailto:support@gamenight.example.com" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </a>
          </div>

          {/* Need Help Button */}
          <ContactSupportDialog>
            <Button variant="outline" size="sm" className="hover-scale">
              <HelpCircle className="h-4 w-4 mr-2" />
              Need Help?
            </Button>
          </ContactSupportDialog>
        </div>
      </div>
    </footer>
  );
};

export default Footer;