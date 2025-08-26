import { useState } from "react";
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
  ChevronRight,
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
  onGroupGames?: (draggedGameId: string, targetGameId: string) => void;
  hasExpansions?: boolean;
  isExpanded?: boolean;
  onToggleExpansion?: () => void;
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
  isRemoving,
  onGroupGames,
  hasExpansions = false,
  isExpanded = false,
  onToggleExpansion
}: GameCardProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const formatPlayerCount = (min?: number, max?: number) => {
    if (!min && !max) return 'Unknown';
    if (min === max) return `${min}`;
    if (!max) return `${min}+`;
    if (!min) return `Up to ${max}`;
    return `${min}-${max}`;
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isSelectionMode) return; // Disable drag during selection mode
    e.dataTransfer.setData('text/plain', userGame.id);
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isSelectionMode || !onGroupGames) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only trigger drag leave if actually leaving the card (not just child elements)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isSelectionMode || !onGroupGames) return;
    e.preventDefault();
    setIsDragOver(false);
    const draggedGameId = e.dataTransfer.getData('text/plain');
    if (draggedGameId && draggedGameId !== userGame.id) {
      onGroupGames(draggedGameId, userGame.id);
    }
  };

  const cardClasses = `overflow-hidden hover:shadow-gaming transition-all duration-300 cursor-pointer ${
    !isSelectionMode ? 'hover:scale-[1.02]' : ''
  } ${isExpansion ? 'ml-6 border-l-4 border-l-gaming-purple' : ''} ${
    isSelectionMode && isSelected ? 'ring-2 ring-primary' : ''
  } ${isDragOver ? 'ring-2 ring-gaming-purple bg-gaming-purple/10' : ''}`;

  return (
    <Card 
      className={cardClasses}
      draggable={!isSelectionMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isSelectionMode && onEdit(userGame)}
    >
      <div className="flex gap-3 p-2.5">
        <div className="w-18 h-18 flex-shrink-0">
          {userGame.game.image_url ? (
            <img 
              src={userGame.game.thumbnail_url || userGame.game.image_url} 
              alt={decodeHtmlEntities(userGame.game.name)}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="w-full h-full bg-gradient-gaming flex items-center justify-center rounded">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate leading-tight">
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
                      onClick={(e) => e.stopPropagation()}
                      className={`h-5 px-1.5 text-xs gap-1 text-white border-0 ${
                        userGame.status === 'owned' ? 'bg-gaming-green hover:bg-gaming-green/80' :
                        userGame.status === 'wishlist' ? 'bg-gaming-purple hover:bg-gaming-purple/80' :
                        userGame.status === 'played_unowned' ? 'bg-gaming-blue hover:bg-gaming-blue/80' :
                        userGame.status === 'want_trade_sell' ? 'bg-gaming-orange hover:bg-gaming-orange/80' :
                        userGame.status === 'on_order' ? 'bg-gaming-yellow hover:bg-gaming-yellow/80 text-foreground' :
                        'bg-gaming-slate hover:bg-gaming-slate/80'
                      }`}
                    >
                      {gameStatusOptions.find(opt => opt.value === userGame.status)?.label || userGame.status}
                      <ChevronDown className="h-2.5 w-2.5" />
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
                <Badge variant="outline" className="text-gaming-purple border-gaming-purple text-xs px-1 py-0">
                  Exp
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1.5">
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
                <Heart className="h-3 w-3 text-gaming-red fill-current" />
                <span>{userGame.personal_rating}/10</span>
              </div>
            )}
          </div>
          
          {/* Core and additional mechanics */}
          {(userGame.game.core_mechanic || userGame.game.additional_mechanic_1 || userGame.game.additional_mechanic_2) && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {userGame.game.core_mechanic && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {userGame.game.core_mechanic}
                </Badge>
              )}
              {userGame.game.additional_mechanic_1 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {userGame.game.additional_mechanic_1}
                </Badge>
              )}
              {userGame.game.additional_mechanic_2 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {userGame.game.additional_mechanic_2}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex gap-1.5 items-center">
              {/* Expansion toggle button */}
              {hasExpansions && onToggleExpansion && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpansion();
                  }}
                  className="h-6 px-1.5 text-xs text-gaming-purple hover:text-gaming-purple hover:bg-gaming-purple/10"
                  title={`${isExpanded ? 'Hide' : 'Show'} expansions`}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 mr-1" />
                  ) : (
                    <ChevronRight className="h-3 w-3 mr-1" />
                  )}
                  Exp
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(userGame);
                }}
                className="h-6 px-1.5 text-xs"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              {/* Show game source indicator */}
              {userGame.game.bgg_id < 500000 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const bggUrl = `https://boardgamegeek.com/boardgame/${userGame.game.bgg_id}`;
                    // Try to open in new tab, if blocked, copy to clipboard
                    const newWindow = window.open(bggUrl, '_blank');
                    if (!newWindow) {
                      navigator.clipboard.writeText(bggUrl).then(() => {
                        // You could add a toast notification here
                        console.log('BGG URL copied to clipboard:', bggUrl);
                      });
                    }
                  }}
                  className="h-6 px-1.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800"
                  title="View on BoardGameGeek (or copy link if blocked)"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  BGG Game
                </Button>
              ) : (
                <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium h-6 px-1.5 bg-muted text-muted-foreground">
                  Manual Entry
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(userGame.id);
              }}
              disabled={isRemoving}
              className="text-destructive hover:text-destructive h-6 px-1.5"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};