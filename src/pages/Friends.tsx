import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Users, Trophy, Calendar, MessageCircle, Loader2, User, Wifi, Clock } from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { useProfile } from "@/hooks/useProfile";
import { useUserGames } from "@/hooks/useUserGames";
import { CreateProfileDialog } from "@/components/CreateProfileDialog";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const Friends = () => {
  const { friends, friendRequests, loading, acceptFriendRequest, rejectFriendRequest } = useFriends();
  const { profile } = useProfile();
  const { userGames } = useUserGames();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const filteredFriends = friends.filter(friend =>
    friend.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <User className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Profile Required</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create your gaming profile to connect with friends and join the community.
            </p>
          </div>
          <Button 
            variant="gaming" 
            size="lg"
            onClick={() => setShowCreateProfile(true)}
          >
            <User className="h-4 w-4 mr-2" />
            Create Profile
          </Button>
        </div>
        <CreateProfileDialog 
          open={showCreateProfile} 
          onOpenChange={setShowCreateProfile} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-background min-h-screen">
      {/* Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-gaming opacity-10 rounded-2xl blur-3xl"></div>
        <div className="relative bg-card/90 backdrop-blur-sm border border-white/10 rounded-2xl p-8 cozy-section">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
                Friends
              </h1>
              <p className="text-muted-foreground text-lg">
                Connect with fellow board game enthusiasts
              </p>
            </div>
            <div className="flex gap-3 mt-6 md:mt-0">
              <Button variant="outline" onClick={() => setShowEditProfile(true)} className="hover-scale">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="gaming" className="hover-scale shadow-lg">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Current Profile Card - Compact Layout */}
      <div className="relative mb-6">
        <Card className="bg-card/95 backdrop-blur-sm border-white/20 shadow-lg">
          <CardContent className="p-0">
            {/* Compact Header */}
            <div className="relative bg-gradient-to-r from-gaming-blue/15 via-primary/8 to-gaming-green/15 p-4 rounded-t-2xl border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white/30">
                    {profile.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Profile" />
                    ) : (
                      <AvatarFallback className="bg-gradient-gaming text-primary-foreground font-bold">
                        {profile.display_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(profile.status)}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-foreground truncate">
                      {profile.display_name}
                    </h3>
                    <Badge variant="outline" className="border-foreground/30 text-foreground bg-background/50 text-xs">
                      {getStatusText(profile.status)}
                    </Badge>
                    {profile.library_public && (
                      <Badge variant="secondary" className="bg-gaming-green/30 text-foreground text-xs" title="Public Library">
                        Library
                      </Badge>
                    )}
                  </div>
                  {profile.bio && (
                    <p className="text-muted-foreground text-sm italic truncate">
                      "{profile.bio}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Compact Content Grid */}
            <div className="p-4 space-y-4">
              {/* Single row for all key info */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {profile.gaming_experience && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-2">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="h-3 w-3 text-primary" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Experience</p>
                        <p className="text-xs font-semibold capitalize truncate">{profile.gaming_experience}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {profile.gaming_style && (
                  <div className="bg-gaming-green/10 border border-gaming-green/20 rounded-lg p-2">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-gaming-green" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Gaming Style</p>
                        <p className="text-xs font-semibold capitalize truncate">{profile.gaming_style}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {profile.preferred_player_count && (
                  <div className="bg-gaming-red/10 border border-gaming-red/20 rounded-lg p-2">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-gaming-red" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Preferred Player Count</p>
                        <p className="text-xs font-semibold truncate">{profile.preferred_player_count}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {profile.location && (
                  <div className="bg-gaming-slate/10 border border-gaming-slate/20 rounded-lg p-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-gaming-slate rounded-full flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-xs font-semibold truncate">{profile.location}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {profile.availability && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-primary" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Available</p>
                        <p className="text-xs font-semibold truncate">{profile.availability}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-gaming-green/10 border border-gaming-green/20 rounded-lg p-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-gaming-green" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-xs font-semibold truncate">{new Date(profile.created_at).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact social handles */}
              {(profile.bgg_username || profile.discord_handle) && (
                <div className="flex gap-2 text-xs">
                  {profile.bgg_username && (
                    <Badge variant="outline" className="bg-gaming-red/5 border-gaming-red/20 text-gaming-red">
                      BGG: {profile.bgg_username}
                    </Badge>
                  )}
                  {profile.discord_handle && (
                    <Badge variant="outline" className="bg-gaming-blue/5 border-gaming-blue/20 text-gaming-blue">
                      Discord: {profile.discord_handle}
                    </Badge>
                  )}
                </div>
              )}

              {/* Compact Favorites */}
              {(profile.favorite_games?.length || profile.favorite_mechanics?.length) && (
                <div className="space-y-2">
                  {profile.favorite_games && profile.favorite_games.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1 text-gaming-green">🎲 Favorite Games</p>
                       <div className="flex flex-wrap gap-1">
                         {profile.favorite_games.slice(0, 4).map((game) => {
                           const gameInLibrary = userGames.find(ug => ug.name.toLowerCase() === game.toLowerCase());
                           return (
                             <Badge 
                               key={game} 
                               variant="outline" 
                               className={`bg-gaming-green/5 border-gaming-green/20 text-xs ${gameInLibrary ? 'cursor-pointer hover:bg-gaming-green/10 hover:border-gaming-green/30 transition-colors' : ''}`}
                               onClick={gameInLibrary ? () => navigate('/library') : undefined}
                               title={gameInLibrary ? 'Click to view in library' : undefined}
                             >
                               {game}
                             </Badge>
                           );
                         })}
                        {profile.favorite_games.length > 4 && (
                          <Badge variant="outline" className="bg-gaming-green/5 border-gaming-green/20 text-xs">
                            +{profile.favorite_games.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {profile.favorite_mechanics && profile.favorite_mechanics.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1 text-gaming-red">⚙️ Favorite Mechanics</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.favorite_mechanics.slice(0, 4).map((mechanic) => (
                          <Badge key={mechanic} variant="outline" className="bg-gaming-red/5 border-gaming-red/20 text-xs">
                            {mechanic}
                          </Badge>
                        ))}
                        {profile.favorite_mechanics.length > 4 && (
                          <Badge variant="outline" className="bg-gaming-red/5 border-gaming-red/20 text-xs">
                            +{profile.favorite_mechanics.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="group hover:shadow-gaming transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50 border-white/10">
          <CardContent className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-gaming opacity-10 rounded-full -translate-y-10 translate-x-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {friends.length}
                </p>
                <p className="text-muted-foreground text-sm font-medium">Total Friends</p>
              </div>
              <div className="h-14 w-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-gaming transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50 border-white/10">
          <CardContent className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-score opacity-10 rounded-full -translate-y-10 translate-x-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-gaming-green to-gaming-blue bg-clip-text text-transparent">
                  {friends.filter(f => f.status === "online" || f.status === "away" || f.status === "busy").length}
                </p>
                <p className="text-muted-foreground text-sm font-medium">Online Now</p>
              </div>
              <div className="h-14 w-14 bg-gradient-score rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Wifi className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-gaming transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50 border-white/10">
          <CardContent className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gaming-red/20 rounded-full -translate-y-10 translate-x-10 group-hover:opacity-30 transition-opacity"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-gaming-red to-gaming-slate bg-clip-text text-transparent">
                  {friendRequests.length}
                </p>
                <p className="text-muted-foreground text-sm font-medium">Pending Requests</p>
              </div>
              <div className="h-14 w-14 bg-gaming-blue rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-gaming rounded-full"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gaming-red to-gaming-slate bg-clip-text text-transparent">
              Friend Requests
            </h2>
            <Badge variant="secondary" className="bg-gaming-red/20 text-gaming-red border-gaming-red/30">
              {friendRequests.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {friendRequests.map((request, index) => (
              <Card key={request.id} className="group hover:shadow-gaming transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-card to-card/80 border-white/10 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-white/20 shadow-lg">
                          <AvatarFallback className="bg-gradient-gaming text-primary-foreground font-bold">
                            {request.requester_profile?.display_name.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                         <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-gaming-red to-gaming-red/80 rounded-full animate-pulse border-2 border-white shadow-lg">
                           <div className="w-full h-full bg-gaming-red rounded-full animate-ping opacity-75"></div>
                         </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{request.requester_profile?.display_name}</h3>
                        <p className="text-muted-foreground">
                          {request.requester_profile?.bio || 'No bio available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="gaming" 
                        size="sm"
                        onClick={() => acceptFriendRequest(request.id)}
                        className="hover-scale shadow-lg"
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => rejectFriendRequest(request.id)}
                        className="hover-scale"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-gaming/5 rounded-2xl blur-xl"></div>
        <div className="relative bg-card/80 backdrop-blur-sm border border-white/20 rounded-2xl p-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-transparent border-0 text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Friends List */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-gradient-gaming rounded-full"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your Friends
          </h2>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {filteredFriends.length}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFriends.map((friend, index) => (
            <Card key={friend.id} className="group hover:shadow-gaming transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80 border-white/10 animate-fade-in" style={{animationDelay: `${index * 50}ms`}}>
              <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-gaming/5 rounded-full -translate-y-16 translate-x-16 group-hover:bg-gradient-gaming/10 transition-colors"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative group/avatar">
                        <Avatar className="h-14 w-14 border-2 border-white/20 shadow-lg group-hover/avatar:scale-110 transition-transform">
                          {friend.avatar_url ? (
                            <AvatarImage src={friend.avatar_url} alt="Profile" />
                          ) : (
                            <AvatarFallback className="bg-gradient-gaming text-primary-foreground font-bold">
                              {friend.display_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card ${getStatusColor(friend.status)} shadow-lg`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{friend.display_name}</h3>
                        <p className="text-muted-foreground">
                          {friend.bio || 'No bio available'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={friend.status === "online" || friend.status === "away" || friend.status === "busy" ? "default" : "secondary"} className="shadow-sm">
                      {getStatusText(friend.status)}
                    </Badge>
                  </div>

                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gaming-green rounded-full"></div>
                      <span className="text-muted-foreground">Joined:</span>
                      <span className="font-medium">{new Date(friend.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gaming-blue rounded-full"></div>
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="font-medium">{new Date(friend.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1 hover-scale group/btn">
                    <MessageCircle className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                    Message
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1 hover-scale group/btn">
                    <User className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                    Profile
                  </Button>
                </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <CreateProfileDialog 
        open={showCreateProfile} 
        onOpenChange={setShowCreateProfile} 
      />
      {profile && (
        <EditProfileDialog 
          open={showEditProfile} 
          onOpenChange={setShowEditProfile}
          profile={profile}
        />
      )}
    </div>
  );
};

export default Friends;