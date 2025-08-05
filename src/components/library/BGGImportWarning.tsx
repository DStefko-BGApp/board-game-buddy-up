import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const BGGImportWarning = () => {
  return (
    <Alert className="mb-4 border-gaming-orange/20 bg-gaming-orange/5">
      <Info className="h-4 w-4 text-gaming-orange" />
      <AlertTitle className="text-gaming-orange">BGG Import Note</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        Sometimes BoardGameGeek imports mix up expansions and base games. If this happens, 
        you can easily fix it by <strong>dragging and dropping the expansion</strong> onto the correct base game.
      </AlertDescription>
    </Alert>
  );
};