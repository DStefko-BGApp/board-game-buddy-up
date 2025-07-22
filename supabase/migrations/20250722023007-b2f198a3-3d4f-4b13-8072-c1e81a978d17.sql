-- Add new profile fields
ALTER TABLE public.profiles ADD COLUMN location TEXT;
ALTER TABLE public.profiles ADD COLUMN favorite_games TEXT[];
ALTER TABLE public.profiles ADD COLUMN favorite_mechanic TEXT;
ALTER TABLE public.profiles ADD COLUMN gaming_experience TEXT CHECK (gaming_experience IN ('beginner', 'intermediate', 'expert'));
ALTER TABLE public.profiles ADD COLUMN preferred_player_count TEXT;
ALTER TABLE public.profiles ADD COLUMN gaming_style TEXT CHECK (gaming_style IN ('casual', 'competitive', 'teaching-friendly', 'mixed'));
ALTER TABLE public.profiles ADD COLUMN availability TEXT;
ALTER TABLE public.profiles ADD COLUMN bgg_username TEXT;
ALTER TABLE public.profiles ADD COLUMN discord_handle TEXT;
ALTER TABLE public.profiles ADD COLUMN library_public BOOLEAN DEFAULT false;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);