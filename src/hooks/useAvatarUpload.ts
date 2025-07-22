import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAvatarUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      setUploading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Delete existing avatar if it exists
      await supabase.storage
        .from('avatars')
        .remove([`${userId}/avatar.jpg`, `${userId}/avatar.jpeg`, `${userId}/avatar.png`, `${userId}/avatar.webp`]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async (userId: string) => {
    try {
      await supabase.storage
        .from('avatars')
        .remove([`${userId}/avatar.jpg`, `${userId}/avatar.jpeg`, `${userId}/avatar.png`, `${userId}/avatar.webp`]);
    } catch (error) {
      console.error('Error deleting avatar:', error);
    }
  };

  return {
    uploadAvatar,
    deleteAvatar,
    uploading
  };
};