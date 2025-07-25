import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { PlayReportWithDetails, CreatePlayReportData } from "@/types/playReports";

export const usePlayReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: playReports,
    isLoading,
    error
  } = useQuery({
    queryKey: ['play-reports', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('play_reports')
        .select(`
          *,
          game:games(id, name, thumbnail_url, custom_title),
          participants:play_report_participants(
            *,
            profile:profiles!play_report_participants_user_id_fkey(
              display_name,
              avatar_url
            )
          ),
          reporter_profile:profiles!play_reports_reporter_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .order('date_played', { ascending: false });

      if (error) throw error;
      return data as PlayReportWithDetails[];
    },
    enabled: !!user,
  });

  const createPlayReport = useMutation({
    mutationFn: async (data: CreatePlayReportData) => {
      if (!user) throw new Error('User not authenticated');

      // Verify authentication session before proceeding
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session check:', { session: session?.user?.id, sessionError, userFromContext: user.id });
      if (sessionError || !session) {
        throw new Error('Authentication session invalid');
      }

      // Ensure session is fresh and valid
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshedSession) {
        console.warn('Session refresh failed, using original session');
      }

      // Upload photos first if any
      let photoUrls: string[] = [];
      if (data.photos && data.photos.length > 0) {
        const uploadPromises = data.photos.map(async (photo, index) => {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('play-reports')
            .upload(fileName, photo);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('play-reports')
            .getPublicUrl(fileName);

          return publicUrl;
        });

        photoUrls = await Promise.all(uploadPromises);
      }

      // Create the play report with explicit session context
      const reportData = {
        game_id: data.game_id,
        reporter_id: session.user.id, // Use session.user.id instead of user.id
        title: data.title,
        summary: data.summary,
        date_played: data.date_played,
        location: data.location,
        notes: data.notes,
        duration_minutes: data.duration_minutes,
        photos: photoUrls
      };
      
      console.log('Creating play report with data:', reportData);
      console.log('Auth user from session:', session.user.id);
      console.log('Auth user from context:', user.id);
      
      // Try with explicit session setting
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });

      const { data: playReport, error: reportError } = await supabase
        .from('play_reports')
        .insert(reportData)
        .select()
        .single();

      if (reportError) throw reportError;

      // Add participants
      if (data.participants.length > 0) {
        const { error: participantError } = await supabase
          .from('play_report_participants')
          .insert(
            data.participants.map(participant => ({
              play_report_id: playReport.id,
              ...participant,
            }))
          );

        if (participantError) throw participantError;
      }

      return playReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['play-reports'] });
      toast({
        title: "Play report created",
        description: "Your game session has been recorded successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating play report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePlayReport = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PlayReportWithDetails> & { id: string }) => {
      const { error } = await supabase
        .from('play_reports')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['play-reports'] });
      toast({
        title: "Play report updated",
        description: "Your changes have been saved successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating play report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePlayReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('play_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['play-reports'] });
      toast({
        title: "Play report deleted",
        description: "The play report has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting play report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    playReports: playReports || [],
    isLoading,
    error,
    createPlayReport,
    updatePlayReport,
    deletePlayReport,
  };
};

export const usePlayerStats = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ['player-stats', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from('play_report_participants')
        .select(`
          score,
          placement,
          player_rating,
          play_report:play_reports(
            date_played,
            game:games(name, id)
          )
        `)
        .eq('user_id', targetUserId);

      if (error) throw error;

      // Calculate stats
      const totalGames = data.length;
      const averageRating = data
        .filter(p => p.player_rating)
        .reduce((sum, p) => sum + (p.player_rating || 0), 0) / 
        data.filter(p => p.player_rating).length || 0;

      const wins = data.filter(p => p.placement === 1).length;
      const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

      const gamesPlayed = data.reduce((acc, p) => {
        const gameName = p.play_report?.game?.name;
        if (gameName) {
          acc[gameName] = (acc[gameName] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const favoriteGame = Object.entries(gamesPlayed)
        .sort(([,a], [,b]) => b - a)[0]?.[0];

      return {
        totalGames,
        averageRating: Math.round(averageRating * 10) / 10,
        wins,
        winRate: Math.round(winRate * 10) / 10,
        favoriteGame,
        gamesPlayed,
      };
    },
    enabled: !!targetUserId,
  });
};