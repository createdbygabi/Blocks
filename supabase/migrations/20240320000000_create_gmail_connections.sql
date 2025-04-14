-- Create gmail_connections table
CREATE TABLE IF NOT EXISTS gmail_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS gmail_connections_user_id_idx ON gmail_connections(user_id);

-- Add RLS policies
ALTER TABLE gmail_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own Gmail connections"
  ON gmail_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Gmail connections"
  ON gmail_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Gmail connections"
  ON gmail_connections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Gmail connections"
  ON gmail_connections FOR DELETE
  USING (auth.uid() = user_id); 