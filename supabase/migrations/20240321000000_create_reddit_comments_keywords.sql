-- Create reddit_comments_keywords table
CREATE TABLE IF NOT EXISTS reddit_comments_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS reddit_comments_keywords_business_name_idx ON reddit_comments_keywords(business_name);

-- Add RLS policies
ALTER TABLE reddit_comments_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all keywords"
  ON reddit_comments_keywords FOR SELECT
  USING (true);

CREATE POLICY "Users can insert keywords"
  ON reddit_comments_keywords FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update keywords"
  ON reddit_comments_keywords FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete keywords"
  ON reddit_comments_keywords FOR DELETE
  USING (true); 