-- Add optional image_url column to categories
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS image_url text;

-- Create category-images storage bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read category images
DROP POLICY IF EXISTS "Public can read category images" ON storage.objects;
CREATE POLICY "Public can read category images"
ON storage.objects
AS PERMISSIVE
FOR SELECT
TO public
USING (bucket_id = 'category-images');

-- Authenticated can upload category images
DROP POLICY IF EXISTS "Authenticated can upload category images" ON storage.objects;
CREATE POLICY "Authenticated can upload category images"
ON storage.objects
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'category-images'
    AND name LIKE 'categories/%'
);

-- Authenticated can update category images
DROP POLICY IF EXISTS "Authenticated can update category images" ON storage.objects;
CREATE POLICY "Authenticated can update category images"
ON storage.objects
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'category-images'
    AND name LIKE 'categories/%'
)
WITH CHECK (
    bucket_id = 'category-images'
    AND name LIKE 'categories/%'
);

-- Authenticated can delete category images
DROP POLICY IF EXISTS "Authenticated can delete category images" ON storage.objects;
CREATE POLICY "Authenticated can delete category images"
ON storage.objects
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    bucket_id = 'category-images'
    AND name LIKE 'categories/%'
);
