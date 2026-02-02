-- =============================================
-- ALAN-lite v1: Motor de Reglas para Pipeline
-- =============================================

-- 1. Agregar nuevas columnas a trial_class_registrations
ALTER TABLE public.trial_class_registrations
ADD COLUMN IF NOT EXISTS trial_start_at timestamptz NULL,
ADD COLUMN IF NOT EXISTS trial_duration_min int NOT NULL DEFAULT 120,
ADD COLUMN IF NOT EXISTS attendance_grace_min int NOT NULL DEFAULT 120,
ADD COLUMN IF NOT EXISTS attendance_marked_at timestamptz NULL,
ADD COLUMN IF NOT EXISTS attendance_marked_by text NULL,
ADD COLUMN IF NOT EXISTS status_updated_at timestamptz NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS no_show_processed_at timestamptz NULL;

-- 2. Crear tabla follow_up_tasks
CREATE TABLE IF NOT EXISTS public.follow_up_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id uuid NOT NULL REFERENCES public.trial_class_registrations(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('call_no_show')),
    due_at timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
    assigned_to text NOT NULL DEFAULT 'Carlos',
    notes text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz NULL,
    idempotency_key text UNIQUE NULL
);

-- 3. Crear tabla email_queue
CREATE TABLE IF NOT EXISTS public.email_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id uuid NOT NULL REFERENCES public.trial_class_registrations(id) ON DELETE CASCADE,
    template text NOT NULL CHECK (template IN ('no_show_1', 'no_show_2', 'reminder_24h', 'reminder_2h')),
    to_email text NOT NULL,
    scheduled_for timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'canceled', 'failed')),
    idempotency_key text UNIQUE NOT NULL,
    sent_at timestamptz NULL,
    error text NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_prospect ON public.follow_up_tasks(prospect_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_status_due ON public.follow_up_tasks(status, due_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled ON public.email_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_prospect ON public.email_queue(prospect_id);
CREATE INDEX IF NOT EXISTS idx_trial_registrations_trial_start ON public.trial_class_registrations(trial_start_at);
CREATE INDEX IF NOT EXISTS idx_trial_registrations_status ON public.trial_class_registrations(status);

-- 5. Enable RLS on new tables
ALTER TABLE public.follow_up_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for follow_up_tasks
CREATE POLICY "Admins and staff can view follow_up_tasks"
ON public.follow_up_tasks
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admins and staff can update follow_up_tasks"
ON public.follow_up_tasks
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admins can delete follow_up_tasks"
ON public.follow_up_tasks
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. RLS Policies for email_queue
CREATE POLICY "Admins and staff can view email_queue"
ON public.email_queue
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- 8. Function to parse preferred_schedule and calculate trial_start_at
CREATE OR REPLACE FUNCTION public.calculate_trial_start_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    day_num int;
    month_name text;
    month_num int;
    year_num int;
    hour_num int;
    minute_num int;
    schedule_lower text;
    date_match text[];
    result_date timestamptz;
BEGIN
    -- Only calculate if preferred_schedule is set and trial_start_at is NULL or schedule changed
    IF NEW.preferred_schedule IS NULL OR NEW.preferred_schedule = '' THEN
        RETURN NEW;
    END IF;
    
    -- Skip if trial_start_at is already set and schedule hasn't changed
    IF NEW.trial_start_at IS NOT NULL AND (OLD IS NULL OR OLD.preferred_schedule = NEW.preferred_schedule) THEN
        RETURN NEW;
    END IF;
    
    schedule_lower := lower(NEW.preferred_schedule);
    
    -- Extract date pattern: "28 de enero" or "miércoles 28 de enero"
    -- Pattern: day number followed by "de" and month name
    SELECT regexp_matches(schedule_lower, '(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)', 'i')
    INTO date_match;
    
    IF date_match IS NULL THEN
        -- No date found, skip calculation
        RETURN NEW;
    END IF;
    
    day_num := date_match[1]::int;
    month_name := date_match[2];
    
    -- Map month name to number
    month_num := CASE month_name
        WHEN 'enero' THEN 1
        WHEN 'febrero' THEN 2
        WHEN 'marzo' THEN 3
        WHEN 'abril' THEN 4
        WHEN 'mayo' THEN 5
        WHEN 'junio' THEN 6
        WHEN 'julio' THEN 7
        WHEN 'agosto' THEN 8
        WHEN 'septiembre' THEN 9
        WHEN 'octubre' THEN 10
        WHEN 'noviembre' THEN 11
        WHEN 'diciembre' THEN 12
    END;
    
    -- Determine year (current or next if month has passed)
    year_num := EXTRACT(YEAR FROM now() AT TIME ZONE 'America/Tijuana')::int;
    IF month_num < EXTRACT(MONTH FROM now() AT TIME ZONE 'America/Tijuana')::int THEN
        year_num := year_num + 1;
    END IF;
    
    -- Determine time based on sport/schedule pattern
    -- "Lunes y miércoles" = Fútbol = 18:00
    -- "Martes y jueves" = Basketball = 18:30
    IF schedule_lower LIKE '%lunes%' AND schedule_lower LIKE '%miércoles%' THEN
        hour_num := 18;
        minute_num := 0;
    ELSIF schedule_lower LIKE '%martes%' AND schedule_lower LIKE '%jueves%' THEN
        hour_num := 18;
        minute_num := 30;
    ELSE
        -- Default to 18:00 if pattern not recognized
        hour_num := 18;
        minute_num := 0;
    END IF;
    
    -- Build the timestamp in America/Tijuana timezone
    BEGIN
        result_date := make_timestamptz(year_num, month_num, day_num, hour_num, minute_num, 0, 'America/Tijuana');
        NEW.trial_start_at := result_date;
    EXCEPTION WHEN OTHERS THEN
        -- If date is invalid, leave trial_start_at as NULL
        NULL;
    END;
    
    RETURN NEW;
END;
$$;

-- 9. Create trigger
DROP TRIGGER IF EXISTS trigger_calculate_trial_start_at ON public.trial_class_registrations;
CREATE TRIGGER trigger_calculate_trial_start_at
BEFORE INSERT OR UPDATE OF preferred_schedule ON public.trial_class_registrations
FOR EACH ROW
EXECUTE FUNCTION public.calculate_trial_start_at();

-- 10. Update status_updated_at on status change
CREATE OR REPLACE FUNCTION public.update_status_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.status_updated_at := now();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_status_timestamp ON public.trial_class_registrations;
CREATE TRIGGER trigger_update_status_timestamp
BEFORE UPDATE OF status ON public.trial_class_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_status_timestamp();