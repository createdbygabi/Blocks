-- Create reddit_comments_processed_emails table
CREATE TABLE IF NOT EXISTS reddit_comments_processed_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id TEXT NOT NULL UNIQUE,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS reddit_comments_processed_emails_email_id_idx ON reddit_comments_processed_emails(email_id);

-- Enable RLS
ALTER TABLE reddit_comments_processed_emails ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view and insert
CREATE POLICY "Allow authenticated users to view processed emails"
  ON reddit_comments_processed_emails FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert processed emails"
  ON reddit_comments_processed_emails FOR INSERT
  TO authenticated
  WITH CHECK (true); 