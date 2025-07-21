import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Users, Trophy, Calendar, MessageCircle } from "lucide-react";

// Mock data for friends
const mockFriends = [
  {
    id: 1,
    name: "Sarah Johnson",
    username: "sarahgames",
    status: "online",
    gamesOwned: 45,
    favoriteGame: "Wingspan",
    lastPlayed: "2 hours ago",
    mutualGames: 12,
  },
  {
    id: 2,
    name: "Mike Chen",
    username: "mikec",
    status: "offline",
    gamesOwned: 32,
    favoriteGame: "Gloomhaven",
    lastPlayed: "1 day ago",
    mutualGames: 8,
  },
  {
    id: 3,
    name: "Emma Wilson",
    username: "emmaw",
    status: "online",
    gamesOwned: 28,
    favoriteGame: "Azul",
    lastPlayed: "30 minutes ago",
    mutualGames: 15,
  },
  {
    id: 4,
    name: "Tom Davis",
    username: "tomdavis",
    status: "playing",
    gamesOwned: 67,
    favoriteGame: "Ticket to Ride",
    lastPlayed: "Now playing",
    mutualGames: 22,
  },
];

// Mock friend requests
const mockFriendRequests = [
  {
    id: 1,
    name: "Alex Rodriguez",
    username: "alexr",
    mutualFriends: 3,
    gamesOwned: 23,
  },
  {
    id: 2,
    name: "Lisa Park",
    username: "lisap",
    mutualFriends: 1,
    gamesOwned: 18,
  },
];

const Friends = () => {
  const [friends] = useState(mockFriends);
  const [friendRequests] = useState(mockFriendRequests);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-gaming-green";
      case "playing":
        return "bg-gaming-orange";
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
      case "playing":
        return "Playing";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

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
                  {friends.filter(f => f.status === "online" || f.status === "playing").length}
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
                          {request.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{request.name}</h3>
                        <p className="text-muted-foreground text-sm">@{request.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.mutualFriends} mutual friends • {request.gamesOwned} games
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="gaming" size="sm">
                        Accept
                      </Button>
                      <Button variant="outline" size="sm">
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
                          {friend.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(friend.status)}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{friend.name}</h3>
                      <p className="text-muted-foreground text-sm">@{friend.username}</p>
                    </div>
                  </div>
                  <Badge variant={friend.status === "online" || friend.status === "playing" ? "default" : "secondary"}>
                    {getStatusText(friend.status)}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Games Owned</span>
                    <span className="font-medium">{friend.gamesOwned}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mutual Games</span>
                    <span className="font-medium">{friend.mutualGames}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Favorite Game</span>
                    <span className="font-medium">{friend.favoriteGame}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Active</span>
                    <span className="font-medium">{friend.lastPlayed}</span>
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