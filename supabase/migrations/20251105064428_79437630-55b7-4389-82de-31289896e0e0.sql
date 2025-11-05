-- Make national_id and email optional in registrations table
ALTER TABLE public.registrations 
ALTER COLUMN national_id DROP NOT NULL,
ALTER COLUMN email DROP NOT NULL;