-- Add address to site_settings for dealer location (used in footer)
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS address text;
