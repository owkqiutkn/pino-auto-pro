-- Create site-logos storage bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-logos', 'site-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read site logos
DROP POLICY IF EXISTS "Public can read site logos" ON storage.objects;
CREATE POLICY "Public can read site logos"
ON storage.objects
AS PERMISSIVE
FOR SELECT
TO public
USING (bucket_id = 'site-logos');

-- Authenticated can upload site logos
DROP POLICY IF EXISTS "Authenticated can upload site logos" ON storage.objects;
CREATE POLICY "Authenticated can upload site logos"
ON storage.objects
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'site-logos'
    AND name LIKE 'logos/%'
);

-- Authenticated can update site logos
DROP POLICY IF EXISTS "Authenticated can update site logos" ON storage.objects;
CREATE POLICY "Authenticated can update site logos"
ON storage.objects
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'site-logos'
    AND name LIKE 'logos/%'
)
WITH CHECK (
    bucket_id = 'site-logos'
    AND name LIKE 'logos/%'
);

-- Authenticated can delete site logos
DROP POLICY IF EXISTS "Authenticated can delete site logos" ON storage.objects;
CREATE POLICY "Authenticated can delete site logos"
ON storage.objects
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    bucket_id = 'site-logos'
    AND name LIKE 'logos/%'
);
