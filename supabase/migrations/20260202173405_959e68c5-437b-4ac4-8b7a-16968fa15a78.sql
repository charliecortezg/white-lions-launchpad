-- =====================================================
-- ALAN-lite v1: Complete NO-SHOW Reactivation System
-- =====================================================

-- 1. Add new fields to trial_class_registrations
ALTER TABLE public.trial_class_registrations 
  ADD COLUMN IF NOT EXISTS reactivation_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS reactivation_paused_until timestamptz NULL,
  ADD COLUMN IF NOT EXISTS lost_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS lost_reason text NULL,
  ADD COLUMN IF NOT EXISTS email_normalized text NULL,
  ADD COLUMN IF NOT EXISTS phone_normalized text NULL;

-- Add check constraints
ALTER TABLE public.trial_class_registrations 
  DROP CONSTRAINT IF EXISTS chk_reactivation_status;
ALTER TABLE public.trial_class_registrations 
  ADD CONSTRAINT chk_reactivation_status CHECK (reactivation_status IN ('active', 'paused', 'completed'));

ALTER TABLE public.trial_class_registrations 
  DROP CONSTRAINT IF EXISTS chk_lost_reason;
ALTER TABLE public.trial_class_registrations 
  ADD CONSTRAINT chk_lost_reason CHECK (lost_reason IS NULL OR lost_reason IN ('opt_out', 'no_response_72h', 'manual'));

-- 2. Create reprogram_tokens table for Magic Links
CREATE TABLE IF NOT EXISTS public.reprogram_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.trial_class_registrations(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  uses_count int NOT NULL DEFAULT 0,
  last_used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_reprogram_tokens_prospect ON public.reprogram_tokens(prospect_id);
CREATE INDEX IF NOT EXISTS idx_reprogram_tokens_expires ON public.reprogram_tokens(expires_at);

-- 3. Update email_queue template constraint to include new templates
-- First drop the old constraint if it exists
DO $$ 
BEGIN
  ALTER TABLE public.email_queue DROP CONSTRAINT IF EXISTS email_queue_template_check;
EXCEPTION WHEN undefined_object THEN
  NULL;
END $$;

-- Note: The email_queue table already exists without a check constraint on template,
-- so we just need to ensure our templates work: no_show_1, no_show_2, no_show_3, lost_check

-- 4. Create trigger function to normalize contact data
CREATE OR REPLACE FUNCTION public.normalize_contact_data()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Normalize email (lowercase, trimmed)
  IF NEW.parent_email IS NOT NULL AND NEW.parent_email != '' THEN
    NEW.email_normalized := LOWER(TRIM(NEW.parent_email));
  ELSE
    NEW.email_normalized := NULL;
  END IF;
  
  -- Normalize phone (digits only)
  IF NEW.contact_phone IS NOT NULL AND NEW.contact_phone != '' THEN
    NEW.phone_normalized := REGEXP_REPLACE(NEW.contact_phone, '[^0-9]', '', 'g');
  ELSE
    NEW.phone_normalized := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. Create trigger for normalization
DROP TRIGGER IF EXISTS trg_normalize_contact_data ON public.trial_class_registrations;
CREATE TRIGGER trg_normalize_contact_data
  BEFORE INSERT OR UPDATE OF parent_email, contact_phone
  ON public.trial_class_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_contact_data();

-- 6. Backfill existing records with normalized data
UPDATE public.trial_class_registrations
SET 
  email_normalized = CASE 
    WHEN parent_email IS NOT NULL AND parent_email != '' 
    THEN LOWER(TRIM(parent_email)) 
    ELSE NULL 
  END,
  phone_normalized = CASE 
    WHEN contact_phone IS NOT NULL AND contact_phone != '' 
    THEN REGEXP_REPLACE(contact_phone, '[^0-9]', '', 'g') 
    ELSE NULL 
  END
WHERE email_normalized IS NULL OR phone_normalized IS NULL;

-- 7. Create indexes for dedupe queries
CREATE INDEX IF NOT EXISTS idx_trial_email_normalized ON public.trial_class_registrations(email_normalized) WHERE email_normalized IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trial_phone_normalized ON public.trial_class_registrations(phone_normalized) WHERE phone_normalized IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trial_status_created ON public.trial_class_registrations(status, created_at);

-- 8. RLS Policies for reprogram_tokens (service_role access only via edge functions)
ALTER TABLE public.reprogram_tokens ENABLE ROW LEVEL SECURITY;

-- Admin/staff can view tokens
CREATE POLICY "Admins and staff can view reprogram_tokens" 
  ON public.reprogram_tokens 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Note: INSERT/UPDATE/DELETE will be done via service_role in edge functions