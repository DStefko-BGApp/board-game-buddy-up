import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Lock, Globe } from 'lucide-react';
import { Group } from '@/hooks/useGroups';
import { useGroupDetails } from '@/hooks/useGroupDetails';

interface EditGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}

const EditGroupDialog = ({ open, onOpenChange, group }: EditGroupDialogProps) => {
  const { updateGroup } = useGroupDetails(group.id);
  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description || '',
    is_private: group.is_private,
    max_members: group.max_members || 20
  });
  const [loading, setLoading] = useState(false);

  // Reset form when group changes
  useEffect(() => {
    setFormData({
      name: group.name,
      description: group.description || '',
      is_private: group.is_private,
      max_members: group.max_members || 20
    });
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await updateGroup({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        is_private: formData.is_private,
        max_members: formData.max_members > 0 ? formData.max_members : null
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gaming-purple" />
            Edit Group Settings
          </DialogTitle>
          <DialogDescription>
            Update your group's information and settings
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
              {loading ? 'Updating...' : 'Update Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupDialog;