import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Users, 
  Clock, 
  Calendar, 
  MessageCircle, 
  MapPin,
  GamepadIcon,
  Target,
  Globe,
  X,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/hooks/useProfile";
import { useUserGames } from "@/hooks/useUserGames";
import { useNavigate } from "react-router-dom";
import { FriendLibraryDialog } from "./FriendLibraryDialog";

interface FriendProfileDialogProps {
  friend: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FriendProfileDialog = ({ friend, open, onOpenChange }: FriendProfileDialogProps) => {
  const { userGames } = useUserGames();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);

  if (!friend) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-gaming-green bg-gaming-green/10 border-gaming-green/30";
      case "away":
        return "text-gaming-yellow bg-gaming-yellow/10 border-gaming-yellow/30";
      case "busy":
        return "text-gaming-red bg-gaming-red/10 border-gaming-red/30";
      case "offline":
        return "text-muted-foreground bg-muted border-border";
      default:
        return "text-muted-foreground bg-muted border-border";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return "🟢";
      case "away":
        return "🟡";
      case "busy":
        return "🔴";
      case "offline":
        return "⚫";
      default:
        return "⚫";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-card/95 backdrop-blur-sm border border-white/20">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-white/20 hover:bg-card transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Hero Header Section */}
        <div className="relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-gaming opacity-15 blur-3xl"></div>
          <div className="relative bg-gradient-to-br from-card/90 via-card/95 to-primary/5 backdrop-blur-sm border-b border-white/10 p-8">
            <div className="flex items-start gap-6">
              {/* Large Avatar with Status Ring */}
              <div className="relative">
                <div className={`absolute -inset-1 rounded-full ${
                  friend.status === "online" ? "bg-gaming-green/30 animate-pulse" : 
                  friend.status === "away" ? "bg-gaming-yellow/30" : 
                  friend.status === "busy" ? "bg-gaming-red/30" : "bg-muted/30"
                }`}></div>
                <Avatar className="h-24 w-24 border-4 border-white/40 relative">
                  {friend.avatar_url ? (
                    <AvatarImage src={friend.avatar_url} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-gradient-gaming text-white font-bold text-3xl">
                      {friend.display_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
                {/* Status Indicator */}
                <div className="absolute -bottom-1 -right-1 text-2xl">
                  {getStatusIcon(friend.status)}
                </div>
              </div>
              
              {/* Name and Status Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-4xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
                    {friend.display_name}
                  </h1>
                  <Badge className={`text-base font-semibold px-4 py-2 ${getStatusColor(friend.status)}`}>
                    {getStatusText(friend.status)}
                  </Badge>
                  {friend.library_public && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30 font-medium">
                      <Globe className="h-3 w-3 mr-1" />
                      Public Library
                    </Badge>
                  )}
                </div>
                
                {friend.bio && (
                  <blockquote className="text-lg text-muted-foreground italic border-l-4 border-primary/30 pl-4 mb-4">
                    "{friend.bio}"
                  </blockquote>
                )}
                
                {/* Quick Info Pills */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {friend.location && (
                    <div className="flex items-center gap-1.5 bg-card/50 px-3 py-1.5 rounded-full border border-white/10">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="font-medium">{friend.location}</span>
                    </div>
                  )}
                  {friend.gaming_experience && (
                    <div className="flex items-center gap-1.5 bg-card/50 px-3 py-1.5 rounded-full border border-white/10">
                      <Trophy className="h-3.5 w-3.5" />
                      <span className="font-medium capitalize">{friend.gaming_experience}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 bg-card/50 px-3 py-1.5 rounded-full border border-white/10">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      Joined {new Date(friend.created_at).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-8">
          {/* Gaming Preferences Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {friend.gaming_style && (
              <Card className="border-2 border-gaming-green/20 bg-gaming-green/5 hover:bg-gaming-green/10 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-gaming-green/20">
                      <GamepadIcon className="h-5 w-5 text-gaming-green" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Gaming Style</p>
                      <p className="text-lg font-bold text-foreground capitalize">{friend.gaming_style}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {friend.preferred_player_count && (
              <Card className="border-2 border-gaming-blue/20 bg-gaming-blue/5 hover:bg-gaming-blue/10 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-gaming-blue/20">
                      <Users className="h-5 w-5 text-gaming-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Preferred Players</p>
                      <p className="text-lg font-bold text-foreground">{friend.preferred_player_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {friend.availability && (
              <Card className="border-2 border-gaming-purple/20 bg-gaming-purple/5 hover:bg-gaming-purple/10 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-gaming-purple/20">
                      <Clock className="h-5 w-5 text-gaming-purple" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Available</p>
                      <p className="text-lg font-bold text-foreground">{friend.availability}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Social Handles Section */}
          {(friend.bgg_username || friend.discord_handle) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Social Connections</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {friend.bgg_username && (
                  <Badge variant="outline" className="bg-gaming-orange/10 border-gaming-orange/30 text-gaming-orange text-base px-4 py-2 font-medium">
                    🎯 BGG: {friend.bgg_username}
                  </Badge>
                )}
                {friend.discord_handle && (
                  <Badge variant="outline" className="bg-gaming-blue/10 border-gaming-blue/30 text-gaming-blue text-base px-4 py-2 font-medium">
                    💬 Discord: {friend.discord_handle}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Favorite Games Section */}
          {friend.favorite_games && friend.favorite_games.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gaming-green/20">
                  <Target className="h-5 w-5 text-gaming-green" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Favorite Games</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {friend.favorite_games.map((game) => {
                  const gameInLibrary = userGames.find(ug => ug.name && ug.name.toLowerCase() === game.toLowerCase());
                  return (
                    <Card 
                      key={game}
                      className={`border-2 border-gaming-green/20 bg-gaming-green/5 hover:bg-gaming-green/10 transition-all duration-200 ${
                        gameInLibrary ? 'cursor-pointer hover:border-gaming-green/40 hover:shadow-lg hover:scale-105' : ''
                      }`}
                      onClick={gameInLibrary ? () => {
                        navigate(`/library?game=${encodeURIComponent(game)}`);
                        onOpenChange(false);
                      } : undefined}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          {gameInLibrary && <Zap className="h-4 w-4 text-gaming-green" />}
                          <p className="font-semibold text-foreground text-sm">{game}</p>
                        </div>
                        {gameInLibrary && (
                          <p className="text-xs text-gaming-green font-medium mt-1">In your library!</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Favorite Mechanics Section */}
          {friend.favorite_mechanics && friend.favorite_mechanics.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gaming-purple/20">
                  <Trophy className="h-5 w-5 text-gaming-purple" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Favorite Mechanics</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {friend.favorite_mechanics.map((mechanic) => (
                  <Badge 
                    key={mechanic} 
                    variant="outline" 
                    className="bg-gaming-purple/10 border-gaming-purple/30 text-gaming-purple text-base px-4 py-2 font-medium hover:bg-gaming-purple/20 transition-colors"
                  >
                    ⚙️ {mechanic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Action Bar */}
        <div className="border-t border-white/10 bg-card/95 backdrop-blur-sm p-6">
          <div className="flex gap-4">
            <Button 
              variant="gaming" 
              size="lg"
              className="flex-1 font-semibold"
              onClick={() => {
                toast({
                  title: "Coming Soon!",
                  description: "Direct messaging feature is being developed.",
                });
              }}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Send Message
            </Button>
            {friend.library_public && (
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 border-primary/30 hover:bg-primary/10"
                onClick={() => setShowLibraryDialog(true)}
              >
                <Globe className="h-5 w-5 mr-2" />
                View Library
              </Button>
            )}
          </div>
        </div>

        {/* Friend Library Dialog */}
        <FriendLibraryDialog 
          friend={friend}
          open={showLibraryDialog}
          onOpenChange={setShowLibraryDialog}
        />
      </DialogContent>
    </Dialog>
  );
};