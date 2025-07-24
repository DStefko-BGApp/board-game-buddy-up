import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, HelpCircle, Users } from 'lucide-react';
import { useGameNightRsvps } from '@/hooks/useGameNightRsvps';
import { UserAvatar } from '@/components/common/UserAvatar';

interface RsvpSectionProps {
  gameNightId: string;
  className?: string;
}

const statusConfig = {
  yes: { icon: CheckCircle, color: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Yes' },
  no: { icon: XCircle, color: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'No' },
  maybe: { icon: HelpCircle, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Maybe' },
  pending: { icon: HelpCircle, color: 'bg-muted/10 text-muted-foreground border-muted/20', label: 'Pending' }
};

export const RsvpSection = ({ gameNightId, className = '' }: RsvpSectionProps) => {
  const { rsvps, userRsvp, loading, createOrUpdateRsvp } = useGameNightRsvps(gameNightId);

  const yesRsvps = rsvps.filter(rsvp => rsvp.status === 'yes');
  const noRsvps = rsvps.filter(rsvp => rsvp.status === 'no');
  const maybeRsvps = rsvps.filter(rsvp => rsvp.status === 'maybe');

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <p className="text-sm text-muted-foreground">Loading RSVPs...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* RSVP Actions */}
      <div>
        <p className="text-sm font-medium mb-2">Your RSVP</p>
        <div className="flex gap-2">
          <Button
            variant={userRsvp?.status === 'yes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => createOrUpdateRsvp('yes')}
            className={userRsvp?.status === 'yes' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Yes
          </Button>
          <Button
            variant={userRsvp?.status === 'maybe' ? 'default' : 'outline'}
            size="sm"
            onClick={() => createOrUpdateRsvp('maybe')}
            className={userRsvp?.status === 'maybe' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Maybe
          </Button>
          <Button
            variant={userRsvp?.status === 'no' ? 'default' : 'outline'}
            size="sm"
            onClick={() => createOrUpdateRsvp('no')}
            className={userRsvp?.status === 'no' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            <XCircle className="h-4 w-4 mr-1" />
            No
          </Button>
        </div>
      </div>

      {/* RSVP Summary */}
      {rsvps.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 flex items-center gap-1">
            <Users className="h-4 w-4" />
            RSVPs ({rsvps.length})
          </p>
          
          <div className="space-y-3">
            {/* Yes responses */}
            {yesRsvps.length > 0 && (
              <div>
                <p className="text-xs text-green-600 font-medium mb-1">Going ({yesRsvps.length})</p>
                <div className="flex flex-wrap gap-2">
                  {yesRsvps.map((rsvp) => (
                    <Badge key={rsvp.id} className={statusConfig.yes.color}>
                      {rsvp.profile && (
                        <UserAvatar 
                          displayName={rsvp.profile.display_name} 
                          avatarUrl={rsvp.profile.avatar_url}
                          size="sm"
                          className="mr-2"
                        />
                      )}
                      {rsvp.profile?.display_name || 'Anonymous'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Maybe responses */}
            {maybeRsvps.length > 0 && (
              <div>
                <p className="text-xs text-yellow-600 font-medium mb-1">Maybe ({maybeRsvps.length})</p>
                <div className="flex flex-wrap gap-2">
                  {maybeRsvps.map((rsvp) => (
                    <Badge key={rsvp.id} className={statusConfig.maybe.color}>
                      {rsvp.profile && (
                        <UserAvatar 
                          displayName={rsvp.profile.display_name} 
                          avatarUrl={rsvp.profile.avatar_url}
                          size="sm"
                          className="mr-2"
                        />
                      )}
                      {rsvp.profile?.display_name || 'Anonymous'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* No responses */}
            {noRsvps.length > 0 && (
              <div>
                <p className="text-xs text-red-600 font-medium mb-1">Can't make it ({noRsvps.length})</p>
                <div className="flex flex-wrap gap-2">
                  {noRsvps.map((rsvp) => (
                    <Badge key={rsvp.id} className={statusConfig.no.color}>
                      {rsvp.profile && (
                        <UserAvatar 
                          displayName={rsvp.profile.display_name} 
                          avatarUrl={rsvp.profile.avatar_url}
                          size="sm"
                          className="mr-2"
                        />
                      )}
                      {rsvp.profile?.display_name || 'Anonymous'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};