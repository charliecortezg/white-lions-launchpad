-- Create table for trial class registrations
CREATE TABLE public.trial_class_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  age_or_birth_year TEXT NOT NULL,
  tutor_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  category TEXT NOT NULL,
  preferred_location TEXT NOT NULL,
  preferred_schedule TEXT NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trial_class_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert registrations (public form)
CREATE POLICY "Anyone can insert trial class registrations" 
ON public.trial_class_registrations 
FOR INSERT 
WITH CHECK (true);

-- Create policy to prevent public reads (admin only in the future)
CREATE POLICY "No public reads on trial class registrations" 
ON public.trial_class_registrations 
FOR SELECT 
USING (false);