import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateInitials } from "@/utils/avatarUtils";

interface UserAvatarProps {
  displayName: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12'
};

export const UserAvatar = ({ 
  displayName, 
  avatarUrl, 
  size = 'md', 
  className = '' 
}: UserAvatarProps) => {
  const initials = generateInitials(displayName);
  
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={avatarUrl || undefined} alt={`${displayName} avatar`} />
      <AvatarFallback className="bg-gradient-gaming text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};