import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Trash2,
  Monitor,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { EditProfileDialog } from "@/components/EditProfileDialog";

interface UserPreference {
  id: string;
  preference_key: string;
  preference_value: string;
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [friendRequests, setFriendRequests] = useState(true);
  const [gameNightInvites, setGameNightInvites] = useState(true);
  const [libraryPublic, setLibraryPublic] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  useEffect(() => {
    if (profile) {
      setLibraryPublic(profile.library_public || false);
    }
    fetchPreferences();
  }, [profile]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences(data || []);
      
      // Apply preferences to state
      data?.forEach((pref) => {
        switch (pref.preference_key) {
          case 'email_notifications':
            setEmailNotifications(pref.preference_value === 'true');
            break;
          case 'friend_requests':
            setFriendRequests(pref.preference_value === 'true');
            break;
          case 'game_night_invites':
            setGameNightInvites(pref.preference_value === 'true');
            break;
          case 'show_online_status':
            setShowOnlineStatus(pref.preference_value === 'true');
            break;
        }
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const updatePreference = async (key: string, value: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preference_key: key,
          preference_value: value
        }, {
          onConflict: 'user_id,preference_key'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: "Error",
        description: "Failed to update preference",
        variant: "destructive",
      });
    }
  };

  const handleLibraryPublicChange = async (checked: boolean) => {
    setLibraryPublic(checked);
    if (profile) {
      await updateProfile({ library_public: checked });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete user data from our tables first
      if (user) {
        await supabase.from('user_preferences').delete().eq('user_id', user.id);
        await supabase.from('profiles').delete().eq('user_id', user.id);
        await supabase.from('user_games').delete().eq('user_id', user.id);
        await supabase.from('game_nights').delete().eq('user_id', user.id);
        await supabase.from('friendships').delete().or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
      }
      
      toast({
        title: "Account Deleted",
        description: "Your account and all data have been deleted.",
      });
      
      await signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to access settings</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-background min-h-screen">
      {/* Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-gaming opacity-10 rounded-2xl blur-3xl"></div>
        <div className="relative bg-card/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage your account preferences and privacy settings
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Account Settings */}
        <Card className="section-background border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Display Name</Label>
                <p className="text-sm text-muted-foreground">
                  {profile.display_name}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEditProfileOpen(true)}
              >
                Edit Profile
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-base font-medium">Email Address</Label>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
            
            <div>
              <Label className="text-base font-medium">Account Status</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-gradient-gaming text-white">
                  Active
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="section-background border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">Theme Preference</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="flex flex-col items-center gap-2 h-16"
                >
                  <Sun className="h-4 w-4" />
                  <span className="text-xs">Light</span>
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="flex flex-col items-center gap-2 h-16"
                >
                  <Moon className="h-4 w-4" />
                  <span className="text-xs">Dark</span>
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className="flex flex-col items-center gap-2 h-16"
                >
                  <Monitor className="h-4 w-4" />
                  <span className="text-xs">System</span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Choose your preferred theme. System will automatically switch based on your device settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="section-background border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Visibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Public Game Library</Label>
                <p className="text-sm text-muted-foreground">
                  Allow friends to see your game collection
                </p>
              </div>
              <Switch
                checked={libraryPublic}
                onCheckedChange={handleLibraryPublicChange}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show Online Status</Label>
                <p className="text-sm text-muted-foreground">
                  Let friends see when you're online
                </p>
              </div>
              <Switch
                checked={showOnlineStatus}
                onCheckedChange={(checked) => {
                  setShowOnlineStatus(checked);
                  updatePreference('show_online_status', checked.toString());
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="section-background border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={(checked) => {
                  setEmailNotifications(checked);
                  updatePreference('email_notifications', checked.toString());
                }}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Friend Requests</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified of new friend requests
                </p>
              </div>
              <Switch
                checked={friendRequests}
                onCheckedChange={(checked) => {
                  setFriendRequests(checked);
                  updatePreference('friend_requests', checked.toString());
                }}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Game Night Invites</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when invited to game nights
                </p>
              </div>
              <Switch
                checked={gameNightInvites}
                onCheckedChange={(checked) => {
                  setGameNightInvites(checked);
                  updatePreference('game_night_invites', checked.toString());
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="section-background border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div>
                <Label className="text-base font-medium text-destructive">Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      {profile && (
        <EditProfileDialog
          open={isEditProfileOpen}
          onOpenChange={setIsEditProfileOpen}
          profile={profile}
        />
      )}
    </div>
  );
};

export default Settings;