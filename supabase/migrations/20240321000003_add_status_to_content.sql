-- Add status column to reddit_comments_content
ALTER TABLE reddit_comments_content
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'not_relevant'));

-- Update existing rows to have status set to 'pending'
UPDATE reddit_comments_content
SET status = 'pending'
WHERE status IS NULL; 