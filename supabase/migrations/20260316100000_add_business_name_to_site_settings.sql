-- Add business_name to site_settings for configurable dealership name
alter table public.site_settings
add column if not exists business_name text;
