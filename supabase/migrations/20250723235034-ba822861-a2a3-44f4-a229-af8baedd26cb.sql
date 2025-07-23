-- Delete all data associated with Tester 2 user (user_id: c083fe8e-8067-490f-91e2-6adef114941f)

-- Delete user preferences
DELETE FROM public.user_preferences WHERE user_id = 'c083fe8e-8067-490f-91e2-6adef114941f';

-- Delete user games
DELETE FROM public.user_games WHERE user_id = 'c083fe8e-8067-490f-91e2-6adef114941f';

-- Delete friendships (both as requester and addressee)
DELETE FROM public.friendships WHERE requester_id = 'c083fe8e-8067-490f-91e2-6adef114941f' OR addressee_id = 'c083fe8e-8067-490f-91e2-6adef114941f';

-- Delete game nights
DELETE FROM public.game_nights WHERE user_id = 'c083fe8e-8067-490f-91e2-6adef114941f';

-- Delete activities
DELETE FROM public.activities WHERE user_id = 'c083fe8e-8067-490f-91e2-6adef114941f';

-- Delete gaming group memberships
DELETE FROM public.gaming_group_members WHERE user_id = 'c083fe8e-8067-490f-91e2-6adef114941f';

-- Delete gaming groups owned by this user
DELETE FROM public.gaming_groups WHERE owner_id = 'c083fe8e-8067-490f-91e2-6adef114941f';

-- Delete channel memberships
DELETE FROM public.channel_members WHERE user_id = 'c083fe8e-8067-490f-91e2-6adef114941f';

-- Delete channels owned by this user
DELETE FROM public.channels WHERE owner_id = 'c083fe8e-8067-490f-91e2-6adef114941f';

-- Delete messages
DELETE FROM public.messages WHERE user_id = 'c083fe8e-8067-490f-91e2-6adef114941f';

-- Delete the profile last
DELETE FROM public.profiles WHERE user_id = 'c083fe8e-8067-490f-91e2-6adef114941f';