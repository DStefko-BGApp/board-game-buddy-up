import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useProfile, Profile } from "@/hooks/useProfile";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useUserGames } from "@/hooks/useUserGames";
import { Loader2, X, Camera } from "lucide-react";
import { BOARD_GAME_MECHANICS } from "@/constants/boardGameMechanics";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

export const EditProfileDialog = ({ open, onOpenChange, profile }: EditProfileDialogProps) => {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || "");
  const [status, setStatus] = useState(profile.status);
  const [location, setLocation] = useState(profile.location || "");
  const [favoriteGames, setFavoriteGames] = useState<string[]>(profile.favorite_games || []);
  const [favoriteMechanics, setFavoriteMechanics] = useState<string[]>(profile.favorite_mechanics || []);
  const [gamingExperience, setGamingExperience] = useState(profile.gaming_experience || "");
  const [preferredPlayerCount, setPreferredPlayerCount] = useState(profile.preferred_player_count || "");
  const [gamingStyle, setGamingStyle] = useState(profile.gaming_style || "");
  const [availability, setAvailability] = useState(profile.availability || "");
  const [bggUsername, setBggUsername] = useState(profile.bgg_username || "");
  const [discordHandle, setDiscordHandle] = useState(profile.discord_handle || "");
  const [libraryPublic, setLibraryPublic] = useState(profile.library_public);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateProfile } = useProfile();
  const { uploadAvatar, uploading } = useAvatarUpload();
  const { userGames } = useUserGames();

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadedUrl = await uploadAvatar(file, profile.user_id);
    if (uploadedUrl) {
      setAvatarUrl(uploadedUrl);
    }
  };

  const handleRemoveFavoriteGame = (gameToRemove: string) => {
    setFavoriteGames(prev => prev.filter(game => game !== gameToRemove));
  };

  const handleAddFavoriteGame = (gameId: string) => {
    const game = userGames.find(g => g.id === gameId);
    if (game && !favoriteGames.includes(game.name) && favoriteGames.length < 5) {
      setFavoriteGames(prev => [...prev, game.name]);
    }
  };

  const handleRemoveFavoriteMechanic = (mechanicToRemove: string) => {
    setFavoriteMechanics(prev => prev.filter(mechanic => mechanic !== mechanicToRemove));
  };

  const handleAddFavoriteMechanic = (mechanic: string) => {
    if (!favoriteMechanics.includes(mechanic) && favoriteMechanics.length < 3) {
      setFavoriteMechanics(prev => [...prev, mechanic]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsSubmitting(true);
    try {
      await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        status,
        location: location.trim() || null,
        avatar_url: avatarUrl || null,
        favorite_games: favoriteGames.length > 0 ? favoriteGames : null,
        favorite_mechanics: favoriteMechanics.length > 0 ? favoriteMechanics : null,
        gaming_experience: (gamingExperience as 'beginner' | 'intermediate' | 'expert') || null,
        preferred_player_count: preferredPlayerCount || null,
        gaming_style: (gamingStyle as 'casual' | 'competitive' | 'teaching-friendly' | 'mixed') || null,
        availability: availability.trim() || null,
        bgg_username: bggUsername.trim() || null,
        discord_handle: discordHandle.trim() || null,
        library_public: libraryPublic
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDisplayName(profile.display_name);
      setBio(profile.bio || "");
      setStatus(profile.status);
      setLocation(profile.location || "");
      setFavoriteGames(profile.favorite_games || []);
      setFavoriteMechanics(profile.favorite_mechanics || []);
      setGamingExperience(profile.gaming_experience || "");
      setPreferredPlayerCount(profile.preferred_player_count || "");
      setGamingStyle(profile.gaming_style || "");
      setAvailability(profile.availability || "");
      setBggUsername(profile.bgg_username || "");
      setDiscordHandle(profile.discord_handle || "");
      setLibraryPublic(profile.library_public);
      setAvatarUrl(profile.avatar_url || "");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your gaming profile information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-gradient-gaming text-primary-foreground text-2xl">
                      {displayName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground text-center">
                Click the camera icon to upload a profile picture
              </p>
            </div>

            {/* Basic Information */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name*</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Library Sharing */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Share Library with Friends</Label>
                <p className="text-sm text-muted-foreground">
                  Allow friends to see your game collection
                </p>
              </div>
              <Switch
                checked={libraryPublic}
                onCheckedChange={setLibraryPublic}
              />
            </div>

            {/* Favorite Games */}
            <div className="grid gap-2">
              <Label>Favorite Games (Top 5)</Label>
              <div className="space-y-2">
                {favoriteGames.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {favoriteGames.map((game) => (
                      <Badge key={game} variant="secondary" className="gap-1">
                        {game}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleRemoveFavoriteGame(game)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                {favoriteGames.length < 5 && userGames.length > 0 && (
                  <Select onValueChange={handleAddFavoriteGame}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add a favorite game" />
                    </SelectTrigger>
                    <SelectContent>
                      {userGames
                        .filter(game => !favoriteGames.includes(game.name))
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((game) => (
                          <SelectItem key={game.id} value={game.id}>
                            {game.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Favorite Mechanics */}
            <div className="grid gap-2">
              <Label>Favorite Mechanics (Top 3)</Label>
              <div className="space-y-2">
                {favoriteMechanics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {favoriteMechanics.map((mechanic) => (
                      <Badge key={mechanic} variant="secondary" className="gap-1">
                        {mechanic}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleRemoveFavoriteMechanic(mechanic)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                {favoriteMechanics.length < 3 && (
                  <Select onValueChange={handleAddFavoriteMechanic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add a favorite mechanic" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOARD_GAME_MECHANICS
                        .filter(mechanic => !favoriteMechanics.includes(mechanic))
                        .sort((a, b) => a.localeCompare(b))
                        .map((mechanic) => (
                          <SelectItem key={mechanic} value={mechanic}>
                            {mechanic}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Gaming Preferences */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gamingExperience">Gaming Experience</Label>
                <Select value={gamingExperience} onValueChange={setGamingExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="preferredPlayerCount">Preferred Player Count</Label>
                <Input
                  id="preferredPlayerCount"
                  value={preferredPlayerCount}
                  onChange={(e) => setPreferredPlayerCount(e.target.value)}
                  placeholder="e.g., 2-4 players, Large groups"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="gamingStyle">Gaming Style</Label>
                <Select value={gamingStyle} onValueChange={setGamingStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gaming style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="competitive">Competitive</SelectItem>
                    <SelectItem value="teaching-friendly">Teaching Friendly</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="availability">Gaming Availability</Label>
                <Input
                  id="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g., Weekends, Evenings"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bggUsername">BoardGameGeek Username</Label>
                <Input
                  id="bggUsername"
                  value={bggUsername}
                  onChange={(e) => setBggUsername(e.target.value)}
                  placeholder="Your BGG username"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="discordHandle">Discord Handle</Label>
                <Input
                  id="discordHandle"
                  value={discordHandle}
                  onChange={(e) => setDiscordHandle(e.target.value)}
                  placeholder="Your Discord username"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!displayName.trim() || isSubmitting}
              variant="gaming"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};