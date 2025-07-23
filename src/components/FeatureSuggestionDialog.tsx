import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FeatureSuggestionDialogProps {
  children: React.ReactNode;
}

export const FeatureSuggestionDialog = ({ children }: FeatureSuggestionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    featureTitle: "",
    priority: "",
    useCase: "",
    description: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.featureTitle || !formData.priority || !formData.useCase || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          type: 'feature',
          name: formData.name,
          email: formData.email,
          featureTitle: formData.featureTitle,
          priority: formData.priority,
          useCase: formData.useCase,
          description: formData.description,
        }
      });

      if (error) throw error;

      toast({
        title: "Suggestion sent!",
        description: "Your feature suggestion has been submitted. Thank you for your feedback!",
      });
      
      setOpen(false);
      setFormData({
        name: "",
        email: "",
        featureTitle: "",
        priority: "",
        useCase: "",
        description: "",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send your suggestion. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Suggest a Feature
          </DialogTitle>
          <DialogDescription>
            Have an idea for a new feature or improvement? We'd love to hear your suggestions!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="featureTitle">Feature Title</Label>
            <Input
              id="featureTitle"
              value={formData.featureTitle}
              onChange={(e) => setFormData({ ...formData, featureTitle: e.target.value })}
              placeholder="Brief title for your feature idea"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">How important is this to you?</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, priority: value })} required>
              <SelectTrigger>
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nice-to-have">Nice to have</SelectItem>
                <SelectItem value="would-use-often">Would use often</SelectItem>
                <SelectItem value="really-need">Really need this</SelectItem>
                <SelectItem value="game-changer">Would be a game changer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="useCase">Use Case</Label>
            <Textarea
              id="useCase"
              value={formData.useCase}
              onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
              placeholder="When and how would you use this feature? What problem would it solve?"
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your feature idea in detail. How should it work? Any specific design ideas?"
              rows={4}
              required
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gaming">
              Send Suggestion
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};