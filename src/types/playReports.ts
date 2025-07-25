export interface PlayReport {
  id: string;
  game_id: string;
  reporter_id: string;
  title: string;
  summary?: string;
  date_played: string;
  duration_minutes?: number;
  location?: string;
  notes?: string;
  photos?: string[];
  created_at: string;
  updated_at: string;
}

export interface PlayReportParticipant {
  id: string;
  play_report_id: string;
  user_id: string;
  score?: number;
  placement?: number;
  player_rating?: number;
  player_notes?: string;
  created_at: string;
}

export interface PlayReportWithDetails extends PlayReport {
  game: {
    id: string;
    name: string;
    thumbnail_url?: string;
    custom_title?: string;
  };
  participants: (PlayReportParticipant & {
    profile: {
      display_name: string;
      avatar_url?: string;
    };
  })[];
  reporter_profile: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface CreatePlayReportData {
  game_id: string;
  title: string;
  summary?: string;
  date_played: string;
  duration_minutes?: number;
  location?: string;
  notes?: string;
  participants: {
    user_id: string;
    score?: number;
    placement?: number;
    player_rating?: number;
    player_notes?: string;
  }[];
  photos?: File[];
}