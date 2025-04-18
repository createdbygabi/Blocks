-- Add status column to reddit_comments_content
ALTER TABLE reddit_comments_content
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'not_relevant'));

-- Update existing rows to have status set to 'pending'
UPDATE reddit_comments_content
SET status = 'pending'
WHERE status IS NULL;

-- Disable RLS since this is a local admin tool
ALTER TABLE reddit_comments_content DISABLE ROW LEVEL SECURITY;

-- Drop any existing RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to view content" ON reddit_comments_content;
DROP POLICY IF EXISTS "Allow authenticated users to insert content" ON reddit_comments_content;
DROP POLICY IF EXISTS "Allow authenticated users to update content" ON reddit_comments_content; 