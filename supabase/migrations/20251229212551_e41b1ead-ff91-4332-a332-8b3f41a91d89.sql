-- Create booking_intents table for tracking registration attempts with UTM data
CREATE TABLE public.booking_intents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Player info
    player_name TEXT NOT NULL,
    birth_year TEXT NOT NULL,
    sport TEXT NOT NULL,
    category TEXT,
    
    -- Tutor info
    tutor_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    
    -- Scheduling
    preferred_location TEXT,
    preferred_schedule TEXT,
    trial_date DATE,
    
    -- UTM tracking
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending',
    converted_at TIMESTAMP WITH TIME ZONE,
    
    -- Admin reference
    assigned_admin TEXT DEFAULT 'whitelions.admn@gmail.com'
);

-- Create comm_log table for email/communication tracking
CREATE TABLE public.comm_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Reference to booking intent
    booking_intent_id UUID REFERENCES public.booking_intents(id) ON DELETE SET NULL,
    
    -- Communication details
    comm_type TEXT NOT NULL DEFAULT 'email',
    recipient_email TEXT NOT NULL,
    sender_email TEXT NOT NULL DEFAULT 'whitelions.admn@gmail.com',
    subject TEXT,
    body_preview TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Enable Row Level Security
ALTER TABLE public.booking_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comm_log ENABLE ROW LEVEL SECURITY;

-- Anyone can insert booking intents (public form)
CREATE POLICY "Anyone can insert booking intents"
ON public.booking_intents
FOR INSERT
WITH CHECK (true);

-- Only admins/staff can view booking intents
CREATE POLICY "Admins and staff can view booking intents"
ON public.booking_intents
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Only admins/staff can update booking intents
CREATE POLICY "Admins and staff can update booking intents"
ON public.booking_intents
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Only admins can delete booking intents
CREATE POLICY "Admins can delete booking intents"
ON public.booking_intents
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins/staff can view comm_log
CREATE POLICY "Admins and staff can view comm_log"
ON public.comm_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Only admins/staff can insert comm_log (from backend)
CREATE POLICY "Admins and staff can insert comm_log"
ON public.comm_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_booking_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_booking_intents_updated_at
BEFORE UPDATE ON public.booking_intents
FOR EACH ROW
EXECUTE FUNCTION public.update_booking_intents_updated_at();