-- Add SEO fields to site_settings for configurable meta title, description, and Open Graph image
alter table public.site_settings
add column if not exists meta_title text,
add column if not exists meta_description text,
add column if not exists og_image text;
