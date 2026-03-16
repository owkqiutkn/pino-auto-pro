-- Add email and phone to site_settings for dealer contact info (used in footer, contact sections)
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text;
