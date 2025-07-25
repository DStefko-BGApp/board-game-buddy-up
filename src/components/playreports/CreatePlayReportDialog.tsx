import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, Trash2, Camera } from "lucide-react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useGroupedLibrary } from "@/hooks/useBGGLibrary";
import { useFriends } from "@/hooks/useFriends";
import { usePlayReports } from "@/hooks/usePlayReports";
import { useAuth } from "@/contexts/AuthContext";

const createPlayReportSchema = z.object({
  game_id: z.string().min(1, "Please select a game"),
  title: z.string().min(1, "Title is required"),
  summary: z.string().optional(),
  date_played: z.date(),
  duration_minutes: z.number().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  participants: z.array(z.object({
    user_id: z.string(),
    score: z.number().optional(),
    placement: z.number().optional(),
    player_rating: z.number().min(1).max(10).optional(),
    player_notes: z.string().optional(),
  })),
});

type CreatePlayReportForm = z.infer<typeof createPlayReportSchema>;

interface CreatePlayReportDialogProps {
  children: React.ReactNode;
}

export function CreatePlayReportDialog({ children }: CreatePlayReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const { user } = useAuth();
  const { data: library } = useGroupedLibrary();
  const { friends } = useFriends();
  const { createPlayReport } = usePlayReports();

  const form = useForm<CreatePlayReportForm>({
    resolver: zodResolver(createPlayReportSchema),
    defaultValues: {
      title: "",
      date_played: new Date(),
      participants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const availableUsers = friends?.map(friend => ({
    id: friend.user_id,
    name: friend.display_name,
    avatar_url: friend.avatar_url,
  })) || [];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreatePlayReportForm) => {
    try {
      await createPlayReport.mutateAsync({
        game_id: data.game_id,
        title: data.title,
        summary: data.summary,
        date_played: data.date_played.toISOString().split('T')[0],
        duration_minutes: data.duration_minutes,
        location: data.location,
        notes: data.notes,
        participants: data.participants.filter(p => p.user_id) as { user_id: string; score?: number; placement?: number; player_rating?: number; player_notes?: string; }[],
        photos: photos.length > 0 ? photos : undefined,
      });
      setOpen(false);
      form.reset();
      setPhotos([]);
    } catch (error) {
      console.error('Error creating play report:', error);
    }
  };

  const addParticipant = (userId: string) => {
    if (!fields.find(f => f.user_id === userId)) {
      append({ user_id: userId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Play Report</DialogTitle>
          <DialogDescription>
            Record details about your game session and share scores with all participants.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="game_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a game" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {library?.map((group) => (
                          <SelectItem key={group.baseGame.game.id} value={group.baseGame.game.id}>
                            {group.baseGame.game.custom_title || group.baseGame.game.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Epic game night!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                            className="w-full pl-3 text-left font-normal"
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
                        placeholder="90" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Game store, home, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="How did the game go? Any memorable moments?"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Participants</FormLabel>
                <Select onValueChange={addParticipant}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Add friend" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((friend) => (
                      <SelectItem key={friend.id} value={friend.id}>
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            displayName={friend.name}
                            avatarUrl={friend.avatar_url}
                            size="sm"
                          />
                          {friend.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {fields.map((field, index) => {
                const participant = availableUsers.find(u => u.id === field.user_id);
                return (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          displayName={participant?.name || 'Unknown'}
                          avatarUrl={participant?.avatar_url}
                          size="sm"
                        />
                        <span className="font-medium">{participant?.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`participants.${index}.score`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Score</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
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
                                placeholder="1"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`participants.${index}.player_rating`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating (1-10)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="8"
                                min="1"
                                max="10"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`participants.${index}.player_notes`}
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any notes about this player's performance..."
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </Card>
                );
              })}
            </div>

            <div className="space-y-4">
              <FormLabel>Photos</FormLabel>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photos
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
              
              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="House rules, funny moments, anything else..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPlayReport.isPending}>
                {createPlayReport.isPending ? 'Creating...' : 'Create Play Report'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}