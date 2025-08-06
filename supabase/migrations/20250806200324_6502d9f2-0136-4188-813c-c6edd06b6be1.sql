ALTER TABLE public.group_invitations 
DROP CONSTRAINT IF EXISTS group_invitations_invited_by_user_id_fkey;

ALTER TABLE public.group_invitations 
ADD CONSTRAINT group_invitations_invited_by_user_id_fkey 
FOREIGN KEY (invited_by_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;