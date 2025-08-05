import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, Mail, Lightbulb } from "lucide-react";
import { ContactSupportDialog } from "@/components/ContactSupportDialog";
import { FeatureSuggestionDialog } from "@/components/FeatureSuggestionDialog";

const FAQ = () => {
  const faqs = [
    {
      question: "How do I add games to my library?",
      answer: "You can add games to your library in two ways: 1) Search for games manually using the 'Add Game' button, or 2) Sync your existing BoardGameGeek collection using the 'Sync BGG Collection' button."
    },
    {
      question: "Can I import my BoardGameGeek collection?",
      answer: "Yes! Use the 'Sync BGG Collection' feature on your library page. Enter your BGG username and we'll import all your games automatically."
    },
    {
      question: "My BGG collection didn't fully import - what should I do?",
      answer: "For large BGG collections (200+ games), you may need to run the sync 2-4 times to import your entire collection. This is normal! Each sync attempt will import additional games. Simply click 'Sync BGG Collection' again until all your games are imported. The process works incrementally, so you won't get duplicates."
    },
    {
      question: "BGG import mixed up my expansions and base games - how do I fix this?",
      answer: "Sometimes BoardGameGeek imports mix up expansions and base games during the sync process. This is a known issue with BGG data. You can easily fix this by dragging and dropping the misplaced expansion onto the correct base game in your library. The drag-and-drop feature will automatically group them properly."
    },
    {
      question: "How do I organize game nights with friends?",
      answer: "Navigate to the Game Nights page where you can create events, invite friends, and select games from your library. Friends can RSVP and see what games will be played."
    },
    {
      question: "What gaming tools are available?",
      answer: "The Randomizers page includes coin flipper, random number generator, random choice selector, and player order shuffler - everything you need for game night randomization."
    },
    {
      question: "Can I track my game ratings and plays?",
      answer: "Yes! When editing games in your library, you can set personal ratings, track play counts, and add notes about your gaming experiences."
    },
    {
      question: "How do I connect with other players?",
      answer: "Use the Friends page to search for and connect with other GameNight users. You can see their public game libraries and coordinate game nights together."
    },
    {
      question: "Is my game collection private?",
      answer: "Your game collection is private by default. You can choose to make your library public in your profile settings if you want friends to see your games."
    },
    {
      question: "Can I edit game information?",
      answer: "You can edit personal information like ratings, play counts, and notes. You can also customize display titles and categorize games as expansions."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-background min-h-screen">
      {/* Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-gaming opacity-10 rounded-2xl blur-3xl"></div>
        <div className="relative bg-card/90 backdrop-blur-sm border border-white/20 rounded-2xl p-8 cozy-section">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HelpCircle className="h-12 w-12 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
                Frequently Asked Questions
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions about using GameNight
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <Card className="shadow-gaming section-background border-white/10 cozy-section mb-8">
        <CardHeader>
          <CardTitle>Common Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-white/10 rounded-lg px-4">
                <AccordionTrigger className="text-left font-semibold hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Need More Help Section */}
      <Card className="shadow-gaming section-background border-white/10 cozy-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Need More Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? We're here to help! Use the forms below to get in touch with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ContactSupportDialog>
              <Button variant="gaming" size="lg" className="hover-scale">
                <Mail className="h-5 w-5 mr-2" />
                Contact Support
              </Button>
            </ContactSupportDialog>
            <FeatureSuggestionDialog>
              <Button variant="outline" size="lg" className="hover-scale border-primary/20 hover:border-primary/40">
                <Lightbulb className="h-5 w-5 mr-2" />
                Suggest Features
              </Button>
            </FeatureSuggestionDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQ;