import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/hooks/useProfile";

interface AddFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFriendAdded?: () => void;
}

export const AddFriendDialog = ({ open, onOpenChange, onFriendAdded }: AddFriendDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const { toast } = useToast();

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Search for users by display name
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('display_name', `%${query}%`)
        .neq('user_id', user.id) // Exclude current user
        .limit(10);

      if (error) throw error;

      // Filter out users who are already friends or have pending requests
      const { data: existingFriendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id, status')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      const friendUserIds = new Set();
      existingFriendships?.forEach(friendship => {
        if (friendship.requester_id === user.id) {
          friendUserIds.add(friendship.addressee_id);
        } else {
          friendUserIds.add(friendship.requester_id);
        }
      });

      const filteredProfiles = profiles?.filter(profile => 
        !friendUserIds.has(profile.user_id)
      ).map(profile => ({
        ...profile,
        status: (profile.status as "online" | "offline" | "away" | "busy") || "offline",
        gaming_experience: profile.gaming_experience as "beginner" | "intermediate" | "expert" | null,
        gaming_style: profile.gaming_style as "casual" | "competitive" | "teaching-friendly" | "mixed" | null,
      })) || [];

      setSearchResults(filteredProfiles);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchUsers(value);
  };

  const sendFriendRequest = async (targetUserId: string) => {
    setSending(targetUserId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Friend request sent!",
      });

      // Remove the user from search results
      setSearchResults(prev => prev.filter(profile => profile.user_id !== targetUserId));
      onFriendAdded?.();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    } finally {
      setSending(null);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setSearchResults([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Friend
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by display name..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {profile.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-gaming text-white">
                          {profile.display_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-semibold">{profile.display_name}</p>
                      {profile.bio && (
                        <p className="text-sm text-muted-foreground truncate max-w-32">
                          {profile.bio}
                        </p>
                      )}
                      {profile.location && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {profile.location}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="gaming"
                    onClick={() => sendFriendRequest(profile.user_id)}
                    disabled={sending === profile.user_id}
                  >
                    {sending === profile.user_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchTerm.length >= 2 && !loading && searchResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No users found matching "{searchTerm}"</p>
            </div>
          )}

          {searchTerm.length < 2 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Type at least 2 characters to search for users</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};