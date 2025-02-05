-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Page',
  slug TEXT UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages (slug);

-- Add RLS policies
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access"
  ON pages FOR SELECT
  USING (true);

-- Allow authenticated users to insert/update their own pages
CREATE POLICY "Allow authenticated users to modify their pages"
  ON pages FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated'); 