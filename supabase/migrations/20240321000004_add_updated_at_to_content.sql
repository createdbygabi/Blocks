-- Add updated_at column to reddit_comments_content
ALTER TABLE reddit_comments_content
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reddit_comments_content_updated_at
    BEFORE UPDATE ON reddit_comments_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 