import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center page-background px-4 cozy-section">
      <div className="w-full max-w-md">
        <Card className="shadow-gaming section-background backdrop-blur-sm border-white/20 text-center">
          <CardContent className="p-8 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-gaming opacity-10 rounded-full blur-xl"></div>
              <AlertCircle className="h-20 w-20 mx-auto text-gaming-red relative" />
            </div>
            <div className="space-y-2">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-gaming-red to-gaming-slate bg-clip-text text-transparent">404</h1>
              <h2 className="text-2xl font-bold">Page Not Found</h2>
              <p className="text-muted-foreground text-lg">
                Oops! The page you're looking for doesn't exist.
              </p>
            </div>
            <Button asChild variant="gaming" size="lg" className="w-full hover-scale shadow-lg">
              <Link to="/">
                <Home className="h-5 w-5 mr-2" />
                Return to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
