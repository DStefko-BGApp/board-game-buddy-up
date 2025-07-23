import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Clock, Calendar, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/hooks/useProfile";
import { useUserGames } from "@/hooks/useUserGames";
import { useNavigate } from "react-router-dom";

interface FriendProfileDialogProps {
  friend: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FriendProfileDialog = ({ friend, open, onOpenChange }: FriendProfileDialogProps) => {
  const { userGames } = useUserGames();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!friend) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-gaming-green";
      case "away":
        return "bg-gaming-slate";
      case "busy":
        return "bg-gaming-red";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "away":
        return "Away";
      case "busy":
        return "Busy";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
            Friend Profile
          </DialogTitle>
        </DialogHeader>

        <Card className="bg-card/95 backdrop-blur-sm border-white/20">
          <CardContent className="p-0">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-gaming-blue/15 via-primary/8 to-gaming-green/15 p-6 rounded-t-2xl border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-white/30">
                    {friend.avatar_url ? (
                      <AvatarImage src={friend.avatar_url} alt="Profile" />
                    ) : (
                      <AvatarFallback className="bg-gradient-gaming text-white font-bold text-xl">
                        {friend.display_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-foreground">
                      {friend.display_name}
                    </h3>
                    <Badge 
                      variant={friend.status === "online" ? "default" : "outline"} 
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        friend.status === "online" 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : friend.status === "away" 
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : friend.status === "busy"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {getStatusText(friend.status)}
                    </Badge>
                    {friend.library_public && (
                      <Badge variant="secondary" className="bg-gaming-green/30 text-foreground">
                        Public Library
                      </Badge>
                    )}
                  </div>
                  {friend.bio && (
                    <p className="text-muted-foreground italic">
                      "{friend.bio}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Gaming Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friend.gaming_experience && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold text-muted-foreground">Experience</p>
                    </div>
                    <p className="font-bold capitalize">{friend.gaming_experience}</p>
                  </div>
                )}
                
                {friend.gaming_style && (
                  <div className="bg-gaming-green/10 border border-gaming-green/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-gaming-green" />
                      <p className="text-sm font-semibold text-muted-foreground">Gaming Style</p>
                    </div>
                    <p className="font-bold capitalize">{friend.gaming_style}</p>
                  </div>
                )}
                
                {friend.preferred_player_count && (
                  <div className="bg-gaming-red/10 border border-gaming-red/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-gaming-red" />
                      <p className="text-sm font-semibold text-muted-foreground">Preferred Players</p>
                    </div>
                    <p className="font-bold">{friend.preferred_player_count}</p>
                  </div>
                )}
                
                {friend.location && (
                  <div className="bg-gaming-slate/10 border border-gaming-slate/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-gaming-slate rounded-full" />
                      <p className="text-sm font-semibold text-muted-foreground">Location</p>
                    </div>
                    <p className="font-bold">{friend.location}</p>
                  </div>
                )}
                
                {friend.availability && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold text-muted-foreground">Available</p>
                    </div>
                    <p className="font-bold">{friend.availability}</p>
                  </div>
                )}
                
                <div className="bg-gaming-green/10 border border-gaming-green/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gaming-green" />
                    <p className="text-sm font-semibold text-muted-foreground">Joined</p>
                  </div>
                  <p className="font-bold">{new Date(friend.created_at).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</p>
                </div>
              </div>

              {/* Social Handles */}
              {(friend.bgg_username || friend.discord_handle) && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Social Handles</h4>
                  <div className="flex gap-3">
                    {friend.bgg_username && (
                      <Badge variant="outline" className="bg-gaming-red/5 border-gaming-red/20 text-gaming-red">
                        BGG: {friend.bgg_username}
                      </Badge>
                    )}
                    {friend.discord_handle && (
                      <Badge variant="outline" className="bg-gaming-blue/5 border-gaming-blue/20 text-gaming-blue">
                        Discord: {friend.discord_handle}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Favorite Games */}
              {friend.favorite_games && friend.favorite_games.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    🎲 Favorite Games
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {friend.favorite_games.map((game) => {
                      const gameInLibrary = userGames.find(ug => ug.name && ug.name.toLowerCase() === game.toLowerCase());
                      return (
                        <Badge 
                          key={game} 
                          variant="outline" 
                          className={`bg-gaming-green/5 border-gaming-green/20 ${gameInLibrary ? 'cursor-pointer hover:bg-gaming-green/10 hover:border-gaming-green/30 transition-colors' : ''}`}
                          onClick={gameInLibrary ? () => {
                            navigate(`/library?game=${encodeURIComponent(game)}`);
                            onOpenChange(false);
                          } : undefined}
                          title={gameInLibrary ? 'Click to view in library' : undefined}
                        >
                          {game}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Favorite Mechanics */}
              {friend.favorite_mechanics && friend.favorite_mechanics.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    ⚙️ Favorite Mechanics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {friend.favorite_mechanics.map((mechanic) => (
                      <Badge key={mechanic} variant="outline" className="bg-gaming-red/5 border-gaming-red/20">
                        {mechanic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button 
                  variant="gaming" 
                  className="flex-1"
                  onClick={() => {
                    toast({
                      title: "Coming Soon!",
                      description: "Direct messaging feature is being developed.",
                    });
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                {friend.library_public && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      toast({
                        title: "Coming Soon!",
                        description: "Friend library viewing is being developed.",
                      });
                    }}
                  >
                    View Library
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};