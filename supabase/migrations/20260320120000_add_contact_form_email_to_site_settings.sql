-- Inbox for contact forms and lead emails (Resend "to" address). Separate from public dealer email.
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS contact_form_email text;
