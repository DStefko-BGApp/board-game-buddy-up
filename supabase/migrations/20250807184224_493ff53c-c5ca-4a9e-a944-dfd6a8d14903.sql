-- Add some debugging to help identify the group invitation issue

-- First, let's check if there might be timing issues with the trigger
-- Let's add a function to safely check admin status with better error handling
CREATE OR REPLACE FUNCTION public.check_user_admin_status(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Check if user is admin in the specified group
  RETURN EXISTS (
    SELECT 1 
    FROM public.gaming_group_members 
    WHERE group_id = p_group_id 
    AND user_id = p_user_id 
    AND role = 'admin'
  );
END;
$$;

-- Let's also add a function to debug group invitation issues
CREATE OR REPLACE FUNCTION public.debug_group_invitation(p_group_id UUID, p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user_exists', EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id),
    'group_exists', EXISTS(SELECT 1 FROM public.gaming_groups WHERE id = p_group_id),
    'user_is_member', EXISTS(SELECT 1 FROM public.gaming_group_members WHERE group_id = p_group_id AND user_id = auth.uid()),
    'user_is_admin', public.check_user_admin_status(p_group_id, auth.uid()),
    'current_user_id', auth.uid(),
    'group_member_count', (SELECT COUNT(*) FROM public.gaming_group_members WHERE group_id = p_group_id),
    'group_details', (SELECT json_build_object('name', name, 'created_by', created_by, 'is_private', is_private) FROM public.gaming_groups WHERE id = p_group_id)
  ) INTO result;
  
  RETURN result;
END;
$$;