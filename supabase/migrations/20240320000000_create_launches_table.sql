-- Drop existing table if it exists
DROP TABLE IF EXISTS business_launches CASCADE;

-- Create business_launches table
CREATE TABLE business_launches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    launch_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reddit_posts JSONB DEFAULT '[]'::jsonb,
    twitter_posts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on business_id
CREATE INDEX idx_business_launches_business_id ON business_launches(business_id);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_business_launches_updated_at
    BEFORE UPDATE ON business_launches
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 