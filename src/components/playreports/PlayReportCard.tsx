import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Trophy, Star, MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { decodeHtmlEntities } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/common/UserAvatar";
import type { PlayReportWithDetails } from "@/types/playReports";
import { useAuth } from "@/contexts/AuthContext";

interface PlayReportCardProps {
  playReport: PlayReportWithDetails;
  onEdit?: (playReport: PlayReportWithDetails) => void;
  onDelete?: (id: string) => void;
}

export function PlayReportCard({ playReport, onEdit, onDelete }: PlayReportCardProps) {
  const { user } = useAuth();
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  
  const isOwner = user?.id === playReport.reporter_id;
  const sortedParticipants = [...playReport.participants].sort((a, b) => {
    // Sort by score (highest first) if both have scores
    if (a.score !== null && a.score !== undefined && b.score !== null && b.score !== undefined) {
      return b.score - a.score;
    }
    // If only one has a score, prioritize it
    if (a.score !== null && a.score !== undefined) return -1;
    if (b.score !== null && b.score !== undefined) return 1;
    
    // Fall back to placement if scores are not available
    if (a.placement && b.placement) {
      return a.placement - b.placement;
    }
    if (a.placement && !b.placement) return -1;
    if (!a.placement && b.placement) return 1;
    return 0;
  });

  // Winner is determined by highest score, or best placement if no scores
  const winner = sortedParticipants.find(p => {
    // If we have scores, the highest score wins
    const hasScores = sortedParticipants.some(sp => sp.score !== null && sp.score !== undefined);
    if (hasScores) {
      return p.score !== null && p.score !== undefined && 
             p.score === Math.max(...sortedParticipants
               .filter(sp => sp.score !== null && sp.score !== undefined)
               .map(sp => sp.score!));
    }
    // Otherwise fall back to placement
    return p.placement === 1;
  });
  const averageRating = playReport.participants
    .filter(p => p.player_rating)
    .reduce((sum, p) => sum + (p.player_rating || 0), 0) / 
    playReport.participants.filter(p => p.player_rating).length || 0;

  const getPlacementIcon = (placement?: number) => {
    if (placement === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (placement === 2) return <Trophy className="h-4 w-4 text-gray-400" />;
    if (placement === 3) return <Trophy className="h-4 w-4 text-amber-600" />;
    return null;
  };

  const getPlacementSuffix = (placement: number) => {
    if (placement === 1) return 'st';
    if (placement === 2) return 'nd';
    if (placement === 3) return 'rd';
    return 'th';
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{playReport.title}</CardTitle>
              {averageRating > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {averageRating.toFixed(1)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link 
                to="/library" 
                className="text-base font-medium text-primary hover:underline flex items-center gap-1"
              >
                {decodeHtmlEntities(playReport.game.custom_title || playReport.game.name)}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
          
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(playReport)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(playReport.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(playReport.date_played), 'MMM d, yyyy')}
          </div>
          
          {playReport.duration_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {playReport.duration_minutes}m
            </div>
          )}
          
          {playReport.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {playReport.location}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Reported by</span>
          <UserAvatar
            displayName={playReport.reporter_profile.display_name}
            avatarUrl={playReport.reporter_profile.avatar_url}
            size="sm"
          />
          <span className="font-medium">{playReport.reporter_profile.display_name}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {playReport.summary && (
          <p className="text-muted-foreground text-sm">{playReport.summary}</p>
        )}

        {/* Players */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Players</h4>
          <div className="space-y-2">
            {sortedParticipants.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {participant.placement && (
                      <span className="text-xs font-medium text-muted-foreground w-6">
                        {participant.placement}{getPlacementSuffix(participant.placement)}
                      </span>
                    )}
                    {getPlacementIcon(participant.placement)}
                  </div>
                  <UserAvatar
                    displayName={participant.profile.display_name}
                    avatarUrl={participant.profile.avatar_url}
                    size="sm"
                  />
                  <span className="font-medium text-sm">
                    {participant.profile.display_name}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-xs">
                  {participant.score !== null && participant.score !== undefined && (
                    <div className="text-center">
                      <div className="font-semibold">{participant.score}</div>
                      <div className="text-muted-foreground">score</div>
                    </div>
                  )}
                  
                  {participant.player_rating && (
                    <div className="text-center">
                      <div className="font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {participant.player_rating}
                      </div>
                      <div className="text-muted-foreground">rating</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Winner highlight */}
        {winner && (
          <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-sm">
              <Trophy className="h-3 w-3" />
              <span className="font-medium">
                🎉 {winner.profile.display_name} won this game!
              </span>
            </div>
          </div>
        )}

        {/* Photos */}
        {playReport.photos && playReport.photos.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Photos</h4>
            <div className="grid grid-cols-3 gap-2">
              {playReport.photos.slice(0, showAllPhotos ? undefined : 3).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Game photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(photo, '_blank')}
                />
              ))}
            </div>
            {playReport.photos.length > 3 && !showAllPhotos && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllPhotos(true)}
              >
                Show {playReport.photos.length - 3} more photos
              </Button>
            )}
          </div>
        )}

        {/* Notes */}
        {playReport.notes && (
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Notes</h4>
            <p className="text-muted-foreground text-sm">{playReport.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}