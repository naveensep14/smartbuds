-- Create table for storing generated test images
CREATE TABLE IF NOT EXISTS test_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL, -- Reference to question within the test
  image_type TEXT NOT NULL, -- e.g., 'geometric_diagram', 'scientific_process', etc.
  image_description TEXT NOT NULL, -- Description of what the image shows
  image_prompt TEXT NOT NULL, -- The prompt used to generate the image
  image_url TEXT, -- URL to the stored image file
  image_path TEXT, -- Path in Supabase storage
  image_size INTEGER, -- File size in bytes
  image_width INTEGER, -- Image width in pixels
  image_height INTEGER, -- Image height in pixels
  generation_status TEXT DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT, -- Error message if generation failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_images_test_id ON test_images(test_id);
CREATE INDEX IF NOT EXISTS idx_test_images_question_id ON test_images(question_id);
CREATE INDEX IF NOT EXISTS idx_test_images_image_type ON test_images(image_type);
CREATE INDEX IF NOT EXISTS idx_test_images_generation_status ON test_images(generation_status);
CREATE INDEX IF NOT EXISTS idx_test_images_created_at ON test_images(created_at);

-- Add RLS policies
ALTER TABLE test_images ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view images for tests they have access to
CREATE POLICY "Users can view test images" ON test_images
  FOR SELECT USING (true);

-- Policy: Admins can manage all images
CREATE POLICY "Admins can manage test images" ON test_images
  FOR ALL USING (true);

-- Add comments
COMMENT ON TABLE test_images IS 'Stores generated images for test questions';
COMMENT ON COLUMN test_images.test_id IS 'Reference to the test containing this question';
COMMENT ON COLUMN test_images.question_id IS 'Identifier for the question within the test';
COMMENT ON COLUMN test_images.image_type IS 'Type of image (geometric_diagram, scientific_process, etc.)';
COMMENT ON COLUMN test_images.image_description IS 'Human-readable description of what the image shows';
COMMENT ON COLUMN test_images.image_prompt IS 'The AI prompt used to generate this image';
COMMENT ON COLUMN test_images.image_url IS 'Public URL to access the image';
COMMENT ON COLUMN test_images.image_path IS 'Path to the image file in Supabase storage';
COMMENT ON COLUMN test_images.generation_status IS 'Status of image generation process';

-- Update tests table to track image generation
ALTER TABLE tests ADD COLUMN IF NOT EXISTS has_images BOOLEAN DEFAULT FALSE;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS image_count INTEGER DEFAULT 0;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS image_generation_enabled BOOLEAN DEFAULT FALSE;

-- Create index for image-related queries
CREATE INDEX IF NOT EXISTS idx_tests_has_images ON tests(has_images);
CREATE INDEX IF NOT EXISTS idx_tests_image_generation_enabled ON tests(image_generation_enabled);

-- Add comments for new columns
COMMENT ON COLUMN tests.has_images IS 'Whether this test contains generated images';
COMMENT ON COLUMN tests.image_count IS 'Number of images generated for this test';
COMMENT ON COLUMN tests.image_generation_enabled IS 'Whether image generation was enabled when creating this test';
