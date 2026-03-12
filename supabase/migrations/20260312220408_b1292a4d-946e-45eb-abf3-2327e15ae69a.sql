
CREATE OR REPLACE FUNCTION public.insert_waitlist_registration(
  p_child_name text,
  p_child_birth_year integer DEFAULT NULL,
  p_child_age integer DEFAULT NULL,
  p_parent_name text DEFAULT NULL,
  p_parent_whatsapp text DEFAULT NULL,
  p_parent_email text DEFAULT NULL,
  p_school text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_category text DEFAULT 'biberon',
  p_batch text DEFAULT 'Biberon_Mar_2026_Batch1',
  p_source text DEFAULT 'web_form'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count INT;
  v_status TEXT;
  v_id UUID;
  v_capacity INT;
BEGIN
  -- Set capacity based on category
  IF p_category = 'juvenil_a' THEN
    v_capacity := 12;
  ELSE
    v_capacity := 8;
  END IF;

  -- Validate birth year for biberon
  IF p_category = 'biberon' THEN
    IF p_child_birth_year IS NOT NULL AND p_child_birth_year NOT IN (2020, 2021) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Para Biberón solo se aceptan nacidos en 2020 o 2021');
    END IF;
    IF p_child_age IS NOT NULL AND p_child_age NOT IN (4, 5) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Esta lista es solo para niños de 4-5 años');
    END IF;
  END IF;

  -- Validate birth year for juvenil_a
  IF p_category = 'juvenil_a' THEN
    IF p_child_birth_year IS NOT NULL AND p_child_birth_year NOT IN (2012, 2013) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Para Juvenil A solo se aceptan nacidos en 2012 o 2013');
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
