import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Crown, 
  Settings, 
  UserPlus, 
  Calendar, 
  Send, 
  MessageCircle,
  Lock,
  Globe,
  MoreHorizontal,
  Shield,
  UserMinus
} from 'lucide-react';
import { Group } from '@/hooks/useGroups';
import { useGroupDetails } from '@/hooks/useGroupDetails';
import { UserAvatar } from '@/components/common/UserAvatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CreateGameNightFromGroupDialog from '@/components/groups/CreateGameNightFromGroupDialog';
import GroupInviteDialog from '@/components/groups/GroupInviteDialog';
import EditGroupDialog from '@/components/groups/EditGroupDialog';

interface GroupDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}

const GroupDetailsDialog = ({ open, onOpenChange, group }: GroupDetailsDialogProps) => {
  const { 
    group: detailedGroup, 
    members, 
    messages, 
    userRole, 
    loading, 
    sendMessage, 
    removeMember,
    promoteToAdmin 
  } = useGroupDetails(group.id);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'members'>('overview');
  const [newMessage, setNewMessage] = useState('');
  const [showCreateGameNight, setShowCreateGameNight] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const canCreateGameNight = userRole === 'admin' || userRole === 'member';
  const canInvite = userRole === 'admin' || userRole === 'member';
  const canManageGroup = userRole === 'admin';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {detailedGroup?.is_private ? (
                    <Lock className="h-5 w-5 text-gaming-red" />
                  ) : (
                    <Globe className="h-5 w-5 text-gaming-green" />
                  )}
                  {group.name}
                  {userRole === 'admin' && (
                    <Badge variant="secondary" className="bg-gaming-yellow/20 text-gaming-yellow border-gaming-yellow/30">
                      <Crown className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {detailedGroup?.description || 'A gaming community'}
                </DialogDescription>
              </div>
              {canManageGroup && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="flex border-b border-border">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('overview')}
              className="rounded-none"
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'messages' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('messages')}
              className="rounded-none"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
            </Button>
            <Button
              variant={activeTab === 'members' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('members')}
              className="rounded-none"
            >
              <Users className="h-4 w-4 mr-2" />
              Members ({members.length})
            </Button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'overview' && (
              <div className="space-y-4 p-1">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-gaming-blue">{members.length}</div>
                      <p className="text-sm text-muted-foreground">Total Members</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-gaming-pink">
                        {members.filter(m => m.role === 'admin').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Admins</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  {canCreateGameNight && (
                    <Button 
                      onClick={() => setShowCreateGameNight(true)}
                      className="w-full bg-gradient-gaming hover:opacity-90 text-white"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Create Game Night for Group
                    </Button>
                  )}
                  
                  {canInvite && (
                    <Button 
                      onClick={() => setShowInviteDialog(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Members
                    </Button>
                  )}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Group created on {new Date(group.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="flex flex-col h-96">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className="flex gap-3">
                          <UserAvatar 
                            displayName={message.profile?.display_name || 'Unknown User'}
                            avatarUrl={message.profile?.avatar_url}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {message.profile?.display_name || 'Unknown User'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{message.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'members' && (
              <ScrollArea className="h-96 p-4">
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          displayName={member.profile?.display_name || 'Unknown User'}
                          avatarUrl={member.profile?.avatar_url}
                          size="sm"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {member.profile?.display_name || 'Unknown User'}
                            </span>
                            {member.role === 'admin' && (
                              <Badge variant="secondary" className="bg-gaming-yellow/20 text-gaming-yellow border-gaming-yellow/30">
                                <Crown className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {canManageGroup && member.user_id !== group.created_by && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {member.role === 'member' && (
                              <DropdownMenuItem onClick={() => promoteToAdmin(member.user_id)}>
                                <Shield className="h-4 w-4 mr-2" />
                                Promote to Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => removeMember(member.user_id)}
                              className="text-gaming-red"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <CreateGameNightFromGroupDialog
        open={showCreateGameNight}
        onOpenChange={setShowCreateGameNight}
        group={group}
        members={members}
      />
      
      <GroupInviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        group={group}
      />
      
      {canManageGroup && (
        <EditGroupDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          group={detailedGroup || group}
        />
      )}
    </>
  );
};

export default GroupDetailsDialog;