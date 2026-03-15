-- Add Google Analytics Measurement ID to site settings (e.g. G-XXXXXXXXXX)
alter table public.site_settings
add column if not exists google_analytics_id text;
