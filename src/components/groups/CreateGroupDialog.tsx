import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useGroups } from '@/hooks/useGroups';
import { Users, Lock, Globe } from 'lucide-react';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateGroupDialog = ({ open, onOpenChange }: CreateGroupDialogProps) => {
  const { createGroup } = useGroups();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_private: false,
    max_members: 20
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const result = await createGroup({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        is_private: formData.is_private,
        max_members: formData.max_members > 0 ? formData.max_members : undefined
      });
      
      // Only reset and close if creation was successful
      if (result) {
        // Reset form and close dialog
        setFormData({
          name: '',
          description: '',
          is_private: false,
          max_members: 20
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gaming-pink" />
            Create New Group
          </DialogTitle>
          <DialogDescription>
            Start a new gaming community and invite your friends to join
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your group's purpose and interests"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_members">Maximum Members</Label>
            <Input
              id="max_members"
              type="number"
              min="2"
              max="100"
              value={formData.max_members}
              onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) || 20 })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              {formData.is_private ? (
                <Lock className="h-5 w-5 text-gaming-red" />
              ) : (
                <Globe className="h-5 w-5 text-gaming-green" />
              )}
              <div>
                <Label htmlFor="is_private" className="text-sm font-medium">
                  {formData.is_private ? 'Private Group' : 'Public Group'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {formData.is_private 
                    ? 'Only invited members can join'
                    : 'Anyone can discover and join'
                  }
                </p>
              </div>
            </div>
            <Switch
              id="is_private"
              checked={formData.is_private}
              onCheckedChange={(checked) => setFormData({ ...formData, is_private: checked })}
            />
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
              disabled={!formData.name.trim() || loading}
              className="flex-1 bg-gradient-gaming hover:opacity-90 text-white"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;