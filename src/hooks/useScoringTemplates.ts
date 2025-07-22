import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ScoringField {
  id: string;
  name: string;
  type: 'number' | 'text';
  defaultValue?: number | string;
  required?: boolean;
}

export interface ScoringTemplate {
  id: string;
  game_id: string;
  game_name: string;
  scoring_fields: ScoringField[];
}

export const useScoringTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ScoringTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_scoring_templates')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      const transformedTemplates = data?.map(template => ({
        ...template,
        scoring_fields: (template.scoring_fields as unknown) as ScoringField[]
      })) || [];
      setTemplates(transformedTemplates);
    } catch (error) {
      console.error('Error fetching scoring templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateForGame = async (gameId: string, gameName: string): Promise<ScoringTemplate | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('game_scoring_templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_id', gameId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        return {
          ...data,
          scoring_fields: (data.scoring_fields as unknown) as ScoringField[]
        };
      }

      // Create default template if none exists
      const defaultFields: ScoringField[] = [
        { id: 'total', name: 'Total Score', type: 'number', required: true }
      ];

      return createTemplate(gameId, gameName, defaultFields);
    } catch (error) {
      console.error('Error getting template for game:', error);
      return null;
    }
  };

  const createTemplate = async (gameId: string, gameName: string, fields: ScoringField[]): Promise<ScoringTemplate> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('game_scoring_templates')
      .insert({
        user_id: user.id,
        game_id: gameId,
        game_name: gameName,
        scoring_fields: fields as any
      })
      .select()
      .single();

    if (error) throw error;
    
    await fetchTemplates();
    return {
      ...data,
      scoring_fields: (data.scoring_fields as unknown) as ScoringField[]
    };
  };

  const updateTemplate = async (templateId: string, fields: ScoringField[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('game_scoring_templates')
        .update({ scoring_fields: fields as any })
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchTemplates();
      toast({
        title: "Success",
        description: "Scoring template updated successfully"
      });
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update scoring template",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates,
    loading,
    fetchTemplates,
    getTemplateForGame,
    createTemplate,
    updateTemplate
  };
};