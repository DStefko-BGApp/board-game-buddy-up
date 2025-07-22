import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SyncDialogProps {
  open: boolean;
  onClose: () => void;
  onSync: (username: string) => void;
  isSyncing: boolean;
}

export const SyncDialog = ({
  open,
  onClose,
  onSync,
  isSyncing
}: SyncDialogProps) => {
  const [bggUsername, setBggUsername] = useState("");

  const handleSync = () => {
    if (bggUsername.trim()) {
      onSync(bggUsername);
    }
  };

  const handleClose = () => {
    setBggUsername("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync BGG Collection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="bggUsername">BoardGameGeek Username</Label>
            <Input
              id="bggUsername"
              placeholder="Enter your BGG username"
              value={bggUsername}
              onChange={(e) => setBggUsername(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSync} 
              disabled={isSyncing || !bggUsername.trim()}
              className="flex-1"
            >
              {isSyncing ? 'Syncing...' : 'Sync Collection'}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};