
-- 1) Evaluation Events table
CREATE TABLE public.evaluation_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT 'Día de Evaluación WLA',
  event_date date NOT NULL,
  location_name text NOT NULL DEFAULT 'Campo Hacienda del Bosque',
  address text NOT NULL DEFAULT 'Hacienda del Bosque, Mexicali, B.C.',
  maps_url text DEFAULT 'https://maps.app.goo.gl/ZoLbWvaQgFAsoDYa8',
  check_in_time text NOT NULL DEFAULT '5:45 PM',
  start_time text NOT NULL DEFAULT '6:00 PM',
  end_time text NOT NULL DEFAULT '8:00 PM',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.evaluation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active evaluation_events"
  ON public.evaluation_events FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage evaluation_events"
  ON public.evaluation_events FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2) Partner Schools table
CREATE TABLE public.partner_schools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_name text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active partner_schools"
  ON public.partner_schools FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage partner_schools"
  ON public.partner_schools FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3) Evaluation Event Registrations table
CREATE TABLE public.evaluation_event_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  event_id uuid NOT NULL REFERENCES public.evaluation_events(id),
  player_name text NOT NULL,
  player_dob date NOT NULL,
  school_name text NOT NULL,
  is_partner_school boolean NOT NULL DEFAULT false,
  current_club text,
  guardian_full_name text NOT NULL,
  guardian_phone text NOT NULL,
  guardian_email text NOT NULL,
  calculated_fee_mxn integer NOT NULL DEFAULT 300,
  payment_status text NOT NULL DEFAULT 'unpaid',
  notes text,
  source text NOT NULL DEFAULT 'Landing Evaluaciones WLA',
  reminder_48h_sent boolean NOT NULL DEFAULT false,
  reminder_12h_sent boolean NOT NULL DEFAULT false
);

ALTER TABLE public.evaluation_event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert evaluation_event_registrations"
  ON public.evaluation_event_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins and staff can view evaluation_event_registrations"
  ON public.evaluation_event_registrations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admins can update evaluation_event_registrations"
  ON public.evaluation_event_registrations FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete evaluation_event_registrations"
  ON public.evaluation_event_registrations FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
