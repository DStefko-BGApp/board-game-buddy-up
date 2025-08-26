import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { decodeHtmlEntities } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { usePlayReports } from "@/hooks/usePlayReports";
import { useFriends } from "@/hooks/useFriends";
import { UserAvatar } from "@/components/common/UserAvatar";
import type { PlayReportWithDetails } from "@/types/playReports";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().optional(),
  date_played: z.date({
    required_error: "Date is required",
  }),
  location: z.string().optional(),
  notes: z.string().optional(),
  duration_minutes: z.number().optional(),
  participants: z.array(z.object({
    user_id: z.string(),
    score: z.number().optional(),
    placement: z.number().optional(),
    player_rating: z.number().min(1).max(10).optional(),
    player_notes: z.string().optional(),
  })).min(1, "At least one participant is required"),
});

type FormData = z.infer<typeof formSchema>;

interface EditPlayReportDialogProps {
  playReport: PlayReportWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPlayReportDialog({ playReport, open, onOpenChange }: EditPlayReportDialogProps) {
  const { updatePlayReport } = usePlayReports();
  const { friends } = useFriends();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      summary: "",
      date_played: new Date(),
      location: "",
      notes: "",
      duration_minutes: undefined,
      participants: [],
    },
  });

  // Reset form when playReport changes
  useEffect(() => {
    if (playReport) {
      form.reset({
        title: playReport.title,
        summary: playReport.summary || "",
        date_played: new Date(playReport.date_played),
        location: playReport.location || "",
        notes: playReport.notes || "",
        duration_minutes: playReport.duration_minutes || undefined,
        participants: playReport.participants.map(p => ({
          user_id: p.user_id,
          score: p.score ?? undefined,
          placement: p.placement ?? undefined,
          player_rating: p.player_rating ?? undefined,
          player_notes: p.player_notes ?? undefined,
        })),
      });
    }
  }, [playReport, form]);

  const onSubmit = async (data: FormData) => {
    if (!playReport) return;
    
    setIsSubmitting(true);
    try {
      await updatePlayReport.mutateAsync({
        id: playReport.id,
        title: data.title,
        summary: data.summary,
        date_played: format(data.date_played, 'yyyy-MM-dd'),
        location: data.location,
        notes: data.notes,
        duration_minutes: data.duration_minutes,
        participants: data.participants.filter(p => p.user_id) as { 
          user_id: string; 
          score?: number; 
          placement?: number; 
          player_rating?: number; 
          player_notes?: string; 
        }[], // Filter out any invalid participants
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update play report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addParticipant = (userId: string) => {
    const currentParticipants = form.getValues("participants");
    if (!currentParticipants.find(p => p.user_id === userId)) {
      form.setValue("participants", [...currentParticipants, { user_id: userId }]);
    }
  };

  const removeParticipant = (userId: string) => {
    const currentParticipants = form.getValues("participants");
    form.setValue("participants", currentParticipants.filter(p => p.user_id !== userId));
  };

  const participants = form.watch("participants");
  const availableFriends = friends.filter(friend => 
    !participants.find(p => p.user_id === friend.id)
  );

  if (!playReport) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Play Report</DialogTitle>
          <DialogDescription>
            Update the details of your play report for {decodeHtmlEntities(playReport.game.custom_title || playReport.game.name)}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter a title for this session" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Brief summary of the game session" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date_played"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date Played</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="120"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Where did you play?" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Participants */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Players</h3>
                {availableFriends.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Player
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">Add Friend</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {availableFriends.map((friend) => (
                            <div
                              key={friend.id}
                              className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                              onClick={() => addParticipant(friend.id)}
                            >
                              <div className="flex items-center gap-2">
                                <UserAvatar
                                  displayName={friend.display_name}
                                  avatarUrl={friend.avatar_url}
                                  size="sm"
                                />
                                <span className="text-sm">{friend.display_name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-3">
                {participants.map((participant, index) => {
                  const profile = friends.find(f => f.id === participant.user_id) || 
                    playReport.participants.find(p => p.user_id === participant.user_id)?.profile;
                  
                  if (!profile) return null;

                  return (
                    <div key={participant.user_id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            displayName={profile.display_name}
                            avatarUrl={profile.avatar_url}
                            size="sm"
                          />
                          <span className="font-medium">{profile.display_name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipant(participant.user_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`participants.${index}.score`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Score</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  placeholder="0"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`participants.${index}.placement`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Placement</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  placeholder="1"
                                  min="1"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`participants.${index}.player_rating`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating (1-10)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="7"
                                min="1"
                                max="10"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`participants.${index}.player_notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Player Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Notes about this player's experience" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Any additional notes about the session" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Report"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}