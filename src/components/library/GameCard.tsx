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
  Square,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { decodeHtmlEntities } from "@/lib/utils";
import { gameStatusOptions, GameStatus } from "./GameStatusSelector";

interface GameCardProps {
  userGame: any;
  isExpansion?: boolean;
  isSelectionMode: boolean;
  isSelected: boolean;
  onEdit: (userGame: any) => void;
  onRemove: (gameId: string) => void;
  onSelect: (gameId: string) => void;
  onStatusChange: (userGameId: string, newStatus: GameStatus) => void;
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
  onStatusChange,
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
      <div className="flex gap-3 p-3">
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(userGame.id)}
              className="h-5 w-5 p-0"
            >
              {isSelected ? (
                <CheckSquare className="h-3 w-3 text-primary" />
              ) : (
                <Square className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}

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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 px-2 text-xs gap-1 text-white border-0 ${
                        userGame.status === 'owned' ? 'bg-gaming-green hover:bg-gaming-green/80' :
                        userGame.status === 'wishlist' ? 'bg-gaming-purple hover:bg-gaming-purple/80' :
                        userGame.status === 'played_unowned' ? 'bg-gaming-blue hover:bg-gaming-blue/80' :
                        userGame.status === 'want_trade_sell' ? 'bg-gaming-orange hover:bg-gaming-orange/80' :
                        userGame.status === 'on_order' ? 'bg-gaming-yellow hover:bg-gaming-yellow/80 text-foreground' :
                        'bg-gaming-slate hover:bg-gaming-slate/80'
                      }`}
                    >
                      {gameStatusOptions.find(opt => opt.value === userGame.status)?.label || userGame.status}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-50">
                    {gameStatusOptions.map((option) => (
                      <DropdownMenuItem 
                        key={option.value}
                        onClick={() => onStatusChange(userGame.id, option.value)}
                        className="text-xs"
                      >
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span>{userGame.game.rating.toFixed(1)}</span>
              </div>
            )}
            {userGame.personal_rating && (
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-gaming-red fill-current" />
                <span>{userGame.personal_rating}/10</span>
              </div>
            )}
          </div>
          
          {/* Core and additional mechanics on same line */}
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
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(userGame)}
              className="h-7 px-2 text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRemove(userGame.id)}
              disabled={isRemoving}
              className="text-destructive hover:text-destructive h-7 px-2"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};