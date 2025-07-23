import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

const onboardingSchema = z.object({
  display_name: z.string().min(1, 'Display name is required'),
  bio: z.string().optional(),
  location: z.string().optional(),
  gaming_experience: z.enum(['beginner', 'intermediate', 'expert']).optional(),
  preferred_player_count: z.string().optional(),
  gaming_style: z.enum(['casual', 'competitive', 'teaching-friendly', 'mixed']).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

const OnboardingDialog = ({ open, onComplete }: OnboardingDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useProfile();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setLoading(true);
    try {
      // Filter out undefined values
      const profileUpdates = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
      );
      
      await updateProfile(profileUpdates);
      toast({
        title: "Profile updated!",
        description: "Welcome to the community!",
      });
      onComplete();
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast({
      title: "Profile setup skipped",
      description: "You can complete your profile anytime in settings.",
    });
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to the Gaming Community! 🎮
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Let's set up your profile to help you connect with fellow gamers
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                placeholder="How should others see you?"
                {...register('display_name')}
              />
              {errors.display_name && (
                <p className="text-sm text-destructive">{errors.display_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself and your gaming interests..."
                rows={3}
                {...register('bio')}
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Where are you based? (City, Country)"
                {...register('location')}
              />
            </div>

            <div>
              <Label htmlFor="gaming_experience">Gaming Experience</Label>
              <Select
                value={watch('gaming_experience') || ''}
                onValueChange={(value) => setValue('gaming_experience', value as 'beginner' | 'intermediate' | 'expert')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How experienced are you with board games?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (New to board games)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (Regular player)</SelectItem>
                  <SelectItem value="expert">Expert (Serious gamer)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferred_player_count">Preferred Player Count</Label>
              <Select
                value={watch('preferred_player_count') || ''}
                onValueChange={(value) => setValue('preferred_player_count', value)}
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

            <div>
              <Label htmlFor="gaming_style">Gaming Style</Label>
              <Select
                value={watch('gaming_style') || ''}
                onValueChange={(value) => setValue('gaming_style', value as 'casual' | 'competitive' | 'teaching-friendly' | 'mixed')}
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

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Setting up..." : "Complete Profile"}
            </Button>
          </div>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          You can always update your profile later in the settings page
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;