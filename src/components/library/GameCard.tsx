import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  Heart, 
  Trash2, 
  Edit,
  CheckSquare,
  Square
} from "lucide-react";
import { decodeHtmlEntities } from "@/lib/utils";

interface GameCardProps {
  userGame: any;
  isExpansion?: boolean;
  isSelectionMode: boolean;
  isSelected: boolean;
  onEdit: (userGame: any) => void;
  onRemove: (gameId: string) => void;
  onSelect: (gameId: string) => void;
  getDisplayTitle: (game: any) => string;
  isRemoving: boolean;
}

export const GameCard = ({
  userGame,
  isExpansion = false,
  isSelectionMode,
  isSelected,
  onEdit,
  onRemove,
  onSelect,
  getDisplayTitle,
  isRemoving
}: GameCardProps) => {
  const formatPlayerCount = (min?: number, max?: number) => {
    if (!min && !max) return 'Unknown';
    if (min === max) return `${min}`;
    if (!max) return `${min}+`;
    if (!min) return `Up to ${max}`;
    return `${min}-${max}`;
  };

  const cardClasses = `overflow-hidden hover:shadow-gaming transition-all duration-300 ${
    isExpansion ? 'ml-6 border-l-4 border-l-gaming-purple' : ''
  } ${isSelectionMode && isSelected ? 'ring-2 ring-primary' : ''}`;

  return (
    <Card className={cardClasses}>
      <div className="flex gap-4 p-4">
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(userGame.id)}
              className="h-6 w-6 p-0"
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        <div className="w-20 h-20 flex-shrink-0">
          {userGame.game.image_url ? (
            <img 
              src={userGame.game.thumbnail_url || userGame.game.image_url} 
              alt={decodeHtmlEntities(userGame.game.name)}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="w-full h-full bg-gradient-gaming flex items-center justify-center rounded">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg truncate">
                {decodeHtmlEntities(getDisplayTitle(userGame.game))}
              </h3>
              {userGame.game.year_published && (
                <p className="text-sm text-muted-foreground">({userGame.game.year_published})</p>
              )}
            </div>
            
            <div className="flex gap-2 ml-4">
              {userGame.is_owned && (
                <Badge variant="secondary" className="bg-gaming-green text-white">
                  Owned
                </Badge>
              )}
              {userGame.game.is_expansion && (
                <Badge variant="outline" className="text-gaming-purple border-gaming-purple">
                  Expansion
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{formatPlayerCount(userGame.game.min_players, userGame.game.max_players)}</span>
            </div>
            {userGame.game.playing_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{userGame.game.playing_time}min</span>
              </div>
            )}
            {userGame.game.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span>{userGame.game.rating.toFixed(1)} BGG</span>
              </div>
            )}
            {userGame.personal_rating && (
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-gaming-red fill-current" />
                <span>{userGame.personal_rating}/10 Your rating</span>
              </div>
            )}
          </div>
          
          {/* Core mechanic */}
          {userGame.game.core_mechanic && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {userGame.game.core_mechanic}
              </Badge>
            </div>
          )}
          
          {/* Additional mechanics */}
          <div className="mt-2 flex flex-wrap gap-1">
            {userGame.game.additional_mechanic_1 && (
              <Badge variant="outline" className="text-xs">
                {userGame.game.additional_mechanic_1}
              </Badge>
            )}
            {userGame.game.additional_mechanic_2 && (
              <Badge variant="outline" className="text-xs">
                {userGame.game.additional_mechanic_2}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(userGame)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRemove(userGame.id)}
              disabled={isRemoving}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};