import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Profile {
  user_id: string;
  display_name: string;
  avatar_url?: string;
}

interface AttendeeLinkProps {
  attendeeName: string;
  className?: string;
}

export const AttendeeLink = ({ attendeeName, className = '' }: AttendeeLinkProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const findProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .ilike('display_name', attendeeName.trim())
          .single();

        if (!error && data) {
          setProfile(data);
        }
      } catch (error) {
        // Profile not found, which is fine
        console.debug(`No profile found for attendee: ${attendeeName}`);
      }
    };

    findProfile();
  }, [attendeeName]);

  const handleClick = () => {
    if (profile) {
      navigate(`/friends?profile=${profile.user_id}`);
    }
  };

  if (profile) {
    return (
      <Badge 
        variant="secondary" 
        className={`cursor-pointer hover:bg-secondary/80 transition-colors ${className}`}
        onClick={handleClick}
      >
        <UserAvatar 
          displayName={profile.display_name} 
          avatarUrl={profile.avatar_url}
          size="sm"
          className="mr-2"
        />
        {profile.display_name}
      </Badge>
    );
  }

  // Fallback for attendees without profiles
  return (
    <Badge variant="secondary" className={className}>
      {attendeeName}
    </Badge>
  );
};