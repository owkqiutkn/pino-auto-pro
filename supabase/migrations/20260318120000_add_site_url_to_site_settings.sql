-- Add site_url for og:url (canonical base URL)
alter table public.site_settings
add column if not exists site_url text;
