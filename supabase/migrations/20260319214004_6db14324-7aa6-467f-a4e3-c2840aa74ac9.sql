
CREATE TABLE public.calculator_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  player_age INTEGER NOT NULL,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT,
  location TEXT NOT NULL,
  coeficiente INTEGER NOT NULL,
  tier TEXT NOT NULL,
  category TEXT NOT NULL,
  parent_goal TEXT,
  dimensions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.calculator_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert from service role" ON public.calculator_leads
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow select from service role" ON public.calculator_leads
  FOR SELECT TO service_role USING (true);
