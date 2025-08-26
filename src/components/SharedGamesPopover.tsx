import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, BookOpen, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserGames } from "@/hooks/useUserGames";
import { decodeHtmlEntities } from "@/lib/utils";

interface SharedGame {
  name: string;
  bgg_id?: number;
  image_url?: string;
  thumbnail_url?: string;
}

interface SharedGamesPopoverProps {
  friendUserId: string;
  friendName: string;
  sharedCount: number;
  isLibraryPublic: boolean;
  children: React.ReactNode;
}

export const SharedGamesPopover = ({ 
  friendUserId, 
  friendName, 
  sharedCount, 
  isLibraryPublic,
  children 
}: SharedGamesPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [sharedGames, setSharedGames] = useState<SharedGame[]>([]);
  const [loading, setLoading] = useState(false);
  const { userGames } = useUserGames();

  useEffect(() => {
    if (open && sharedGames.length === 0 && isLibraryPublic) {
      loadSharedGames();
    }
  }, [open, isLibraryPublic]);

  const loadSharedGames = async () => {
    if (!userGames || !isLibraryPublic) return;

    setLoading(true);
    try {
      const { data: friendGames, error } = await supabase
        .from('user_games')
        .select('games:game_id(name, bgg_id, image_url, thumbnail_url)')
        .eq('user_id', friendUserId)
        .eq('is_owned', true);

      if (error || !friendGames) {
        console.error('Error fetching friend games:', error);
        return;
      }

      const friendGameNames = friendGames
        .map(ug => ({
          name: ug.games?.name,
          bgg_id: ug.games?.bgg_id,
          image_url: ug.games?.image_url,
          thumbnail_url: ug.games?.thumbnail_url,
        }))
        .filter(game => game.name);
      
      const userGameNames = userGames
        .map(ug => ug.name?.toLowerCase())
        .filter(Boolean);

      const shared = friendGameNames.filter(game => 
        userGameNames.includes(game.name?.toLowerCase())
      );

      setSharedGames(shared as SharedGame[]);
    } catch (error) {
      console.error('Error loading shared games:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLibraryPublic || sharedCount === 0) {
    return <>{children}</>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="cursor-pointer">
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Shared Games with {friendName}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {sharedCount} game{sharedCount !== 1 ? 's' : ''} you both own
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {!loading && sharedGames.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No shared games found</p>
            </div>
          )}

          {!loading && sharedGames.length > 0 && (
            <div className="p-4 space-y-3">
              {sharedGames.map((game, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 flex-shrink-0">
                        {game.thumbnail_url || game.image_url ? (
                          <img 
                            src={game.thumbnail_url || game.image_url} 
                            alt={decodeHtmlEntities(game.name)}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-gaming flex items-center justify-center rounded">
                            <BookOpen className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm leading-tight truncate">
                          {decodeHtmlEntities(game.name)}
                        </h4>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="text-xs bg-gaming-green/10 text-gaming-green">
                            Shared
                          </Badge>
                          {game.bgg_id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                              className="h-6 px-2 text-xs"
                            >
                              <a 
                                href={`https://boardgamegeek.com/boardgame/${game.bgg_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};