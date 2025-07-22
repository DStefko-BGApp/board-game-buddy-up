import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin, Plus, Edit } from "lucide-react";

// Mock data for game nights
const mockGameNights = [
  {
    id: 1,
    title: "Weekly Strategy Night",
    date: "2024-01-20",
    time: "19:00",
    location: "Mike's Place",
    attendees: ["Mike", "Sarah", "Tom", "Lisa"],
    games: ["Wingspan", "Azul"],
    status: "upcoming",
  },
  {
    id: 2,
    title: "Family Game Day",
    date: "2024-01-25",
    time: "14:00",
    location: "Community Center",
    attendees: ["Alex", "Emma", "Jack"],
    games: ["Ticket to Ride", "Splendor"],
    status: "upcoming",
  },
  {
    id: 3,
    title: "Adventure Night",
    date: "2024-01-15",
    time: "18:30",
    location: "Gaming Cafe",
    attendees: ["David", "Rachel", "Chris", "Amy"],
    games: ["Gloomhaven"],
    status: "completed",
  },
];

const GameNights = () => {
  const [gameNights] = useState(mockGameNights);

  const upcomingEvents = gameNights.filter(event => event.status === "upcoming");
  const pastEvents = gameNights.filter(event => event.status === "completed");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-gaming-green text-white">Upcoming</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Game Nights</h1>
          <p className="text-muted-foreground">
            Plan and organize your gaming sessions with friends
          </p>
        </div>
        <Button 
          variant="gaming" 
          className="mt-4 md:mt-0"
          onClick={() => {
            // TODO: Implement create game night functionality
            console.log("Create Game Night clicked");
          }}
        >
          <Plus className="h-4 w-4" />
          Create Game Night
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                <p className="text-muted-foreground text-sm">Upcoming Events</p>
              </div>
              <div className="h-12 w-12 bg-gradient-gaming rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{pastEvents.length}</p>
                <p className="text-muted-foreground text-sm">Past Events</p>
              </div>
              <div className="h-12 w-12 bg-gradient-score rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-muted-foreground text-sm">Total Attendees</p>
              </div>
              <div className="h-12 w-12 bg-gaming-orange rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
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
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(event.status)}
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Attendees ({event.attendees.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {event.attendees.map((attendee, index) => (
                        <Badge key={index} variant="secondary">
                          {attendee}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Games to Play</p>
                    <div className="flex flex-wrap gap-2">
                      {event.games.map((game, index) => (
                        <Badge key={index} className="bg-primary/10 text-primary">
                          {game}
                        </Badge>
                      ))}
                    </div>
                  </div>
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
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(event.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Attendees ({event.attendees.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {event.attendees.map((attendee, index) => (
                        <Badge key={index} variant="secondary">
                          {attendee}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Games Played</p>
                    <div className="flex flex-wrap gap-2">
                      {event.games.map((game, index) => (
                        <Badge key={index} className="bg-primary/10 text-primary">
                          {game}
                        </Badge>
                      ))}
                    </div>
                  </div>
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