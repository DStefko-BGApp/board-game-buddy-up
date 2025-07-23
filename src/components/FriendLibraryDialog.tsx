import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Users, Clock, Star, ExternalLink, X } from "lucide-react";
import { useFriendLibrary } from "@/hooks/useFriendLibrary";
import { Profile } from "@/hooks/useProfile";
import { decodeHtmlEntities } from "@/lib/utils";
import { gameStatusOptions } from "./library/GameStatusSelector";

interface FriendLibraryDialogProps {
  friend: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FriendLibraryDialog = ({ friend, open, onOpenChange }: FriendLibraryDialogProps) => {
  const { friendLibrary, isLoading, error } = useFriendLibrary(friend?.user_id || null);

  if (!friend) return null;

  const formatPlayerCount = (min?: number, max?: number) => {
    if (!min && !max) return 'Unknown';
    if (min === max) return `${min}`;
    if (!max) return `${min}+`;
    if (!min) return `Up to ${max}`;
    return `${min}-${max}`;
  };

  const getDisplayTitle = (game: any) => {
    return game.custom_title || decodeHtmlEntities(game.name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-gaming bg-clip-text text-transparent flex items-center justify-between">
            {friend.display_name}'s Library
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Library Not Available</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {!isLoading && !error && friendLibrary.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Games Found</h3>
            <p className="text-muted-foreground">This user hasn't added any games to their library yet.</p>
          </div>
        )}

        {!isLoading && !error && friendLibrary.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {friendLibrary.length} game{friendLibrary.length !== 1 ? 's' : ''} in library
              </p>
            </div>

            <div className="space-y-3">
              {friendLibrary.map((userGame) => (
                <Card key={userGame.id} className="overflow-hidden hover:shadow-gaming transition-all duration-300">
                  <div className="flex gap-3 p-3">
                    <div className="w-16 h-16 flex-shrink-0">
                      {userGame.game.image_url ? (
                        <img 
                          src={userGame.game.thumbnail_url || userGame.game.image_url} 
                          alt={decodeHtmlEntities(userGame.game.name)}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-gaming flex items-center justify-center rounded">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate leading-tight">
                            {decodeHtmlEntities(getDisplayTitle(userGame.game))}
                          </h3>
                          {userGame.game.year_published && (
                            <p className="text-xs text-muted-foreground">({userGame.game.year_published})</p>
                          )}
                        </div>
                        
                        <div className="flex gap-1 ml-2 flex-shrink-0">
                          {userGame.status && (
                            <Badge 
                              variant="secondary" 
                              className={`text-white text-xs px-1.5 py-0.5 ${
                                userGame.status === 'owned' ? 'bg-gaming-green' :
                                userGame.status === 'wishlist' ? 'bg-gaming-purple' :
                                userGame.status === 'played_unowned' ? 'bg-gaming-blue' :
                                userGame.status === 'want_trade_sell' ? 'bg-gaming-orange' :
                                userGame.status === 'on_order' ? 'bg-gaming-yellow text-foreground' :
                                'bg-gaming-slate'
                              }`}
                            >
                              {gameStatusOptions.find(opt => opt.value === userGame.status)?.label || userGame.status}
                            </Badge>
                          )}
                          {userGame.game.is_expansion && (
                            <Badge variant="outline" className="text-gaming-purple border-gaming-purple text-xs px-1.5 py-0.5">
                              Exp
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{formatPlayerCount(userGame.game.min_players, userGame.game.max_players)}</span>
                        </div>
                        {userGame.game.playing_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{userGame.game.playing_time}m</span>
                          </div>
                        )}
                        {userGame.game.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-gaming-yellow fill-current" />
                            <span>{userGame.game.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {userGame.personal_rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-gaming-red">❤️</span>
                            <span>{userGame.personal_rating}/10</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Mechanics */}
                      {(userGame.game.core_mechanic || userGame.game.additional_mechanic_1 || userGame.game.additional_mechanic_2) && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {userGame.game.core_mechanic && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              {userGame.game.core_mechanic}
                            </Badge>
                          )}
                          {userGame.game.additional_mechanic_1 && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              {userGame.game.additional_mechanic_1}
                            </Badge>
                          )}
                          {userGame.game.additional_mechanic_2 && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              {userGame.game.additional_mechanic_2}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="h-7 px-2 text-xs"
                        >
                          <a 
                            href={`https://boardgamegeek.com/boardgame/${userGame.game.bgg_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            BGG
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};