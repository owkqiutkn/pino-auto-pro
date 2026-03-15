-- Add favicon URL column to site_settings
alter table public.site_settings
add column if not exists favicon text;

-- Allow authenticated users to upload/update/delete favicon in site-logos bucket (path favicon/)
DROP POLICY IF EXISTS "Authenticated can upload site favicon" ON storage.objects;
CREATE POLICY "Authenticated can upload site favicon"
ON storage.objects
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'site-logos'
    AND name LIKE 'favicon/%'
);

DROP POLICY IF EXISTS "Authenticated can update site favicon" ON storage.objects;
CREATE POLICY "Authenticated can update site favicon"
ON storage.objects
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'site-logos'
    AND name LIKE 'favicon/%'
)
WITH CHECK (
    bucket_id = 'site-logos'
    AND name LIKE 'favicon/%'
);

DROP POLICY IF EXISTS "Authenticated can delete site favicon" ON storage.objects;
CREATE POLICY "Authenticated can delete site favicon"
ON storage.objects
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    bucket_id = 'site-logos'
    AND name LIKE 'favicon/%'
);
