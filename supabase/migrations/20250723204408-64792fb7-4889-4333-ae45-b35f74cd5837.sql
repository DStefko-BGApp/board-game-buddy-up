-- Update RLS policy to allow friends to view public libraries
DROP POLICY "Users can view their own games" ON user_games;

CREATE POLICY "Users can view their own games and friends' public libraries" 
ON user_games 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  (
    -- Allow friends to view if library is public
    user_id IN (
      SELECT p.user_id 
      FROM profiles p 
      WHERE p.library_public = true 
      AND p.user_id IN (
        -- Check if current user is friends with the library owner
        SELECT 
          CASE 
            WHEN friendships.requester_id = user_games.user_id THEN friendships.addressee_id
            ELSE friendships.requester_id
          END
        FROM friendships 
        WHERE friendships.status = 'accepted'
        AND (
          (friendships.requester_id = user_games.user_id AND friendships.addressee_id = auth.uid())
          OR 
          (friendships.addressee_id = user_games.user_id AND friendships.requester_id = auth.uid())
        )
      )
    )
  )
);