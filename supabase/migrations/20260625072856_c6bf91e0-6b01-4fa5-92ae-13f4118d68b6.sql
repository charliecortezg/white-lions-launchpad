
CREATE TABLE public.season_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  categoria text NOT NULL,
  temporadas_en_wla text NOT NULL,
  nps integer NOT NULL CHECK (nps BETWEEN 1 AND 10),
  calidad_entrenamiento integer NOT NULL CHECK (calidad_entrenamiento BETWEEN 1 AND 5),
  comunicacion_triangulo integer NOT NULL CHECK (comunicacion_triangulo BETWEEN 1 AND 5),
  progreso_hijo integer NOT NULL CHECK (progreso_hijo BETWEEN 1 AND 5),
  organizacion_general integer NOT NULL CHECK (organizacion_general BETWEEN 1 AND 5),
  que_le_gusto_al_hijo text NOT NULL,
  que_valoro_el_padre text NOT NULL,
  que_no_funciono text,
  que_no_repetir text,
  que_cambiaria text NOT NULL,
  que_le_falta_a_wla text
);

GRANT INSERT ON public.season_feedback TO anon, authenticated;
GRANT ALL ON public.season_feedback TO service_role;

ALTER TABLE public.season_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit season feedback"
ON public.season_feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
