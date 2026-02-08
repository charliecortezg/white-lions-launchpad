
-- Create waitlist_registrations table
CREATE TABLE public.waitlist_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'web_form',
  category TEXT NOT NULL DEFAULT 'biberon',
  child_name TEXT NOT NULL,
  child_birth_year INT,
  child_age INT,
  parent_name TEXT NOT NULL,
  parent_whatsapp TEXT NOT NULL,
  parent_email TEXT,
  school TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'accepted',
  batch TEXT NOT NULL DEFAULT 'Biberon_Mar_2026_Batch1'
);

-- Enable RLS
ALTER TABLE public.waitlist_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form)
CREATE POLICY "Anyone can insert waitlist registrations"
  ON public.waitlist_registrations
  FOR INSERT
  WITH CHECK (true);

-- Only admin and staff can view
CREATE POLICY "Admins and staff can view waitlist registrations"
  ON public.waitlist_registrations
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Only admin can update
CREATE POLICY "Admins can update waitlist registrations"
  ON public.waitlist_registrations
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admin can delete
CREATE POLICY "Admins can delete waitlist registrations"
  ON public.waitlist_registrations
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- SECURITY DEFINER function for atomic insert with capacity check
CREATE OR REPLACE FUNCTION public.insert_waitlist_registration(
  p_child_name TEXT,
  p_child_birth_year INT DEFAULT NULL,
  p_child_age INT DEFAULT NULL,
  p_parent_name TEXT DEFAULT NULL,
  p_parent_whatsapp TEXT DEFAULT NULL,
  p_parent_email TEXT DEFAULT NULL,
  p_school TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_category TEXT DEFAULT 'biberon',
  p_batch TEXT DEFAULT 'Biberon_Mar_2026_Batch1',
  p_source TEXT DEFAULT 'web_form'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_status TEXT;
  v_id UUID;
  v_capacity INT := 8;
BEGIN
  -- Validate birth year for biberon
  IF p_category = 'biberon' THEN
    IF p_child_birth_year IS NOT NULL AND p_child_birth_year NOT IN (2020, 2021) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Para Biberón solo se aceptan nacidos en 2020 o 2021');
    END IF;
    IF p_child_age IS NOT NULL AND p_child_age NOT IN (4, 5) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Esta lista es solo para niños de 4-5 años');
    END IF;
  END IF;

  -- Count existing accepted registrations atomically
  SELECT count(*) INTO v_count
  FROM waitlist_registrations
  WHERE category = p_category
    AND batch = p_batch
    AND status = 'accepted';

  -- Determine status
  IF v_count < v_capacity THEN
    v_status := 'accepted';
  ELSE
    v_status := 'overflow';
  END IF;

  -- Insert the registration
  INSERT INTO waitlist_registrations (
    child_name, child_birth_year, child_age,
    parent_name, parent_whatsapp, parent_email,
    school, notes, category, batch, source, status
  ) VALUES (
    p_child_name, p_child_birth_year, p_child_age,
    p_parent_name, p_parent_whatsapp, p_parent_email,
    p_school, p_notes, p_category, p_batch, p_source, v_status
  )
  RETURNING id INTO v_id;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_id,
    'status', v_status,
    'spots_taken', v_count + (CASE WHEN v_status = 'accepted' THEN 1 ELSE 0 END),
    'capacity', v_capacity
  );
END;
$$;
