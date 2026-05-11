CREATE TABLE public.leads_verano (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_padre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  nombre_jugador TEXT NOT NULL,
  edad_jugador INTEGER NOT NULL,
  grupo TEXT NOT NULL,
  mes_interes TEXT NOT NULL,
  paquete_interes TEXT NOT NULL,
  forma_pago TEXT,
  fuente TEXT NOT NULL DEFAULT 'web',
  estado TEXT NOT NULL DEFAULT 'lead',
  stripe_link_clicked TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads_verano ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads_verano"
ON public.leads_verano FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins and staff can view leads_verano"
ON public.leads_verano FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admins and staff can update leads_verano"
ON public.leads_verano FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admins can delete leads_verano"
ON public.leads_verano FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_leads_verano_updated_at
BEFORE UPDATE ON public.leads_verano
FOR EACH ROW
EXECUTE FUNCTION public.update_booking_intents_updated_at();