import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "",
    displayName: "",
    bio: "",
    location: "",
    gaming_experience: "" as "" | "beginner" | "intermediate" | "expert",
    preferred_player_count: "",
    gaming_style: "" as "" | "casual" | "competitive" | "teaching-friendly" | "mixed"
  });
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the tab from URL params
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'signup' ? 'signup' : 'signin');

  // Only redirect authenticated users if they're not explicitly trying to access signup
  useEffect(() => {
    if (user && !tabFromUrl) {
      const from = (location.state as any)?.from?.pathname || "/library";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location, tabFromUrl]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(signInData.email, signInData.password);
    
    if (!error) {
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      return;
    }
    
    setIsLoading(true);
    
    // Sign up with display name
    const { error } = await signUp(signUpData.email, signUpData.password, signUpData.displayName);
    
    // If signup successful and we have additional profile data, update the profile
    if (!error) {
      // Small delay to ensure profile creation trigger has completed
      setTimeout(async () => {
        try {
          const profileUpdates = {
            ...(signUpData.bio && { bio: signUpData.bio }),
            ...(signUpData.location && { location: signUpData.location }),
            ...(signUpData.gaming_experience && { gaming_experience: signUpData.gaming_experience }),
            ...(signUpData.preferred_player_count && { preferred_player_count: signUpData.preferred_player_count }),
            ...(signUpData.gaming_style && { gaming_style: signUpData.gaming_style })
          };
          
          if (Object.keys(profileUpdates).length > 0) {
            const { supabase } = await import('@/integrations/supabase/client');
            await supabase
              .from('profiles')
              .update(profileUpdates)
              .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
          }
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      }, 1000);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center page-background px-4 cozy-section">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <Crown className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-3xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
              GameNight
            </span>
          </Link>
          <p className="text-muted-foreground">
            Join the ultimate board game community
          </p>
        </div>

        <Card className="shadow-gaming section-background backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="gaming"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Create Your Gaming Profile</h3>
                    <p className="text-sm text-muted-foreground">Help us set up your gaming profile (all fields optional except email & password)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-displayname">Display Name *</Label>
                    <Input
                      id="signup-displayname"
                      type="text"
                      placeholder="How should others see you?"
                      value={signUpData.displayName}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, displayName: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password *</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    {signUpData.password !== signUpData.confirmPassword && signUpData.confirmPassword && (
                      <p className="text-sm text-destructive">Passwords don't match</p>
                    )}
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-md font-medium mb-3 text-center">Gaming Profile (Optional)</h4>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="signup-bio">About You</Label>
                        <Textarea
                          id="signup-bio"
                          placeholder="Tell us about your gaming interests..."
                          rows={2}
                          value={signUpData.bio}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, bio: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-location">Location</Label>
                        <Input
                          id="signup-location"
                          placeholder="City, Country"
                          value={signUpData.location}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-experience">Gaming Experience</Label>
                        <Select
                          value={signUpData.gaming_experience}
                          onValueChange={(value) => setSignUpData(prev => ({ ...prev, gaming_experience: value as "beginner" | "intermediate" | "expert" }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="How experienced are you?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner (New to board games)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (Regular player)</SelectItem>
                            <SelectItem value="expert">Expert (Serious gamer)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-player-count">Preferred Player Count</Label>
                        <Select
                          value={signUpData.preferred_player_count}
                          onValueChange={(value) => setSignUpData(prev => ({ ...prev, preferred_player_count: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="How many players do you prefer?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 Players</SelectItem>
                            <SelectItem value="3-4">3-4 Players</SelectItem>
                            <SelectItem value="4-6">4-6 Players</SelectItem>
                            <SelectItem value="6+">6+ Players</SelectItem>
                            <SelectItem value="any">Any Number</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-style">Gaming Style</Label>
                        <Select
                          value={signUpData.gaming_style}
                          onValueChange={(value) => setSignUpData(prev => ({ ...prev, gaming_style: value as "casual" | "competitive" | "teaching-friendly" | "mixed" }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="What's your gaming style?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casual">Casual & Fun</SelectItem>
                            <SelectItem value="competitive">Competitive</SelectItem>
                            <SelectItem value="teaching-friendly">Teaching Friendly</SelectItem>
                            <SelectItem value="mixed">Mixed Style</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    variant="gaming"
                    disabled={isLoading || signUpData.password !== signUpData.confirmPassword || !signUpData.displayName}
                  >
                    {isLoading ? "Creating Account..." : "Create Account & Join the Community"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;