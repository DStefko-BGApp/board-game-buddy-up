import { useState } from 'react';
import { useGroups } from '@/hooks/useGroups';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  Lock, 
  Globe, 
  Calendar, 
  Settings,
  Crown,
  UserPlus,
  Mail
} from 'lucide-react';
import CreateGroupDialog from '@/components/groups/CreateGroupDialog';
import GroupCard from '@/components/groups/GroupCard';
import GroupDetailsDialog from '@/components/groups/GroupDetailsDialog';
import InvitationsCard from '@/components/groups/InvitationsCard';
import { Group } from '@/hooks/useGroups';

const Groups = () => {
  const { groups, invitations, loading } = useGroups();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGroupClick = (group: Group) => {
    setSelectedGroup(group);
    setShowGroupDetails(true);
  };

  return (
    <div className="min-h-screen page-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Users className="h-12 w-12 text-gaming-pink" />
            <h1 className="text-4xl font-bold animate-gradient-fade">
              Gaming Groups
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create and join gaming communities. Organize game nights, share strategies, 
            and connect with fellow board game enthusiasts.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-gaming hover:opacity-90 text-white shadow-gaming"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Invitations */}
        {invitations.length > 0 && (
          <InvitationsCard invitations={invitations} />
        )}

        {/* Groups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No groups found' : 'No groups yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create your first group to start building your gaming community'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-gaming hover:opacity-90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Group
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={() => handleGroupClick(group)}
              />
            ))}
          </div>
        )}

        {/* Stats Section */}
        {groups.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gaming-pink">{groups.length}</div>
                <p className="text-sm text-muted-foreground">Groups Joined</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gaming-yellow">
                  {groups.filter(g => g.user_role === 'admin').length}
                </div>
                <p className="text-sm text-muted-foreground">Groups Managed</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gaming-blue">
                  {groups.reduce((sum, g) => sum + (g.member_count || 0), 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateGroupDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
      
      {selectedGroup && (
        <GroupDetailsDialog
          open={showGroupDetails}
          onOpenChange={setShowGroupDetails}
          group={selectedGroup}
        />
      )}
    </div>
  );
};

export default Groups;