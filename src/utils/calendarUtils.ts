// Utility functions for calendar integration

interface GameNightEvent {
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: string[];
  games: string[];
}

export const generateICalFile = (event: GameNightEvent) => {
  const startDateTime = new Date(`${event.date}T${event.time}`);
  const endDateTime = new Date(startDateTime.getTime() + 3 * 60 * 60 * 1000); // Default 3 hours

  const formatICalDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const description = `Games: ${event.games.join(', ')}\\nAttendees: ${event.attendees.join(', ')}`;

  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Game Night Planner//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatICalDate(startDateTime)}`,
    `DTEND:${formatICalDate(endDateTime)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${event.location}`,
    `UID:gamenight-${Date.now()}@gamenightplanner.com`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateGoogleCalendarUrl = (event: GameNightEvent) => {
  const startDateTime = new Date(`${event.date}T${event.time}`);
  const endDateTime = new Date(startDateTime.getTime() + 3 * 60 * 60 * 1000); // Default 3 hours

  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const details = `Games: ${event.games.join(', ')}\nAttendees: ${event.attendees.join(', ')}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(startDateTime)}/${formatGoogleDate(endDateTime)}`,
    details: details,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};