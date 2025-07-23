export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      channels: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_private: boolean
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      game_nights: {
        Row: {
          attendees: string[] | null
          created_at: string
          date: string
          games: string[] | null
          id: string
          location: string | null
          notes: string | null
          status: string
          time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string
          date: string
          games?: string[] | null
          id?: string
          location?: string | null
          notes?: string | null
          status?: string
          time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string
          date?: string
          games?: string[] | null
          id?: string
          location?: string | null
          notes?: string | null
          status?: string
          time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          additional_mechanic_1: string | null
          additional_mechanic_2: string | null
          base_game_bgg_id: number | null
          bgg_id: number
          categories: string[] | null
          complexity: number | null
          core_mechanic: string | null
          created_at: string
          custom_title: string | null
          description: string | null
          designers: string[] | null
          expands_games: number[] | null
          id: string
          image_url: string | null
          is_expansion: boolean | null
          max_players: number | null
          mechanics: string[] | null
          min_age: number | null
          min_players: number | null
          name: string
          playing_time: number | null
          publishers: string[] | null
          rating: number | null
          thumbnail_url: string | null
          updated_at: string
          year_published: number | null
        }
        Insert: {
          additional_mechanic_1?: string | null
          additional_mechanic_2?: string | null
          base_game_bgg_id?: number | null
          bgg_id: number
          categories?: string[] | null
          complexity?: number | null
          core_mechanic?: string | null
          created_at?: string
          custom_title?: string | null
          description?: string | null
          designers?: string[] | null
          expands_games?: number[] | null
          id?: string
          image_url?: string | null
          is_expansion?: boolean | null
          max_players?: number | null
          mechanics?: string[] | null
          min_age?: number | null
          min_players?: number | null
          name: string
          playing_time?: number | null
          publishers?: string[] | null
          rating?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          year_published?: number | null
        }
        Update: {
          additional_mechanic_1?: string | null
          additional_mechanic_2?: string | null
          base_game_bgg_id?: number | null
          bgg_id?: number
          categories?: string[] | null
          complexity?: number | null
          core_mechanic?: string | null
          created_at?: string
          custom_title?: string | null
          description?: string | null
          designers?: string[] | null
          expands_games?: number[] | null
          id?: string
          image_url?: string | null
          is_expansion?: boolean | null
          max_players?: number | null
          mechanics?: string[] | null
          min_age?: number | null
          min_players?: number | null
          name?: string
          playing_time?: number | null
          publishers?: string[] | null
          rating?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          year_published?: number | null
        }
        Relationships: []
      }
      gaming_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaming_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "gaming_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gaming_group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      gaming_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_private: boolean
          max_members: number | null
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          max_members?: number | null
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          max_members?: number | null
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaming_groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          id: string
          message_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          id?: string
          message_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability: string | null
          avatar_url: string | null
          bgg_username: string | null
          bio: string | null
          created_at: string
          discord_handle: string | null
          display_name: string
          favorite_games: string[] | null
          favorite_mechanics: string[] | null
          gaming_experience: string | null
          gaming_style: string | null
          id: string
          library_public: boolean | null
          location: string | null
          preferred_player_count: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          avatar_url?: string | null
          bgg_username?: string | null
          bio?: string | null
          created_at?: string
          discord_handle?: string | null
          display_name: string
          favorite_games?: string[] | null
          favorite_mechanics?: string[] | null
          gaming_experience?: string | null
          gaming_style?: string | null
          id?: string
          library_public?: boolean | null
          location?: string | null
          preferred_player_count?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          avatar_url?: string | null
          bgg_username?: string | null
          bio?: string | null
          created_at?: string
          discord_handle?: string | null
          display_name?: string
          favorite_games?: string[] | null
          favorite_mechanics?: string[] | null
          gaming_experience?: string | null
          gaming_style?: string | null
          id?: string
          library_public?: boolean | null
          location?: string | null
          preferred_player_count?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_games: {
        Row: {
          created_at: string
          date_added: string
          game_id: string
          id: string
          is_owned: boolean | null
          is_wishlist: boolean | null
          notes: string | null
          personal_rating: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_added?: string
          game_id: string
          id?: string
          is_owned?: boolean | null
          is_wishlist?: boolean | null
          notes?: string | null
          personal_rating?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_added?: string
          game_id?: string
          id?: string
          is_owned?: boolean | null
          is_wishlist?: boolean | null
          notes?: string | null
          personal_rating?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_games_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          preference_key: string
          preference_value: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preference_key: string
          preference_value: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preference_key?: string
          preference_value?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
