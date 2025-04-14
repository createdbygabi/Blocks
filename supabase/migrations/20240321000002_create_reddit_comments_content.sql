-- Drop existing table if it exists
DROP TABLE IF EXISTS reddit_comments_content;

-- Create reddit_comments_content table
CREATE TABLE IF NOT EXISTS reddit_comments_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  keyword TEXT NOT NULL,
  type TEXT NOT NULL,
  subreddit TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  email_id TEXT,
  email_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS reddit_comments_content_business_id_idx ON reddit_comments_content(business_id);
CREATE INDEX IF NOT EXISTS reddit_comments_content_keyword_idx ON reddit_comments_content(keyword);
CREATE INDEX IF NOT EXISTS reddit_comments_content_url_idx ON reddit_comments_content(url);
CREATE UNIQUE INDEX IF NOT EXISTS reddit_comments_content_url_unique_idx ON reddit_comments_content(url);

-- Enable RLS
ALTER TABLE reddit_comments_content ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view and insert
CREATE POLICY "Allow authenticated users to view content"
  ON reddit_comments_content FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert content"
  ON reddit_comments_content FOR INSERT
  TO authenticated
  WITH CHECK (true); 