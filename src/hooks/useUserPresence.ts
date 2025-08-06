import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPresence {
  user_id: string;
  online_at: string;
  status: 'online' | 'away' | 'offline';
}

export const useUserPresence = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [userStatuses, setUserStatuses] = useState<Map<string, 'online' | 'away' | 'offline'>>(new Map());

  useEffect(() => {
    if (!user) return;

    // Create a presence channel
    const channel = supabase.channel('user_presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track current user's presence
    const trackPresence = async () => {
      const userStatus: UserPresence = {
        user_id: user.id,
        online_at: new Date().toISOString(),
        status: 'online',
      };

      await channel.track(userStatus);
    };

    // Listen for presence changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = new Set<string>();
        const statuses = new Map<string, 'online' | 'away' | 'offline'>();
        
        Object.entries(state).forEach(([userId, presences]) => {
          if (presences && presences.length > 0) {
            online.add(userId);
            const latestPresence = presences[0];
            if (latestPresence && typeof latestPresence === 'object' && 'status' in latestPresence) {
              statuses.set(userId, (latestPresence as any).status);
            } else {
              statuses.set(userId, 'online');
            }
          }
        });
        
        setOnlineUsers(online);
        setUserStatuses(statuses);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers(prev => new Set([...prev, key]));
        if (newPresences.length > 0) {
          const presence = newPresences[0];
          if (presence && typeof presence === 'object' && 'status' in presence) {
            setUserStatuses(prev => new Map([...prev, [key, (presence as any).status]]));
          } else {
            setUserStatuses(prev => new Map([...prev, [key, 'online']]));
          }
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
        setUserStatuses(prev => {
          const newMap = new Map(prev);
          newMap.set(key, 'offline');
          return newMap;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await trackPresence();
        }
      });

    // Handle page visibility for away status
    const handleVisibilityChange = () => {
      const status = document.hidden ? 'away' : 'online';
      const userStatus: UserPresence = {
        user_id: user.id,
        online_at: new Date().toISOString(),
        status,
      };
      channel.track(userStatus);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getUserStatus = (userId: string): 'online' | 'away' | 'offline' => {
    if (onlineUsers.has(userId)) {
      return userStatuses.get(userId) || 'online';
    }
    return 'offline';
  };

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
  };

  return {
    onlineUsers,
    userStatuses,
    getUserStatus,
    isUserOnline,
  };
};