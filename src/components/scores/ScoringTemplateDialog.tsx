import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Settings } from "lucide-react";
import { ScoringField, ScoringTemplate } from "@/hooks/useScoringTemplates";

interface ScoringTemplateDialogProps {
  template: ScoringTemplate;
  onUpdateTemplate: (templateId: string, fields: ScoringField[]) => Promise<void>;
}

export const ScoringTemplateDialog = ({ template, onUpdateTemplate }: ScoringTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<ScoringField[]>(template.scoring_fields);
  const [loading, setLoading] = useState(false);

  const addField = () => {
    const newField: ScoringField = {
      id: `field_${Date.now()}`,
      name: "",
      type: "number",
      defaultValue: 0,
      required: false
    };
    setFields([...fields, newField]);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const updateField = (fieldId: string, updates: Partial<ScoringField>) => {
    setFields(fields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    ));
  };

  const handleSave = async () => {
    const validFields = fields.filter(f => f.name.trim());
    
    if (validFields.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await onUpdateTemplate(template.id, validFields);
      setOpen(false);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
          Edit Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Scoring Template: {template.game_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-base font-medium">Scoring Fields</Label>
            <Button type="button" variant="outline" size="sm" onClick={addField}>
              <Plus className="h-4 w-4" />
              Add Field
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {fields.map((field) => (
              <div key={field.id} className="flex gap-2 items-end p-3 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor={`name-${field.id}`} className="text-sm">Field Name</Label>
                  <Input
                    id={`name-${field.id}`}
                    placeholder="e.g., Victory Points"
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                  />
                </div>
                
                <div className="w-32">
                  <Label htmlFor={`type-${field.id}`} className="text-sm">Type</Label>
                  <Select 
                    value={field.type} 
                    onValueChange={(value: 'number' | 'text') => updateField(field.id, { type: value })}
                  >
                    <SelectTrigger id={`type-${field.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24">
                  <Label htmlFor={`default-${field.id}`} className="text-sm">Default</Label>
                  {field.type === 'number' ? (
                    <Input
                      id={`default-${field.id}`}
                      type="number"
                      value={field.defaultValue || 0}
                      onChange={(e) => updateField(field.id, { defaultValue: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <Input
                      id={`default-${field.id}`}
                      value={field.defaultValue || ""}
                      onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                    />
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(field.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {fields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No scoring fields yet. Add some fields to customize how this game is scored.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};