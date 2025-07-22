import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BOARD_GAME_MECHANICS } from "@/constants/boardGameMechanics";

interface EditGameDialogProps {
  editingGame: any;
  onClose: () => void;
  onSave: (updates: any) => void;
  allBaseGames: any[];
  getDisplayTitle: (game: any) => string;
  isSaving: boolean;
}

export const EditGameDialog = ({
  editingGame,
  onClose,
  onSave,
  allBaseGames,
  getDisplayTitle,
  isSaving
}: EditGameDialogProps) => {
  const [editRating, setEditRating] = useState<number | undefined>();
  const [editNotes, setEditNotes] = useState("");
  const [editCustomTitle, setEditCustomTitle] = useState("");
  const [editIsExpansion, setEditIsExpansion] = useState(false);
  const [editBaseGameId, setEditBaseGameId] = useState<string | undefined>();
  const [editCoreMechanic, setEditCoreMechanic] = useState<string>("");
  const [editAdditionalMechanic1, setEditAdditionalMechanic1] = useState<string>("");
  const [editAdditionalMechanic2, setEditAdditionalMechanic2] = useState<string>("");

  useEffect(() => {
    if (editingGame) {
      setEditRating(editingGame.personal_rating || undefined);
      setEditNotes(editingGame.notes || "");
      setEditIsExpansion(editingGame.game.is_expansion || false);
      setEditBaseGameId(editingGame.game.base_game_bgg_id?.toString() || undefined);
      setEditCoreMechanic(editingGame.game.core_mechanic || "none");
      setEditAdditionalMechanic1(editingGame.game.additional_mechanic_1 || "none");
      setEditAdditionalMechanic2(editingGame.game.additional_mechanic_2 || "none");
      setEditCustomTitle(editingGame.game.custom_title || "");
    }
  }, [editingGame]);

  const handleSave = () => {
    onSave({
      userGameId: editingGame.id,
      gameId: editingGame.game.bgg_id,
      userUpdates: {
        personal_rating: editRating,
        notes: editNotes,
      },
      gameUpdates: {
        isExpansion: editIsExpansion,
        baseGameBggId: editBaseGameId,
        coreMechanic: editCoreMechanic === "none" ? null : editCoreMechanic || null,
        additionalMechanic1: editAdditionalMechanic1 === "none" ? null : editAdditionalMechanic1 || null,
        additionalMechanic2: editAdditionalMechanic2 === "none" ? null : editAdditionalMechanic2 || null,
        customTitle: editCustomTitle || null
      }
    });
  };

  return (
    <Dialog open={!!editingGame} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {editingGame ? getDisplayTitle(editingGame.game) : ''}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Custom Title */}
          <div>
            <Label htmlFor="customTitle">Custom Title (optional)</Label>
            <Input
              id="customTitle"
              value={editCustomTitle}
              onChange={(e) => setEditCustomTitle(e.target.value)}
              placeholder="Enter custom title or leave blank to use original"
            />
          </div>

          {/* Personal Rating */}
          <div>
            <Label htmlFor="rating">Your Rating (1-10)</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="10"
              value={editRating || ''}
              onChange={(e) => setEditRating(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add your notes about this game..."
              rows={3}
            />
          </div>

          {/* Expansion Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isExpansion"
                checked={editIsExpansion}
                onCheckedChange={(checked) => setEditIsExpansion(checked as boolean)}
              />
              <Label htmlFor="isExpansion">This is an expansion</Label>
            </div>

            {editIsExpansion && (
              <div>
                <Label htmlFor="baseGame">Base Game</Label>
                <Select value={editBaseGameId || ''} onValueChange={setEditBaseGameId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select base game" />
                  </SelectTrigger>
                  <SelectContent>
                    {allBaseGames.map((baseGame) => (
                      <SelectItem key={baseGame.game.bgg_id} value={baseGame.game.bgg_id.toString()}>
                        {getDisplayTitle(baseGame.game)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Mechanics */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="coreMechanic">Core Mechanic</Label>
              <Select value={editCoreMechanic} onValueChange={setEditCoreMechanic}>
                <SelectTrigger>
                  <SelectValue placeholder="Select core mechanic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {BOARD_GAME_MECHANICS.map((mechanic) => (
                    <SelectItem key={mechanic} value={mechanic}>
                      {mechanic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="additionalMechanic1">Additional Mechanic 1</Label>
              <Select value={editAdditionalMechanic1} onValueChange={setEditAdditionalMechanic1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select additional mechanic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {BOARD_GAME_MECHANICS.map((mechanic) => (
                    <SelectItem key={mechanic} value={mechanic}>
                      {mechanic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="additionalMechanic2">Additional Mechanic 2</Label>
              <Select value={editAdditionalMechanic2} onValueChange={setEditAdditionalMechanic2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select additional mechanic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {BOARD_GAME_MECHANICS.map((mechanic) => (
                    <SelectItem key={mechanic} value={mechanic}>
                      {mechanic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};