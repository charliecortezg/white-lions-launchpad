-- ===========================================
-- ALAN-lite v1 Production-Ready Migration
-- ===========================================

-- 1. Create job_runs table for cron logging and locking
CREATE TABLE IF NOT EXISTS public.job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz NULL,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  processed_count int DEFAULT 0,
  error_count int DEFAULT 0,
  last_error text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_runs_name_status ON public.job_runs(job_name, status);
CREATE INDEX IF NOT EXISTS idx_job_runs_started ON public.job_runs(started_at DESC);

-- Enable RLS on job_runs
ALTER TABLE public.job_runs ENABLE ROW LEVEL SECURITY;

-- Only admins and staff can view job_runs for debugging
CREATE POLICY "Admins and staff can view job_runs" ON public.job_runs
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- 2. Create class_schedules table for single source of truth
CREATE TABLE IF NOT EXISTS public.class_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport text NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_hour int NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
  start_minute int NOT NULL CHECK (start_minute BETWEEN 0 AND 59),
  duration_minutes int NOT NULL DEFAULT 90,
  location_name text NOT NULL,
  location_zone text NULL,
  maps_url text NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on class_schedules
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;

-- Anyone can read active schedules (for the form)
CREATE POLICY "Anyone can view active class_schedules" ON public.class_schedules
  FOR SELECT
  USING (is_active = true);

-- Only admins can modify schedules
CREATE POLICY "Admins can manage class_schedules" ON public.class_schedules
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Seed class_schedules with current schedules
INSERT INTO public.class_schedules (sport, day_of_week, start_hour, start_minute, duration_minutes, location_name, location_zone, maps_url) VALUES
('Fútbol', 1, 18, 0, 120, 'Campo Hacienda del Bosque', 'Zona Haciendas, Mexicali', 'https://maps.app.goo.gl/7qjS6oXQkdCQiL6X7'),
('Fútbol', 3, 18, 0, 120, 'Campo Hacienda del Bosque', 'Zona Haciendas, Mexicali', 'https://maps.app.goo.gl/7qjS6oXQkdCQiL6X7'),
('Basketball', 2, 18, 30, 90, 'Parque Quinta del Rey III', 'Fracc. Quinta del Rey, Mexicali', 'https://maps.app.goo.gl/5n2sFhdCn7sFzQWD8'),
('Basketball', 4, 18, 30, 90, 'Parque Quinta del Rey III', 'Fracc. Quinta del Rey, Mexicali', 'https://maps.app.goo.gl/5n2sFhdCn7sFzQWD8');

-- 4. Add payload column to email_queue for token reuse
ALTER TABLE public.email_queue ADD COLUMN IF NOT EXISTS payload jsonb NULL;