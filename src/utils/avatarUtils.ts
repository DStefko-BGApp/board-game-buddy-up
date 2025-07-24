/**
 * Utility functions for avatar display and management
 */

/**
 * Generate initials from a display name
 */
export const generateInitials = (displayName: string): string => {
  return displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Get the appropriate display for a user avatar
 */
export const getAvatarDisplay = (displayName: string, avatarUrl?: string | null) => {
  return {
    initials: generateInitials(displayName),
    avatarUrl: avatarUrl || undefined,
    hasAvatar: !!avatarUrl
  };
};

/**
 * Format player count display
 */
export const formatPlayerCount = (min?: number, max?: number): string => {
  if (!min && !max) return 'Unknown';
  if (min === max) return min?.toString() || 'Unknown';
  return `${min || '?'}-${max || '?'}`;
};