import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Lock, Globe, Crown, Calendar } from 'lucide-react';
import { Group } from '@/hooks/useGroups';

interface GroupCardProps {
  group: Group;
  onClick: () => void;
}

const GroupCard = ({ group, onClick }: GroupCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-gaming transition-all duration-200 hover:scale-[1.02] section-background"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-foreground truncate">
              {group.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {group.is_private ? (
                <Lock className="h-4 w-4 text-gaming-red" />
              ) : (
                <Globe className="h-4 w-4 text-gaming-green" />
              )}
              <span className="text-sm text-muted-foreground">
                {group.is_private ? 'Private' : 'Public'}
              </span>
            </div>
          </div>
          {group.user_role === 'admin' && (
            <Badge variant="secondary" className="bg-gaming-yellow/20 text-gaming-yellow border-gaming-yellow/30">
              <Crown className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {group.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {group.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gaming-blue" />
            <span className="text-sm font-medium text-gaming-blue">
              {group.member_count || 0} member{(group.member_count || 0) !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {new Date(group.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;