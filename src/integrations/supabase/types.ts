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
