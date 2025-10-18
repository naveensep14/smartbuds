-- Create Supabase storage bucket for test images
-- This script should be run in Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'test-images',
  'test-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- Create RLS policies for the storage bucket
CREATE POLICY "Public read access for test images" ON storage.objects
FOR SELECT USING (bucket_id = 'test-images');

CREATE POLICY "Authenticated users can upload test images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'test-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update test images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'test-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete test images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'test-images' 
  AND auth.role() = 'authenticated'
);

-- Add comments
COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads';
COMMENT ON COLUMN storage.buckets.id IS 'Unique identifier for the bucket';
COMMENT ON COLUMN storage.buckets.name IS 'Display name of the bucket';
COMMENT ON COLUMN storage.buckets.public IS 'Whether the bucket allows public access';
COMMENT ON COLUMN storage.buckets.file_size_limit IS 'Maximum file size in bytes';
COMMENT ON COLUMN storage.buckets.allowed_mime_types IS 'Array of allowed MIME types';
