import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, Trophy, MapPin, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/hooks/useProfile";
import { useFriends } from "@/hooks/useFriends";

interface FindSimilarUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchTerm: string;
  searchType: 'game' | 'mechanic';
}

export const FindSimilarUsersDialog = ({ open, onOpenChange, searchTerm, searchType }: FindSimilarUsersDialogProps) => {
  const [similarUsers, setSimilarUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { sendFriendRequest, friends } = useFriends();

  const searchUsers = async (term: string, type: 'game' | 'mechanic') => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const column = type === 'game' ? 'favorite_games' : 'favorite_mechanics';
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .contains(column, [term])
        .neq('user_id', user.id);

      if (error) throw error;

      // Filter out existing friends and type cast with proper status
      const friendIds = friends.map(f => f.user_id);
      const filteredProfiles = (profiles || [])
        .filter(p => !friendIds.includes(p.user_id))
        .map(p => ({
          ...p,
          status: (p.status as "online" | "offline" | "away" | "busy") || "offline"
        })) as Profile[];
      
      setSimilarUsers(filteredProfiles);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: "Failed to search for similar users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && searchTerm) {
      searchUsers(searchTerm, searchType);
      setSearchQuery(searchTerm);
    }
  }, [open, searchTerm, searchType]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery.trim(), searchType);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
    // Remove user from list after sending request
    setSimilarUsers(prev => prev.filter(u => u.user_id !== userId));
  };

  const getSharedInterests = (user: Profile) => {
    const interests = searchType === 'game' ? user.favorite_games : user.favorite_mechanics;
    return interests?.filter(interest => 
      interest.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Find Users with Similar {searchType === 'game' ? 'Games' : 'Mechanics'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={`Search ${searchType === 'game' ? 'games' : 'mechanics'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : similarUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? `No users found with "${searchQuery}"` : "Try searching for a specific game or mechanic"}
                </p>
              </div>
            ) : (
              similarUsers.map((user) => {
                const sharedInterests = getSharedInterests(user);
                return (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground">{user.display_name}</h4>
                            <Button
                              size="sm"
                              onClick={() => handleSendFriendRequest(user.user_id)}
                              className="shrink-0"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Add Friend
                            </Button>
                          </div>
                          
                          {user.bio && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {user.bio}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            {user.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{user.location}</span>
                              </div>
                            )}
                            {user.gaming_experience && (
                              <div className="flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                <span className="capitalize">{user.gaming_experience}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Shared Interests */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Shared {searchType === 'game' ? 'Games' : 'Mechanics'}:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {sharedInterests.slice(0, 3).map((interest) => (
                                <Badge key={interest} variant="secondary" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                              {sharedInterests.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{sharedInterests.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};