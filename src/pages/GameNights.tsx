import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, MapPin, Plus, Edit, Download, ExternalLink, Globe, Lock, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { generateICalFile, generateGoogleCalendarUrl } from "@/utils/calendarUtils";
import { AttendeeLink } from "@/components/gamenight/AttendeeLink";
import { RsvpSection } from "@/components/gamenight/RsvpSection";

const GameNights = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gameNights, setGameNights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGameNight, setEditingGameNight] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    attendees: "",
    games: "",
    notes: "",
    is_public: false,
  });
  const [viewFilter, setViewFilter] = useState<'my' | 'public'>('my');

  // Load game nights from database
  useEffect(() => {
    if (user) {
      loadGameNights();
    }
  }, [user]);

  const loadGameNights = async () => {
    try {
      let query = supabase
        .from('game_nights')
        .select('*');

      // Filter based on view type
      if (viewFilter === 'my') {
        query = query.eq('user_id', user?.id);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) throw error;
      setGameNights(data || []);
    } catch (error) {
      console.error('Error loading game nights:', error);
      toast({
        title: "Error",
        description: "Failed to load game nights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  
  const upcomingEvents = gameNights
    .filter(event => event.date >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = gameNights
    .filter(event => event.date < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first

  // Reload when view filter changes
  useEffect(() => {
    if (user) {
      loadGameNights();
    }
  }, [viewFilter, user]);

  const getStatusBadge = (eventDate: string) => {
    const isUpcoming = eventDate >= today;
    return isUpcoming ? (
      <Badge className="bg-gradient-gaming text-white">Upcoming</Badge>
    ) : (
      <Badge variant="secondary">Past</Badge>
    );
  };

  const getPrivacyBadge = (isPublic: boolean) => {
    return isPublic ? (
      <Badge variant="outline" className="flex items-center gap-1">
        <Globe className="h-3 w-3" />
        Public
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Lock className="h-3 w-3" />
        Private
      </Badge>
    );
  };

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleCreateGameNight = async () => {
    if (!formData.title || !formData.date || !formData.time || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('game_nights')
        .insert([{
          user_id: user.id,
          title: formData.title,
          date: formData.date,
          time: formData.time,
          location: formData.location || "TBD",
          attendees: formData.attendees ? formData.attendees.split(",").map(a => a.trim()) : [],
          games: formData.games ? formData.games.split(",").map(g => g.trim()) : [],
          notes: formData.notes || "",
          status: "upcoming",
          is_public: formData.is_public,
        }])
        .select()
        .single();

      if (error) throw error;

      setGameNights([...gameNights, data]);
      setFormData({ title: "", date: "", time: "", location: "", attendees: "", games: "", notes: "", is_public: false });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Game night created successfully!",
      });
    } catch (error) {
      console.error('Error creating game night:', error);
      toast({
        title: "Error",
        description: "Failed to create game night",
        variant: "destructive",
      });
    }
  };

  const handleEditGameNight = (gameNight: any) => {
    setEditingGameNight(gameNight);
    setFormData({
      title: gameNight.title,
      date: gameNight.date,
      time: gameNight.time,
      location: gameNight.location,
      attendees: gameNight.attendees.join(", "),
      games: gameNight.games.join(", "),
      notes: gameNight.notes || "",
      is_public: gameNight.is_public || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateGameNight = async () => {
    if (!formData.title || !formData.date || !formData.time || !editingGameNight || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('game_nights')
        .update({
          title: formData.title,
          date: formData.date,
          time: formData.time,
          location: formData.location || "TBD",
          attendees: formData.attendees ? formData.attendees.split(",").map(a => a.trim()) : [],
          games: formData.games ? formData.games.split(",").map(g => g.trim()) : [],
          notes: formData.notes || "",
          is_public: formData.is_public,
        })
        .eq('id', editingGameNight.id)
        .select()
        .single();

      if (error) throw error;

      setGameNights(gameNights.map(gn => gn.id === editingGameNight.id ? data : gn));
      setFormData({ title: "", date: "", time: "", location: "", attendees: "", games: "", notes: "", is_public: false });
      setEditingGameNight(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Game night updated successfully!",
      });
    } catch (error) {
      console.error('Error updating game night:', error);
      toast({
        title: "Error",
        description: "Failed to update game night",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p>Loading game nights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-background min-h-screen">
      {/* Enhanced header with Friends page aesthetic */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-gaming opacity-10 rounded-2xl blur-3xl"></div>
        <div className="relative bg-card/90 backdrop-blur-sm border border-white/20 rounded-2xl p-8 cozy-section">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-gaming bg-clip-text text-transparent">Game Nights</h1>
              <p className="text-muted-foreground text-lg">
                Plan and organize your gaming sessions with friends
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gaming" className="mt-6 md:mt-0 hover-scale shadow-lg">
                  <Plus className="h-4 w-4" />
                  Create Game Night
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Game Night</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Weekly Strategy Night"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Mike's Place"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attendees">Invitees (comma-separated)</Label>
                    <Textarea
                      id="attendees"
                      value={formData.attendees}
                      onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                      placeholder="e.g., Mike, Sarah, Tom, Lisa"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="games">Games (comma-separated)</Label>
                    <Textarea
                      id="games"
                      value={formData.games}
                      onChange={(e) => setFormData({ ...formData, games: e.target.value })}
                      placeholder="e.g., Wingspan, Azul, Ticket to Ride"
                      rows={3}
                    />
                  </div>
                   <div className="space-y-2">
                     <Label htmlFor="notes">Notes</Label>
                     <Textarea
                       id="notes"
                       value={formData.notes}
                       onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                       placeholder="Additional details, rules to remember, snacks to bring, etc."
                       rows={3}
                     />
                   </div>
                   <div className="flex items-center space-x-2 pt-2">
                     <Switch
                       id="is_public"
                       checked={formData.is_public}
                       onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                     />
                     <Label htmlFor="is_public" className="text-sm">
                       Make this event public (discoverable by all users)
                     </Label>
                   </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setFormData({ title: "", date: "", time: "", location: "", attendees: "", games: "", notes: "", is_public: false });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="gaming"
                      onClick={handleCreateGameNight}
                      disabled={!formData.title || !formData.date || !formData.time}
                    >
                      Create Game Night
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Game Night Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Game Night</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Weekly Strategy Night"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-date">Date *</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-time">Time *</Label>
                      <Input
                        id="edit-time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Mike's Place"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-attendees">Invitees (comma-separated)</Label>
                    <Textarea
                      id="edit-attendees"
                      value={formData.attendees}
                      onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                      placeholder="e.g., Mike, Sarah, Tom, Lisa"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-games">Games (comma-separated)</Label>
                    <Textarea
                      id="edit-games"
                      value={formData.games}
                      onChange={(e) => setFormData({ ...formData, games: e.target.value })}
                      placeholder="e.g., Wingspan, Azul, Ticket to Ride"
                      rows={3}
                    />
                  </div>
                   <div className="space-y-2">
                     <Label htmlFor="edit-notes">Notes</Label>
                     <Textarea
                       id="edit-notes"
                       value={formData.notes}
                       onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                       placeholder="Additional details, rules to remember, snacks to bring, etc."
                       rows={3}
                     />
                   </div>
                   <div className="flex items-center space-x-2 pt-2">
                     <Switch
                       id="edit_is_public"
                       checked={formData.is_public}
                       onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                     />
                     <Label htmlFor="edit_is_public" className="text-sm">
                       Make this event public (discoverable by all users)
                     </Label>
                   </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditDialogOpen(false);
                        setEditingGameNight(null);
                        setFormData({ title: "", date: "", time: "", location: "", attendees: "", games: "", notes: "", is_public: false });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="gaming"
                      onClick={handleUpdateGameNight}
                      disabled={!formData.title || !formData.date || !formData.time}
                    >
                      Update Game Night
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* View Filter */}
      <div className="mb-6">
        <Tabs value={viewFilter} onValueChange={(value: 'my' | 'public') => setViewFilter(value)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              My Events
            </TabsTrigger>
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Public Events
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats with enhanced styling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="group hover:shadow-gaming transition-all duration-300 hover:-translate-y-1 section-background border-white/10">
          <CardContent className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-gaming opacity-10 rounded-full -translate-y-10 translate-x-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{upcomingEvents.length}</p>
                <p className="text-foreground/70 text-sm font-medium">Upcoming Events</p>
              </div>
              <div className="h-14 w-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-gaming transition-all duration-300 hover:-translate-y-1 section-background border-white/10">
          <CardContent className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-score opacity-10 rounded-full -translate-y-10 translate-x-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-gaming-green to-gaming-green/70 bg-clip-text text-transparent">{pastEvents.length}</p>
                <p className="text-muted-foreground text-sm font-medium">Past Events</p>
              </div>
              <div className="h-14 w-14 bg-gradient-score rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-gaming transition-all duration-300 hover:-translate-y-1 section-background border-white/10">
          <CardContent className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gaming-red/20 rounded-full -translate-y-10 translate-x-10 group-hover:opacity-30 transition-opacity"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-gaming-red to-gaming-slate bg-clip-text text-transparent">
                  {viewFilter === 'public' ? gameNights.length : gameNights.filter(event => event.is_public).length}
                </p>
                <p className="text-foreground/70 text-sm font-medium">Public Events Near Me</p>
              </div>
              <div className="h-14 w-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <MapPin className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Game Nights */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-gaming transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(event.time)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                   <div className="flex items-center gap-2">
                     {getStatusBadge(event.date)}
                     {getPrivacyBadge(event.is_public)}
                     {viewFilter === 'public' && event.profiles && (
                       <Badge variant="outline" className="flex items-center gap-1">
                         <Users className="h-3 w-3" />
                         by {event.profiles.display_name}
                       </Badge>
                     )}
                     <Button
                      variant="ghost" 
                      size="icon"
                      onClick={() => generateICalFile(event)}
                      title="Download iCal"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => window.open(generateGoogleCalendarUrl(event), '_blank')}
                      title="Add to Google Calendar"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditGameNight(event)}
                      title="Edit Game Night"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Invitees ({event.attendees.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {event.attendees.map((attendee) => (
                        <AttendeeLink 
                          key={`${event.id}-attendee-${attendee}`}
                          attendeeName={attendee}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* RSVP Section */}
                  <RsvpSection gameNightId={event.id} />
                  <div>
                    <p className="text-sm font-medium mb-2">Games to Play</p>
                    <div className="flex flex-wrap gap-2">
                      {event.games.map((game) => (
                        <Badge key={`${event.id}-game-${game}`} className="bg-primary/10 text-primary">
                          {game}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {event.notes && (
                    <div>
                      <p className="text-sm font-medium mb-2">Notes</p>
                      <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                        {event.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Past Game Nights */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Past Events</h2>
        <div className="space-y-4">
          {pastEvents.map((event) => (
            <Card key={event.id} className="opacity-75">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(event.time)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    </div>
                   </div>
                   <div className="flex items-center gap-2">
                     {getStatusBadge(event.date)}
                     {getPrivacyBadge(event.is_public)}
                     {viewFilter === 'public' && event.profiles && (
                       <Badge variant="outline" className="flex items-center gap-1">
                         <Users className="h-3 w-3" />
                         by {event.profiles.display_name}
                       </Badge>
                     )}
                   </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Invitees ({event.attendees.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {event.attendees.map((attendee) => (
                        <AttendeeLink 
                          key={`${event.id}-past-attendee-${attendee}`}
                          attendeeName={attendee}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Games Played</p>
                    <div className="flex flex-wrap gap-2">
                      {event.games.map((game) => (
                        <Badge key={`${event.id}-past-game-${game}`} className="bg-primary/10 text-primary">
                          {game}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {event.notes && (
                    <div>
                      <p className="text-sm font-medium mb-2">Notes</p>
                      <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                        {event.notes}
                      </p>
                    </div>
                  )} 
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameNights;