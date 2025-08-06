import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Check, X, Users } from 'lucide-react';
import { GroupInvitation } from '@/hooks/useGroups';
import { useGroups } from '@/hooks/useGroups';

interface InvitationsCardProps {
  invitations: GroupInvitation[];
}

const InvitationsCard = ({ invitations }: InvitationsCardProps) => {
  const { respondToInvitation } = useGroups();

  return (
    <Card className="section-background border-gaming-yellow/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gaming-yellow">
          <Mail className="h-5 w-5" />
          Group Invitations
          <Badge variant="secondary" className="bg-gaming-yellow/20 text-gaming-yellow">
            {invitations.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          You have pending invitations to join groups
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card/50">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-gaming-blue" />
                <h4 className="font-medium text-foreground truncate">
                  {invitation.group?.name}
                </h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Invited by {invitation.invited_by?.display_name}
              </p>
              {invitation.group?.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {invitation.group.description}
                </p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => respondToInvitation(invitation.id, 'rejected')}
                className="text-gaming-red border-gaming-red/30 hover:bg-gaming-red/10"
              >
                <X className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                onClick={() => respondToInvitation(invitation.id, 'accepted')}
                className="bg-gaming-green hover:bg-gaming-green/90 text-white"
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InvitationsCard;