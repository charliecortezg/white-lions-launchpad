CREATE TABLE public.offboarding_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL,
  reason text NOT NULL,
  feedback text,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offboarding_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert offboarding forms"
ON public.offboarding_forms FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view offboarding forms"
ON public.offboarding_forms FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));