
-- These are the SQL functions needed for the chat functionality

-- Function to count unread messages for admins
CREATE OR REPLACE FUNCTION public.count_unread_admin_messages()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM chat_messages
    WHERE admin_id IS NULL
    AND is_read = false
  );
END;
$$;

-- Function to count unread messages for a specific user
CREATE OR REPLACE FUNCTION public.count_unread_user_messages(user_id UUID)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM chat_messages
    WHERE user_id = $1
    AND admin_id IS NOT NULL
    AND is_read = false
  );
END;
$$;

-- Function to get users with messages for admin dashboard
CREATE OR REPLACE FUNCTION public.get_users_with_messages()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
  unread_count BIGINT,
  last_message TEXT,
  last_activity TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH message_stats AS (
    SELECT
      p.id,
      p.full_name,
      p.username,
      p.avatar_url,
      COUNT(CASE WHEN cm.is_read = false AND cm.admin_id IS NULL THEN 1 END) as unread_count,
      (SELECT message FROM chat_messages 
       WHERE (user_id = p.id OR admin_id = p.id)
       ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM chat_messages 
       WHERE (user_id = p.id OR admin_id = p.id)
       ORDER BY created_at DESC LIMIT 1) as last_activity
    FROM profiles p
    JOIN chat_messages cm ON cm.user_id = p.id OR cm.admin_id = p.id
    GROUP BY p.id, p.full_name, p.username, p.avatar_url
  )
  SELECT * FROM message_stats
  ORDER BY last_activity DESC;
END;
$$;

-- Function to get chat messages between user and admins
CREATE OR REPLACE FUNCTION public.get_chat_messages_with_user(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  admin_id UUID,
  message TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.user_id,
    cm.admin_id,
    cm.message,
    cm.is_read,
    cm.created_at,
    cm.updated_at
  FROM chat_messages cm
  WHERE cm.user_id = user_id_param 
     OR cm.admin_id = user_id_param
  ORDER BY cm.created_at ASC;
END;
$$;

-- Function to get messages for a specific user
CREATE OR REPLACE FUNCTION public.get_user_messages(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  admin_id UUID,
  message TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.user_id,
    cm.admin_id,
    cm.message,
    cm.is_read,
    cm.created_at,
    cm.updated_at
  FROM chat_messages cm
  WHERE cm.user_id = user_id_param 
     OR cm.admin_id = user_id_param
  ORDER BY cm.created_at ASC;
END;
$$;

-- Function to mark messages as read by admin
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(message_ids UUID[], admin_id_param UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE chat_messages
  SET is_read = true,
      admin_id = admin_id_param,
      updated_at = now()
  WHERE id = ANY(message_ids);
END;
$$;

-- Function to mark messages as read by user
CREATE OR REPLACE FUNCTION public.mark_user_messages_as_read(message_ids UUID[])
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE chat_messages
  SET is_read = true,
      updated_at = now()
  WHERE id = ANY(message_ids);
END;
$$;

-- Function for admin to send message to user
CREATE OR REPLACE FUNCTION public.send_admin_message(to_user_id UUID, message_text TEXT, from_admin_id UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_message_id UUID;
BEGIN
  INSERT INTO chat_messages (user_id, admin_id, message, is_read)
  VALUES (from_admin_id, to_user_id, message_text, false)
  RETURNING id INTO new_message_id;
  
  RETURN new_message_id;
END;
$$;

-- Function for user to send message
CREATE OR REPLACE FUNCTION public.send_user_message(message_text TEXT, from_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_message_id UUID;
BEGIN
  INSERT INTO chat_messages (user_id, message, is_read)
  VALUES (from_user_id, message_text, false)
  RETURNING id INTO new_message_id;
  
  RETURN new_message_id;
END;
$$;
