import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Users, Trophy, Calendar, MessageCircle, Loader2 } from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { useProfile } from "@/hooks/useProfile";

const Friends = () => {
  const { friends, friendRequests, loading, acceptFriendRequest, rejectFriendRequest } = useFriends();
  const { profile } = useProfile();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFriends = friends.filter(friend =>
    friend.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-gaming-green";
      case "away":
        return "bg-gaming-orange";
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
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Required</h2>
          <p className="text-muted-foreground">
            Please create a profile to use the friends feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Friends</h1>
          <p className="text-muted-foreground">
            Connect with fellow board game enthusiasts
          </p>
        </div>
        <Button variant="gaming" className="mt-4 md:mt-0">
          <UserPlus className="h-4 w-4" />
          Add Friend
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{friends.length}</p>
                <p className="text-muted-foreground text-sm">Total Friends</p>
              </div>
              <div className="h-12 w-12 bg-gradient-gaming rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {friends.filter(f => f.status === "online" || f.status === "away" || f.status === "busy").length}
                </p>
                <p className="text-muted-foreground text-sm">Online Now</p>
              </div>
              <div className="h-12 w-12 bg-gradient-score rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{friendRequests.length}</p>
                <p className="text-muted-foreground text-sm">Pending Requests</p>
              </div>
              <div className="h-12 w-12 bg-gaming-orange rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Friend Requests</h2>
          <div className="space-y-4">
            {friendRequests.map((request) => (
              <Card key={request.id} className="shadow-card-gaming">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-gaming text-white">
                          {request.requester_profile?.display_name.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{request.requester_profile?.display_name}</h3>
                        <p className="text-muted-foreground text-sm">
                          {request.requester_profile?.bio || 'No bio available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="gaming" 
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

      {/* Friends List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Friends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFriends.map((friend) => (
            <Card key={friend.id} className="hover:shadow-gaming transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-gaming text-white">
                          {friend.display_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(friend.status)}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{friend.display_name}</h3>
                      <p className="text-muted-foreground text-sm">
                        {friend.bio || 'No bio available'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={friend.status === "online" || friend.status === "away" || friend.status === "busy" ? "default" : "secondary"}>
                    {getStatusText(friend.status)}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">
                      {new Date(friend.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">
                      {new Date(friend.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Friends;