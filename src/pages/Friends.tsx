import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Users, Trophy, Calendar, MessageCircle, Loader2, User, Wifi, Clock, MapPin, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFriends } from "@/hooks/useFriends";
import { useProfile } from "@/hooks/useProfile";
import { useUserGames } from "@/hooks/useUserGames";
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

  const handleFriendClick = (friend: any) => {
    setSelectedFriend(friend);
    setShowFriendProfile(true);
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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header with Gaming Illustration */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-primary via-gaming-purple to-gaming-blue bg-clip-text text-transparent">
          Friends
        </h1>
        <p className="text-muted-foreground text-base mb-6 max-w-md mx-auto">
          Connect with fellow board game enthusiasts
        </p>
        <div className="flex justify-center mb-6">
          <img 
            src={friendsMeeples} 
            alt="Gaming friends illustration" 
            className="w-32 h-32 object-contain opacity-80"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 mb-8">
        <Button variant="outline" onClick={() => setShowEditProfile(true)}>
          <Settings className="h-4 w-4 mr-2" />
          <span className="text-sm">Edit Profile</span>
        </Button>
        <Button onClick={() => setShowAddFriend(true)} className="font-medium">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
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

      {/* Quick Stats - Simplified Headers */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-foreground">{friends.length}</div>
            <div className="text-xs text-muted-foreground/70 font-medium">Friends</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {friends.filter(f => f.status === "online").length}
            </div>
            <div className="text-xs text-muted-foreground/70 font-medium">Online</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{friendRequests.length}</div>
            <div className="text-xs text-muted-foreground/70 font-medium">Requests</div>
          </CardContent>
        </Card>
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

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Friends List - Enhanced Typography */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">Your Friends ({filteredFriends.length})</h2>
        
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFriends.map((friend) => (
              <Card key={friend.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <UserAvatar 
                      displayName={friend.display_name}
                      avatarUrl={friend.avatar_url}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold text-foreground truncate">{friend.display_name}</h4>
                        <Badge 
                          variant={friend.status === "online" ? "default" : "outline"}
                          className="text-xs"
                        >
                          {getStatusText(friend.status)}
                        </Badge>
                      </div>
                      {friend.bio && (
                        <p className="text-xs text-muted-foreground/70 line-clamp-2 mb-2 font-medium">
                          {friend.bio}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                        {friend.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {friend.location}
                          </div>
                        )}
                        {friend.gaming_experience && (
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {friend.gaming_experience}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Favorite Games - Subtle Typography */}
                  {friend.favorite_games && friend.favorite_games.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold mb-1 text-muted-foreground/80">Favorite Games</p>
                      <div className="flex flex-wrap gap-1">
                        {friend.favorite_games.slice(0, 2).map((game) => (
                          <Badge key={game} variant="outline" className="text-xs font-medium">
                            {game}
                          </Badge>
                        ))}
                        {friend.favorite_games.length > 2 && (
                          <Badge variant="outline" className="text-xs font-medium">
                            +{friend.favorite_games.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        toast({
                          title: "Coming Soon!",
                          description: "Direct messaging feature is being developed.",
                        });
                      }}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleFriendClick(friend)}
                    >
                      <User className="h-3 w-3 mr-1" />
                      Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
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