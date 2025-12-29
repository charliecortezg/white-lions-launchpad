-- Add parent_email column to trial_class_registrations
ALTER TABLE public.trial_class_registrations 
ADD COLUMN IF NOT EXISTS parent_email TEXT;

-- Add parent_email column to booking_intents
ALTER TABLE public.booking_intents 
ADD COLUMN IF NOT EXISTS parent_email TEXT;