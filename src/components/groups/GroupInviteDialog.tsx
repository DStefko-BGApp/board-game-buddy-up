import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus, Search, Check } from 'lucide-react';
import { Group } from '@/hooks/useGroups';
import { useGroups } from '@/hooks/useGroups';
import { useFriends } from '@/hooks/useFriends';
import { UserAvatar } from '@/components/common/UserAvatar';

interface GroupInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}

const GroupInviteDialog = ({ open, onOpenChange, group }: GroupInviteDialogProps) => {
  const { sendInvitation } = useGroups();
  const { friends } = useFriends();
  const [searchTerm, setSearchTerm] = useState('');
  const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set());
  
  // Filter friends who aren't already in the group
  const availableFriends = friends.filter(friend => 
    !group.members?.some(member => member.user_id === friend.id) &&
    (friend.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );

  const handleInvite = async (userId: string) => {
    try {
      // Add more specific error handling
      console.log('Attempting to send invitation:', { groupId: group.id, userId });
      await sendInvitation(group.id, userId);
      setInvitedUsers(prev => new Set([...prev, userId]));
    } catch (error) {
      console.error('Error sending invitation:', error);
      // The error toast is already handled in the sendInvitation function
    }
  };

  // Reset invited users when dialog opens
  useEffect(() => {
    if (open) {
      setInvitedUsers(new Set());
      setSearchTerm('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-gaming-blue" />
            Invite Friends to {group.name}
          </DialogTitle>
          <DialogDescription>
            Send invitations to your friends to join this group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-64">
            {availableFriends.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {friends.length === 0 
                    ? 'No friends to invite yet'
                    : searchTerm 
                      ? 'No friends found'
                      : 'All your friends are already in this group'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableFriends.map((friend) => {
                  const isInvited = invitedUsers.has(friend.id);
                  return (
                    <div key={friend.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          displayName={friend.display_name || 'Unknown User'}
                          avatarUrl={friend.avatar_url}
                          size="sm"
                        />
                        <div>
                          <span className="font-medium">
                            {friend.display_name || 'Unknown User'}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={isInvited ? "secondary" : "outline"}
                        onClick={() => handleInvite(friend.id)}
                        disabled={isInvited}
                        className={isInvited ? "bg-gaming-green/20 text-gaming-green border-gaming-green/30" : ""}
                      >
                        {isInvited ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Invited
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3 w-3 mr-1" />
                            Invite
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupInviteDialog;