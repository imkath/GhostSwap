-- Anonymous Q&A between giver and receiver
-- The giver can ask questions to their receiver without revealing identity
-- The receiver can reply without knowing who is asking

CREATE TABLE anonymous_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('giver', 'receiver')),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_anon_messages_match_id ON anonymous_messages(match_id);

-- RLS
ALTER TABLE anonymous_messages ENABLE ROW LEVEL SECURITY;

-- Both giver and receiver of the match can view messages
CREATE POLICY "Match participants can view messages" ON anonymous_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = anonymous_messages.match_id
      AND (matches.giver_id = auth.uid() OR matches.receiver_id = auth.uid())
    )
  );

-- Giver can insert messages with sender_role = 'giver'
CREATE POLICY "Giver can send messages" ON anonymous_messages
  FOR INSERT WITH CHECK (
    (sender_role = 'giver' AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = anonymous_messages.match_id
      AND matches.giver_id = auth.uid()
    ))
    OR
    (sender_role = 'receiver' AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = anonymous_messages.match_id
      AND matches.receiver_id = auth.uid()
    ))
  );

-- NOTE: The receiver sees messages on their match where they are receiver_id.
-- But the receiver doesn't know who the giver is — that's the magic.
-- We need a way for the receiver to SEE messages on matches where they are the receiver.
-- The current matches RLS only lets users see matches where they are the GIVER.
-- So we need a function to get messages for a receiver without exposing the giver.

-- Function: get anonymous messages for a receiver (without exposing giver identity)
CREATE OR REPLACE FUNCTION get_receiver_messages(p_group_id UUID)
RETURNS TABLE (
  message_id UUID,
  match_id UUID,
  sender_role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    am.id AS message_id,
    am.match_id,
    am.sender_role,
    am.content,
    am.created_at
  FROM anonymous_messages am
  JOIN matches m ON m.id = am.match_id
  WHERE m.group_id = p_group_id
  AND m.receiver_id = auth.uid()
  ORDER BY am.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get the match_id where the current user is the receiver (without exposing giver)
CREATE OR REPLACE FUNCTION get_receiver_match_id(p_group_id UUID)
RETURNS UUID AS $$
DECLARE
  v_match_id UUID;
BEGIN
  SELECT id INTO v_match_id
  FROM matches
  WHERE group_id = p_group_id
  AND receiver_id = auth.uid()
  LIMIT 1;

  RETURN v_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
