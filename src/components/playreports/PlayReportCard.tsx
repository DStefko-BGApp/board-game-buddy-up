import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Trophy, Star, MoreHorizontal, Edit, Trash2 } from "lucide-react";

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
    if (a.placement && b.placement) {
      return a.placement - b.placement;
    }
    if (a.placement && !b.placement) return -1;
    if (!a.placement && b.placement) return 1;
    return 0;
  });

  const winner = sortedParticipants.find(p => p.placement === 1);
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{playReport.title}</CardTitle>
              {averageRating > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {averageRating.toFixed(1)}
                </Badge>
              )}
            </div>
            <CardDescription className="text-lg font-medium">
              {playReport.game.custom_title || playReport.game.name}
            </CardDescription>
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

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(playReport.date_played), 'PPP')}
          </div>
          
          {playReport.duration_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {playReport.duration_minutes}m
            </div>
          )}
          
          {playReport.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {playReport.location}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span>Reported by</span>
          <UserAvatar
            displayName={playReport.reporter_profile.display_name}
            avatarUrl={playReport.reporter_profile.avatar_url}
            size="sm"
          />
          <span className="font-medium">{playReport.reporter_profile.display_name}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {playReport.summary && (
          <p className="text-muted-foreground">{playReport.summary}</p>
        )}

        {/* Participants */}
        <div className="space-y-3">
          <h4 className="font-semibold">Participants</h4>
          <div className="grid gap-3">
            {sortedParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    displayName={participant.profile.display_name}
                    avatarUrl={participant.profile.avatar_url}
                    size="sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {participant.profile.display_name}
                      </span>
                      {getPlacementIcon(participant.placement)}
                    </div>
                    {participant.player_notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {participant.player_notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  {participant.score !== null && participant.score !== undefined && (
                    <div className="text-center">
                      <div className="font-semibold">{participant.score}</div>
                      <div className="text-muted-foreground">score</div>
                    </div>
                  )}
                  
                  {participant.placement && (
                    <div className="text-center">
                      <div className="font-semibold">
                        {participant.placement}{getPlacementSuffix(participant.placement)}
                      </div>
                      <div className="text-muted-foreground">place</div>
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
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">
                🎉 {winner.profile.display_name} won this game!
              </span>
            </div>
          </div>
        )}

        {/* Photos */}
        {playReport.photos && playReport.photos.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Photos</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {playReport.photos.slice(0, showAllPhotos ? undefined : 6).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Game photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(photo, '_blank')}
                />
              ))}
            </div>
            {playReport.photos.length > 6 && !showAllPhotos && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllPhotos(true)}
              >
                Show {playReport.photos.length - 6} more photos
              </Button>
            )}
          </div>
        )}

        {/* Notes */}
        {playReport.notes && (
          <div className="space-y-2">
            <h4 className="font-semibold">Notes</h4>
            <p className="text-muted-foreground">{playReport.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}