import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Puzzle, Home } from "lucide-react";

interface LibraryStatsProps {
  userLibrary: any[] | undefined;
}

export const LibraryStats = ({ userLibrary }: LibraryStatsProps) => {
  const totalOwnedGames = userLibrary?.filter(g => g.is_owned).length || 0;
  const totalExpansions = userLibrary?.filter(g => g.is_owned && g.game?.is_expansion).length || 0;
  const totalBaseGames = userLibrary?.filter(g => g.is_owned && !g.game?.is_expansion).length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-30">
      {/* Total Owned Games Card */}
      <Card className="group hover-scale bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-white/20 shadow-card hover:shadow-gaming transition-all duration-300">
        <CardContent className="p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Owned Games</p>
              <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {totalOwnedGames}
              </p>
            </div>
            <div className="bg-gradient-primary p-4 rounded-2xl shadow-gaming">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Expansions Card */}
      <Card className="group hover-scale bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-white/20 shadow-card hover:shadow-gaming transition-all duration-300">
        <CardContent className="p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-accent opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Expansions</p>
              <p className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                {totalExpansions}
              </p>
            </div>
            <div className="bg-gradient-accent p-4 rounded-2xl shadow-gaming">
              <Puzzle className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Base Games Card */}
      <Card className="group hover-scale bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-white/20 shadow-card hover:shadow-gaming transition-all duration-300">
        <CardContent className="p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-score opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Base Games</p>
              <p className="text-4xl font-bold bg-gradient-score bg-clip-text text-transparent">
                {totalBaseGames}
              </p>
            </div>
            <div className="bg-gradient-score p-4 rounded-2xl shadow-gaming">
              <Home className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};