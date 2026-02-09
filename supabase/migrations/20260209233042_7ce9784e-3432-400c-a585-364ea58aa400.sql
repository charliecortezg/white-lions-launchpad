ALTER TABLE public.trial_class_registrations
ADD COLUMN referral_name text DEFAULT NULL,
ADD COLUMN referral_source text DEFAULT NULL;