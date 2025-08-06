import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { UserPlus, Search, Users, Trophy, Calendar, MessageCircle, Loader2, User, Wifi, Clock, MapPin, Settings, CalendarPlus, Info, Bell, Award, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFriends } from "@/hooks/useFriends";
import { useProfile } from "@/hooks/useProfile";
import { useUserGames } from "@/hooks/useUserGames";
import { useUserPresence } from "@/hooks/useUserPresence";
import { CreateProfileDialog } from "@/components/CreateProfileDialog";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { AddFriendDialog } from "@/components/AddFriendDialog";
import { AvatarImage } from "@/components/ui/avatar";
import { FriendProfileDialog } from "@/components/FriendProfileDialog";
import { useNavigate } from "react-router-dom";
import { UserAvatar } from "@/components/common/UserAvatar";
import friendsMeeples from "@/assets/friends-meeples.png";

const Friends = () => {
  const { friends, friendRequests, loading, acceptFriendRequest, rejectFriendRequest, refetch } = useFriends();
  const { profile } = useProfile();
  const { userGames } = useUserGames();
  const { getUserStatus, isUserOnline } = useUserPresence();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [showFriendProfile, setShowFriendProfile] = useState(false);

  const filteredFriends = friends.filter(friend =>
    friend.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
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

  const getSkillTooltip = (experience: string) => {
    switch (experience) {
      case "beginner":
        return "New to board gaming, enjoys learning simple games";
      case "intermediate":
        return "Regular gamer who enjoys medium complexity games";
      case "expert":
        return "Experienced gamer who loves complex strategy games";
      default:
        return "Gaming experience not specified";
    }
  };

  const getSharedGamesCount = (friend: any) => {
    if (!userGames || !friend.favorite_games) return 0;
    return friend.favorite_games.filter((game: string) => 
      userGames.some(userGame => userGame.name?.toLowerCase() === game.toLowerCase())
    ).length;
  };

  const handleGameTagClick = (gameName: string) => {
    navigate(`/library?search=${encodeURIComponent(gameName)}`);
  };

  const handleFriendClick = (friend: any) => {
    setSelectedFriend(friend);
    setShowFriendProfile(true);
  };

  const friendMilestones = [
    { count: 1, title: "First Friend", description: "Welcome to the community!", icon: "🎯" },
    { count: 5, title: "Small Circle", description: "Building connections", icon: "👥" },
    { count: 10, title: "Gaming Group", description: "Ready for game nights", icon: "🎲" },
    { count: 25, title: "Popular Gamer", description: "Well-connected player", icon: "⭐" },
    { count: 50, title: "Community Leader", description: "Influential member", icon: "🏆" },
    { count: 100, title: "Board Game Ambassador", description: "Community champion", icon: "👑" }
  ];

  const getCurrentMilestone = () => {
    const currentCount = friends.length;
    let current = null;
    let next = friendMilestones[0];
    
    for (const milestone of friendMilestones) {
      if (currentCount >= milestone.count) {
        current = milestone;
      } else {
        next = milestone;
        break;
      }
    }
    
    if (currentCount >= friendMilestones[friendMilestones.length - 1].count) {
      next = null; // Max milestone reached
    }
    
    return { current, next };
  };

  const { current: currentMilestone, next: nextMilestone } = getCurrentMilestone();

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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header with Library page template */}
      <div className="mb-8">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-gaming opacity-10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-card/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
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
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="px-6 py-3 bg-white/20 text-foreground border-2 border-white/40 rounded-lg hover:bg-white/30 backdrop-blur-sm font-semibold shadow-lg hover-scale transition-all duration-300"
                >
                  <Settings className="h-4 w-4 mr-2 inline" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowAddFriend(true)}
                  className="px-6 py-3 bg-gradient-gaming text-white border-0 rounded-lg hover:shadow-glow transition-all duration-300 font-semibold hover-scale shadow-lg"
                >
                  <UserPlus className="h-4 w-4 mr-2 inline" />
                  Add Friend
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Your Profile Card - Enhanced Typography */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <UserAvatar 
              displayName={profile.display_name}
              avatarUrl={profile.avatar_url}
              size="lg"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold text-foreground">{profile.display_name}</h3>
                <Badge variant={profile.status === "online" ? "default" : "outline"} className="text-xs">
                  {getStatusText(profile.status)}
                </Badge>
              </div>
              {profile.bio && (
                <p className="text-muted-foreground text-sm font-medium italic">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground/80">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.gaming_experience && (
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span className="capitalize">{profile.gaming_experience}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {(profile.favorite_games?.length || profile.favorite_mechanics?.length) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.favorite_games && profile.favorite_games.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 text-foreground">Favorite Games</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.favorite_games.slice(0, 3).map((game) => (
                      <Badge key={game} variant="outline" className="text-xs font-medium">
                        {game}
                      </Badge>
                    ))}
                    {profile.favorite_games.length > 3 && (
                      <Badge variant="outline" className="text-xs font-medium">
                        +{profile.favorite_games.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {profile.favorite_mechanics && profile.favorite_mechanics.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 text-foreground">Favorite Mechanics</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.favorite_mechanics.slice(0, 3).map((mechanic) => (
                      <Badge key={mechanic} variant="outline" className="text-xs font-medium">
                        {mechanic}
                      </Badge>
                    ))}
                    {profile.favorite_mechanics.length > 3 && (
                      <Badge variant="outline" className="text-xs font-medium">
                        +{profile.favorite_mechanics.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Stats with Icons and Progress */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="grid grid-cols-3 gap-4 flex-1">
          {/* Friends Count */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-primary mr-2" />
                <div className="text-3xl font-bold text-foreground">{friends.length}</div>
              </div>
              <div className="text-xs text-muted-foreground/70 font-medium mb-2">Friends</div>
              
              {/* Friend Milestone Progress */}
              <div className="space-y-1">
                {nextMilestone ? (
                  <>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Next: {nextMilestone.title}</span>
                      <span>{friends.length}/{nextMilestone.count}</span>
                    </div>
                    <Progress value={(friends.length / nextMilestone.count) * 100} className="h-1" />
                    <div className="text-xs text-muted-foreground/70">
                      {nextMilestone.description}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center text-xs text-primary font-medium">
                    <Award className="h-3 w-3 mr-1" />
                    Max milestone achieved! 👑
                  </div>
                )}
                
                {currentMilestone && (
                  <div className="flex items-center justify-center text-xs text-primary font-medium pt-1">
                    <Trophy className="h-3 w-3 mr-1" />
                    {currentMilestone.icon} {currentMilestone.title}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Online Friends */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="relative">
                  <Wifi className="h-5 w-5 text-green-600 mr-2" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {friends.filter(f => isUserOnline(f.user_id)).length}
                </div>
              </div>
              <div className="text-xs text-muted-foreground/70 font-medium mb-2">Online Now</div>
              
              {/* Activity Indicator */}
              <div className="flex items-center justify-center text-xs text-green-600 font-medium">
                <TrendingUp className="h-3 w-3 mr-1" />
                Active community
              </div>
            </CardContent>
          </Card>

          {/* Friend Requests */}
          <Card className={`hover:shadow-lg transition-all duration-300 ${
            friendRequests.length === 0 ? 'opacity-50 border-dashed' : ''
          }`}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Bell className={`h-5 w-5 mr-2 ${
                  friendRequests.length > 0 ? 'text-orange-600' : 'text-muted-foreground'
                }`} />
                <div className={`text-3xl font-bold ${
                  friendRequests.length > 0 ? 'text-orange-600' : 'text-muted-foreground'
                }`}>
                  {friendRequests.length}
                </div>
              </div>
              <div className="text-xs text-muted-foreground/70 font-medium mb-2">
                {friendRequests.length === 1 ? 'Request' : 'Requests'}
              </div>
              
              {/* Zero State Message */}
              {friendRequests.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  <Target className="h-3 w-3 mx-auto mb-1" />
                  <div>Invite friends to connect!</div>
                </div>
              ) : (
                <div className="flex items-center justify-center text-xs text-orange-600 font-medium">
                  <Bell className="h-3 w-3 mr-1 animate-bounce" />
                  Needs attention
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Prominent Add Friend Button */}
        <div className="flex items-center">
          <Button 
            onClick={() => setShowAddFriend(true)}
            className="bg-gradient-gaming text-white border-0 hover:shadow-glow transition-all duration-300 font-semibold hover-scale shadow-lg px-4 py-2"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        </div>
      </div>

      {/* Friend Requests - Enhanced Typography */}
      {friendRequests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Friend Requests</h2>
          <div className="space-y-3">
            {friendRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar 
                        displayName={request.requester_profile?.display_name || 'User'}
                        avatarUrl={request.requester_profile?.avatar_url}
                        size="sm"
                      />
                      <div>
                        <h4 className="text-lg font-bold text-foreground">{request.requester_profile?.display_name}</h4>
                        <p className="text-xs text-muted-foreground/70">
                          {request.requester_profile?.bio || 'No bio available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => acceptFriendRequest(request.id)}
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => rejectFriendRequest(request.id)}
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

      {/* Friends List with Integrated Search */}
      <TooltipProvider>
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-foreground">
              Your Friends ({filteredFriends.length})
            </h2>
            
            {/* Integrated Search Bar */}
            <div className="relative sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 text-base border-2 border-muted focus:border-primary transition-colors"
              />
              {searchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                  {filteredFriends.length} result{filteredFriends.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          
          {filteredFriends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-foreground">No friends yet</h3>
              <p className="text-sm text-muted-foreground/70 mb-4">
                {searchTerm ? "No friends match your search." : "Start by adding some friends to connect with other gamers."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowAddFriend(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friend
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFriends.map((friend) => {
                const sharedGamesCount = getSharedGamesCount(friend);
                // Use real-time presence status instead of static profile status
                const realTimeStatus = getUserStatus(friend.user_id);
                const isOnline = isUserOnline(friend.user_id);
                return (
                  <Card key={friend.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-5">
                      {/* Header Section - Avatar, Name, Status */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="relative">
                          <UserAvatar 
                            displayName={friend.display_name}
                            avatarUrl={friend.avatar_url}
                            size="lg"
                          />
                          {/* Online Status Indicator - Using real-time status */}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(realTimeStatus)} border-2 border-white rounded-full`} />
                          {/* Notification Dot - Only show for online users */}
                          {isOnline && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full animate-pulse" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-xl font-bold text-foreground truncate">{friend.display_name}</h4>
                            <Badge 
                              variant={realTimeStatus === "online" ? "default" : "outline"}
                              className={`text-xs font-medium px-2 py-1 ${
                                realTimeStatus === "online" 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : realTimeStatus === "away"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            >
                              {getStatusText(realTimeStatus)}
                            </Badge>
                          </div>
                          
                          {/* Skill Level with Tooltip */}
                          {friend.gaming_experience && (
                            <div className="flex items-center gap-1 mb-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-help">
                                    <Trophy className="h-3 w-3 text-primary" />
                                    <span className="text-sm font-medium text-primary capitalize">
                                      {friend.gaming_experience}
                                    </span>
                                    <Info className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{getSkillTooltip(friend.gaming_experience)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                          
                          {/* Bio */}
                          {friend.bio && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {friend.bio}
                            </p>
                          )}
                          
                          {/* Location */}
                          {friend.location && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground/80">
                              <MapPin className="h-3 w-3" />
                              <span>{friend.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Favorite Games & Mechanics as Clickable Tags */}
                      <div className="space-y-3 mb-4">
                        {friend.favorite_games && friend.favorite_games.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-2 text-gaming-green">🎲 Favorite Games</p>
                            <div className="flex flex-wrap gap-1">
                              {friend.favorite_games.slice(0, 3).map((game) => (
                                <Badge 
                                  key={game} 
                                  variant="outline" 
                                  className="text-xs font-medium cursor-pointer hover:bg-gaming-green/10 hover:border-gaming-green/30 transition-colors"
                                  onClick={() => handleGameTagClick(game)}
                                >
                                  {game}
                                </Badge>
                              ))}
                              {friend.favorite_games.length > 3 && (
                                <Badge variant="outline" className="text-xs font-medium">
                                  +{friend.favorite_games.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {friend.favorite_mechanics && friend.favorite_mechanics.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-2 text-gaming-purple">⚙️ Favorite Mechanics</p>
                            <div className="flex flex-wrap gap-1">
                              {friend.favorite_mechanics.slice(0, 2).map((mechanic) => (
                                <Badge 
                                  key={mechanic} 
                                  variant="outline" 
                                  className="text-xs font-medium cursor-pointer hover:bg-gaming-purple/10 hover:border-gaming-purple/30 transition-colors"
                                >
                                  {mechanic}
                                </Badge>
                              ))}
                              {friend.favorite_mechanics.length > 2 && (
                                <Badge variant="outline" className="text-xs font-medium">
                                  +{friend.favorite_mechanics.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Shared Games or Last Played Info */}
                      {sharedGamesCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gaming-blue bg-gaming-blue/10 px-2 py-1 rounded-md mb-4">
                          <Users className="h-3 w-3" />
                          <span className="font-medium">{sharedGamesCount} shared game{sharedGamesCount !== 1 ? 's' : ''}</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 relative"
                            onClick={() => {
                              toast({
                                title: "Coming Soon!",
                                description: "Direct messaging feature is being developed.",
                              });
                            }}
                          >
                            <MessageCircle className="h-3 w-3 mr-2" />
                            Message
                            {/* Notification dot only for online users */}
                            {isOnline && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleFriendClick(friend)}
                          >
                            <User className="h-3 w-3 mr-2" />
                            Profile
                          </Button>
                        </div>
                        
                        {/* Invite to Game Night Button */}
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full bg-gradient-gaming hover:shadow-glow"
                          onClick={() => {
                            toast({
                              title: "Coming Soon!",
                              description: "Game night invitations will be available soon.",
                            });
                          }}
                        >
                          <CalendarPlus className="h-3 w-3 mr-2" />
                          Invite to Game Night
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </TooltipProvider>
      <CreateProfileDialog 
        open={showCreateProfile} 
        onOpenChange={setShowCreateProfile} 
      />
      {profile && (
        <>
          <EditProfileDialog 
            open={showEditProfile} 
            onOpenChange={setShowEditProfile}
            profile={profile}
          />
          <AddFriendDialog 
            open={showAddFriend} 
            onOpenChange={setShowAddFriend}
            onFriendAdded={refetch}
          />
          <FriendProfileDialog 
            friend={selectedFriend}
            open={showFriendProfile}
            onOpenChange={setShowFriendProfile}
          />
        </>
      )}
    </div>
  );
};

export default Friends;