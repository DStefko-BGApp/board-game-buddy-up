import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { Group, GroupMember } from '@/hooks/useGroups';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateGameNightFromGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
  members: GroupMember[];
}

const CreateGameNightFromGroupDialog = ({ 
  open, 
  onOpenChange, 
  group, 
  members 
}: CreateGameNightFromGroupDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim() || !formData.date || !formData.time) return;

    setLoading(true);
    try {
      // Create game night with group members pre-populated
      const attendees = members.map(member => member.user_id);
      
      const { data: gameNight, error } = await supabase
        .from('game_nights')
        .insert({
          title: formData.title.trim(),
          date: formData.date,
          time: formData.time,
          location: formData.location.trim() || null,
          notes: `${formData.notes}\n\nCreated for group: ${group.name}`.trim(),
          user_id: user.id,
          attendees: attendees,
          is_public: !group.is_private // Match group privacy
        })
        .select()
        .single();

      if (error) throw error;

      // Create RSVPs for all group members
      const rsvpData = attendees.map(userId => ({
        game_night_id: gameNight.id,
        user_id: userId,
        status: userId === user.id ? 'yes' : 'pending'
      }));

      const { error: rsvpError } = await supabase
        .from('game_night_rsvps')
        .insert(rsvpData);

      if (rsvpError) throw rsvpError;

      toast({
        title: "Game Night Created",
        description: `"${formData.title}" has been created for ${group.name}`,
      });

      // Reset form and close dialog
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        notes: ''
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating game night:', error);
      toast({
        title: "Error",
        description: "Failed to create game night",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gaming-pink" />
            Create Game Night for {group.name}
          </DialogTitle>
          <DialogDescription>
            All group members will be invited to this game night
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Game Night Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter game night title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Where will you be playing?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information for the group"
              rows={3}
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>{members.length} group members</strong> will be invited to this game night.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.title.trim() || !formData.date || !formData.time || loading}
              className="flex-1 bg-gradient-gaming hover:opacity-90 text-white"
            >
              {loading ? 'Creating...' : 'Create Game Night'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGameNightFromGroupDialog;