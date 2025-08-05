import { useState, useMemo } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, AlertCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContactSupportDialogProps {
  children: React.ReactNode;
}

// FAQ content for cross-referencing
const faqContent = [
  {
    keywords: ["add games", "library", "import", "collection"],
    question: "How do I add games to my library?",
    answer: "You can add games to your library in two ways: 1) Search for games manually using the 'Add Game' button, or 2) Sync your existing BoardGameGeek collection using the 'Sync BGG Collection' button."
  },
  {
    keywords: ["bgg", "boardgamegeek", "sync", "import collection"],
    question: "Can I import my BoardGameGeek collection?",
    answer: "Yes! Use the 'Sync BGG Collection' feature on your library page. Enter your BGG username and we'll import all your games automatically."
  },
  {
    keywords: ["didn't import", "missing games", "partial import", "large collection"],
    question: "My BGG collection didn't fully import - what should I do?",
    answer: "For large BGG collections (200+ games), you may need to run the sync 2-4 times to import your entire collection. This is normal! Each sync attempt will import additional games."
  },
  {
    keywords: ["expansion", "base game", "mixed up", "wrong grouping", "drag drop"],
    question: "BGG import mixed up my expansions and base games",
    answer: "Sometimes BoardGameGeek imports mix up expansions and base games. You can easily fix this by dragging and dropping the expansion onto the correct base game."
  },
  {
    keywords: ["game night", "friends", "invite", "event"],
    question: "How do I organize game nights with friends?",
    answer: "Navigate to the Game Nights page where you can create events, invite friends, and select games from your library. Friends can RSVP and see what games will be played."
  },
  {
    keywords: ["randomizer", "tools", "dice", "coin flip"],
    question: "What gaming tools are available?",
    answer: "The Randomizers page includes coin flipper, random number generator, random choice selector, and player order shuffler - everything you need for game night randomization."
  },
  {
    keywords: ["rating", "plays", "track"],
    question: "Can I track my game ratings and plays?",
    answer: "Yes! When editing games in your library, you can set personal ratings, track play counts, and add notes about your gaming experiences."
  },
  {
    keywords: ["friends", "connect", "other players"],
    question: "How do I connect with other players?",
    answer: "Use the Friends page to search for and connect with other GameNight users. You can see their public game libraries and coordinate game nights together."
  },
  {
    keywords: ["private", "collection", "library visibility"],
    question: "Is my game collection private?",
    answer: "Your game collection is private by default. You can choose to make your library public in your profile settings if you want friends to see your games."
  },
  {
    keywords: ["edit game", "information", "ratings"],
    question: "Can I edit game information?",
    answer: "You can edit personal information like ratings, play counts, and notes. You can also customize display titles and categorize games as expansions."
  }
];

export const ContactSupportDialog = ({ children }: ContactSupportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    issueType: "",
    subject: "",
    description: "",
  });
  const { toast } = useToast();

  // Check for FAQ matches based on subject and description
  const faqMatches = useMemo(() => {
    const searchText = `${formData.subject} ${formData.description}`.toLowerCase();
    if (!searchText.trim()) return [];

    return faqContent.filter(faq => 
      faq.keywords.some(keyword => searchText.includes(keyword.toLowerCase()))
    ).slice(0, 2); // Limit to 2 most relevant matches
  }, [formData.subject, formData.description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.issueType || !formData.subject || !formData.description) {
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
          type: 'support',
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          issueType: formData.issueType,
          description: formData.description,
        }
      });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "Your support request has been submitted. We'll get back to you soon.",
      });
      
      setOpen(false);
      setFormData({
        name: "",
        email: "",
        issueType: "",
        subject: "",
        description: "",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
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
            <Mail className="h-5 w-5 text-primary" />
            Contact Support
          </DialogTitle>
          <DialogDescription>
            Having trouble with the app? Let us know about bugs, errors, or questions you have.
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
            <Label htmlFor="issueType">Issue Type</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, issueType: value })} required>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="error">Error/Crash</SelectItem>
                <SelectItem value="question">General Question</SelectItem>
                <SelectItem value="account">Account Issue</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief description of the issue"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide detailed information about the issue, including steps to reproduce if applicable."
              rows={4}
              required
            />
          </div>

          {/* FAQ Suggestions */}
          {faqMatches.length > 0 && (
            <Alert className="border-gaming-blue/20 bg-gaming-blue/5">
              <AlertCircle className="h-4 w-4 text-gaming-blue" />
              <AlertDescription>
                <div className="mb-2 font-medium text-gaming-blue">
                  We found some FAQ answers that might help:
                </div>
                <div className="space-y-2">
                  {faqMatches.map((faq, index) => (
                    <div key={index} className="border-l-2 border-gaming-blue/30 pl-3">
                      <p className="font-medium text-sm">{faq.question}</p>
                      <p className="text-xs text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-gaming-blue mt-2"
                  asChild
                >
                  <a href="/faq" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View full FAQ
                  </a>
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gaming">
              Send Support Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};