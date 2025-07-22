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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Owned Games</p>
              <p className="text-2xl font-bold">{totalOwnedGames}</p>
            </div>
            <BookOpen className="h-8 w-8 text-gaming-purple" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Expansions</p>
              <p className="text-2xl font-bold text-gaming-green">{totalExpansions}</p>
            </div>
            <Puzzle className="h-8 w-8 text-gaming-green" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Base Games</p>
              <p className="text-2xl font-bold text-primary">{totalBaseGames}</p>
            </div>
            <Home className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};