-- Drop the current policy and create a simpler, more reliable one
DROP POLICY "Users can view their own games and friends' public libraries" ON user_games;

CREATE POLICY "Users can view their own games and friends' public libraries" 
ON user_games 
FOR SELECT 
USING (
  -- Users can always see their own games
  auth.uid() = user_id 
  OR 
  -- Users can see friends' games if the friend's library is public
  (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = user_games.user_id 
      AND profiles.library_public = true
    )
    AND
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE friendships.status = 'accepted'
      AND (
        (friendships.requester_id = auth.uid() AND friendships.addressee_id = user_games.user_id)
        OR 
        (friendships.addressee_id = auth.uid() AND friendships.requester_id = user_games.user_id)
      )
    )
  )
);