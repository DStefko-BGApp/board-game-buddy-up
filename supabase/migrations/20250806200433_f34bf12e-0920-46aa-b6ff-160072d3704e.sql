-- Check if the foreign key constraint actually exists
DO $$
BEGIN
    -- Try to drop the constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'group_invitations_invited_by_user_id_fkey'
        AND table_name = 'group_invitations'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.group_invitations 
        DROP CONSTRAINT group_invitations_invited_by_user_id_fkey;
        RAISE NOTICE 'Dropped existing constraint';
    ELSE
        RAISE NOTICE 'No existing constraint found';
    END IF;
END $$;

-- Now create the foreign key constraint
ALTER TABLE public.group_invitations 
ADD CONSTRAINT group_invitations_invited_by_user_id_fkey 
FOREIGN KEY (invited_by_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Also create the constraint for invited_user_id to be complete
ALTER TABLE public.group_invitations 
DROP CONSTRAINT IF EXISTS group_invitations_invited_user_id_fkey;

ALTER TABLE public.group_invitations 
ADD CONSTRAINT group_invitations_invited_user_id_fkey 
FOREIGN KEY (invited_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;