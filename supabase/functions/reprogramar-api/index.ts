import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Schedule type for class_schedules table
interface ClassSchedule {
  id: string;
  sport: string;
  day_of_week: number;
  start_hour: number;
  start_minute: number;
  duration_minutes: number;
  location_name: string;
  location_zone: string | null;
  maps_url: string | null;
  is_active: boolean;
}

// Helper: Detect sport from category
function detectSport(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes('basket') || lower.includes('básquet') || lower.includes('basquet')) {
    return 'Basketball';
  }
  return 'Fútbol';
}

// Helper: Get next best slots from class_schedules table
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getNextBestSlots(
  supabase: any,
  category: string,
  limit: number = 2
): Promise<{ date: Date; formatted: string; iso: string; location: string; maps_url: string }[]> {
  const sport = detectSport(category);
  
  // Fetch schedules from DB
  const { data, error } = await supabase
    .from('class_schedules')
    .select('*')
    .eq('sport', sport)
    .eq('is_active', true);

  const schedules = data as ClassSchedule[] | null;
  if (error || !schedules || schedules.length === 0) {
    console.error('Error fetching schedules:', error);
    return [];
  }

  // Calculate next N slots using America/Tijuana timezone
  const now = new Date();
  const tijuanaFormatter = new Intl.DateTimeFormat('en-US', { 
    timeZone: 'America/Tijuana',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  
  const slots: { date: Date; formatted: string; iso: string; location: string; maps_url: string }[] = [];
  const checkDate = new Date(now);
  checkDate.setDate(checkDate.getDate() + 1); // Start tomorrow
  
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  let daysChecked = 0;
  while (slots.length < limit && daysChecked < 30) {
    // Get day of week in Tijuana timezone
    const tijuanaParts = tijuanaFormatter.formatToParts(checkDate);
    const getDayOfWeek = () => {
      const tempDate = new Date(checkDate.toLocaleString('en-US', { timeZone: 'America/Tijuana' }));
      return tempDate.getDay();
    };
    const dayOfWeek = getDayOfWeek();
    
    for (const schedule of schedules) {
      if (schedule.day_of_week === dayOfWeek && slots.length < limit) {
        // Create slot date in Tijuana time
        const slotDate = new Date(checkDate);
        
        // Get the date parts for Tijuana
        const yearPart = tijuanaParts.find(p => p.type === 'year')?.value || String(slotDate.getFullYear());
        const monthPart = tijuanaParts.find(p => p.type === 'month')?.value || '01';
        const dayPart = tijuanaParts.find(p => p.type === 'day')?.value || '01';
        
        // Create a date string for Tijuana timezone
        const tijuanaDateStr = `${yearPart}-${monthPart}-${dayPart}T${String(schedule.start_hour).padStart(2, '0')}:${String(schedule.start_minute).padStart(2, '0')}:00`;
        
        // Parse as a Tijuana date and convert to UTC
        const tijuanaDate = new Date(tijuanaDateStr);
        // Tijuana is UTC-8 (PST), so we add 8 hours to get UTC
        const utcDate = new Date(tijuanaDate.getTime() + 8 * 60 * 60 * 1000);
        
        const dayName = dayNames[dayOfWeek];
        const monthName = monthNames[parseInt(monthPart) - 1];
        const timeStr = `${schedule.start_hour > 12 ? schedule.start_hour - 12 : schedule.start_hour}:${String(schedule.start_minute).padStart(2, '0')} PM`;
        
        slots.push({
          date: utcDate,
          formatted: `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${parseInt(dayPart)} de ${monthName} - ${timeStr}`,
          iso: utcDate.toISOString(),
          location: schedule.location_name,
          maps_url: schedule.maps_url || '',
        });
      }
    }
    
    checkDate.setDate(checkDate.getDate() + 1);
    daysChecked++;
  }
  
  return slots;
}

// Helper: Hash token
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: Get schedule string
function getScheduleString(sport: string, date: Date): string {
  const isFutbol = sport === 'Fútbol';
  
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  // Convert to Tijuana timezone for display
  const tijuanaDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Tijuana' }));
  
  const dayName = dayNames[tijuanaDate.getDay()];
  const monthName = monthNames[tijuanaDate.getMonth()];
  const schedule = isFutbol ? 'Lunes y miércoles, 6:00–8:00 pm' : 'Martes y jueves, 6:30–8:00 pm';
  
  return `${dayName} ${tijuanaDate.getDate()} de ${monthName} - ${schedule}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const token = url.searchParams.get("token");
    const slot = url.searchParams.get("slot");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token requerido", code: "TOKEN_REQUIRED" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash the token to look it up
    const tokenHash = await hashToken(token);

    // Find the token
    const { data: tokenData, error: tokenError } = await supabase
      .from("reprogram_tokens")
      .select("*, prospect:prospect_id(*)")
      .eq("token_hash", tokenHash)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: "Token inválido o expirado", code: "INVALID_TOKEN" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Este enlace ha expirado", code: "EXPIRED_TOKEN" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prospect = tokenData.prospect;
    const sport = detectSport(prospect.category);

    // ACTION: GET_INFO - Return prospect info and available slots
    if (action === "get_info" || !action) {
      const slots = await getNextBestSlots(supabase, prospect.category, 2);
      
      // Get location from first slot or use fallback
      const location = slots[0]?.location || (sport === 'Fútbol' ? 'Campo Hacienda del Bosque' : 'Parque Quinta del Rey III');
      const mapsUrl = slots[0]?.maps_url || (sport === 'Fútbol' ? 'https://maps.app.goo.gl/7qjS6oXQkdCQiL6X7' : 'https://maps.app.goo.gl/5n2sFhdCn7sFzQWD8');
      
      return new Response(
        JSON.stringify({
          success: true,
          prospect: {
            player_name: prospect.player_name,
            tutor_name: prospect.tutor_name,
            category: prospect.category,
            status: prospect.status,
            location,
            maps_url: mapsUrl,
          },
          slots: slots.map(s => ({ formatted: s.formatted, iso: s.iso })),
          token_valid: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: CONFIRM - Confirm rescheduling
    if (action === "confirm") {
      if (!slot) {
        return new Response(
          JSON.stringify({ error: "Slot requerido", code: "SLOT_REQUIRED" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const slotDate = new Date(slot);
      if (isNaN(slotDate.getTime())) {
        return new Response(
          JSON.stringify({ error: "Fecha inválida", code: "INVALID_SLOT" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const now = new Date();

      // Update prospect
      const { error: updateError } = await supabase
        .from("trial_class_registrations")
        .update({
          trial_start_at: slotDate.toISOString(),
          preferred_schedule: getScheduleString(sport, slotDate),
          status: "Reprogramado",
          attendance_marked_at: null,
          no_show_processed_at: null,
          reactivation_status: "completed",
          status_updated_at: now.toISOString(),
        })
        .eq("id", prospect.id);

      if (updateError) throw updateError;

      // Cancel pending no-show emails AND reminder emails
      await supabase
        .from("email_queue")
        .update({ status: "canceled" })
        .eq("prospect_id", prospect.id)
        .eq("status", "queued");

      // Update token usage
      await supabase
        .from("reprogram_tokens")
        .update({
          uses_count: tokenData.uses_count + 1,
          last_used_at: now.toISOString(),
        })
        .eq("id", tokenData.id);

      // Get location for confirmation
      const slots = await getNextBestSlots(supabase, prospect.category, 1);
      const location = slots[0]?.location || (sport === 'Fútbol' ? 'Campo Hacienda del Bosque' : 'Parque Quinta del Rey III');
      const mapsUrl = slots[0]?.maps_url || (sport === 'Fútbol' ? 'https://maps.app.goo.gl/7qjS6oXQkdCQiL6X7' : 'https://maps.app.goo.gl/5n2sFhdCn7sFzQWD8');

      return new Response(
        JSON.stringify({
          success: true,
          message: "¡Listo! Tu clase muestra ha sido reprogramada",
          prospect: {
            player_name: prospect.player_name,
            tutor_name: prospect.tutor_name,
            category: prospect.category,
            new_date: getScheduleString(sport, slotDate),
            location,
            maps_url: mapsUrl,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: PAUSE - Opt-out of messages
    if (action === "pause") {
      const now = new Date();
      const pauseUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Update prospect to lost
      const { error: updateError } = await supabase
        .from("trial_class_registrations")
        .update({
          status: "Perdido",
          reactivation_status: "paused",
          reactivation_paused_until: pauseUntil.toISOString(),
          lost_at: now.toISOString(),
          lost_reason: "opt_out",
          status_updated_at: now.toISOString(),
        })
        .eq("id", prospect.id);

      if (updateError) throw updateError;

      // Cancel pending emails
      await supabase
        .from("email_queue")
        .update({ status: "canceled" })
        .eq("prospect_id", prospect.id)
        .eq("status", "queued");

      return new Response(
        JSON.stringify({
          success: true,
          message: "Listo, hemos pausado los mensajes por ahora",
          prospect: {
            player_name: prospect.player_name,
            tutor_name: prospect.tutor_name,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: GET_ALL_SLOTS - Return more slots for "ver más horarios"
    if (action === "get_all_slots") {
      const slots = await getNextBestSlots(supabase, prospect.category, 8);
      
      return new Response(
        JSON.stringify({
          success: true,
          slots: slots.map(s => ({ formatted: s.formatted, iso: s.iso })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Acción no válida", code: "INVALID_ACTION" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
