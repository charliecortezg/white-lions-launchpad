import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper: Get next best slots based on sport
function getNextBestSlots(category: string, limit: number = 2): { date: Date; formatted: string; iso: string }[] {
  const now = new Date();
  // Use Tijuana timezone
  const tijuanaOffset = -8 * 60; // PST
  const localOffset = now.getTimezoneOffset();
  const diff = tijuanaOffset - localOffset;
  const tijuanaNow = new Date(now.getTime() + diff * 60 * 1000);
  
  // Detect sport from category
  const lowerCategory = category.toLowerCase();
  const isFutbol = lowerCategory.includes('fútbol') || 
                   lowerCategory.includes('futbol') || 
                   lowerCategory.includes('escuelita') || 
                   lowerCategory.includes('estrellita') ||
                   lowerCategory.includes('infantil') ||
                   lowerCategory.includes('juvenil');
  
  // Fútbol: Mon(1), Wed(3) at 18:00
  // Basketball: Tue(2), Thu(4) at 18:30
  const validDays = isFutbol ? [1, 3] : [2, 4];
  const hour = isFutbol ? 18 : 18;
  const minute = isFutbol ? 0 : 30;
  
  const slots: { date: Date; formatted: string; iso: string }[] = [];
  const checkDate = new Date(tijuanaNow);
  checkDate.setDate(checkDate.getDate() + 1); // Start tomorrow
  
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  while (slots.length < limit && checkDate.getTime() < tijuanaNow.getTime() + 30 * 24 * 60 * 60 * 1000) {
    if (validDays.includes(checkDate.getDay())) {
      const slotDate = new Date(checkDate);
      slotDate.setHours(hour, minute, 0, 0);
      
      // Convert back to UTC for storage
      const utcSlot = new Date(slotDate.getTime() - diff * 60 * 1000);
      
      const dayName = dayNames[slotDate.getDay()];
      const monthName = monthNames[slotDate.getMonth()];
      const timeStr = isFutbol ? '6:00 PM' : '6:30 PM';
      
      slots.push({
        date: utcSlot,
        formatted: `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${slotDate.getDate()} de ${monthName} - ${timeStr}`,
        iso: utcSlot.toISOString(),
      });
    }
    checkDate.setDate(checkDate.getDate() + 1);
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
function getScheduleString(category: string, date: Date): string {
  const lowerCategory = category.toLowerCase();
  const isFutbol = lowerCategory.includes('fútbol') || 
                   lowerCategory.includes('futbol') || 
                   lowerCategory.includes('escuelita') || 
                   lowerCategory.includes('estrellita') ||
                   lowerCategory.includes('infantil') ||
                   lowerCategory.includes('juvenil');
  
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  // Convert to Tijuana timezone for display
  const tijuanaOffset = -8 * 60;
  const localOffset = date.getTimezoneOffset();
  const diff = tijuanaOffset - localOffset;
  const tijuanaDate = new Date(date.getTime() + diff * 60 * 1000);
  
  const dayName = dayNames[tijuanaDate.getDay()];
  const monthName = monthNames[tijuanaDate.getMonth()];
  const schedule = isFutbol ? 'Lunes y miércoles, 6:00–8:00 pm' : 'Martes y jueves, 6:30–8:00 pm';
  
  return `${dayName} ${tijuanaDate.getDate()} de ${monthName} - ${schedule}`;
}

// Helper: Get location based on category
function getLocation(category: string): string {
  const lowerCategory = category.toLowerCase();
  const isFutbol = lowerCategory.includes('fútbol') || 
                   lowerCategory.includes('futbol') || 
                   lowerCategory.includes('escuelita') || 
                   lowerCategory.includes('estrellita') ||
                   lowerCategory.includes('infantil') ||
                   lowerCategory.includes('juvenil');
  
  return isFutbol ? 'Campo Hacienda del Bosque' : 'Parque Quinta del Rey III';
}

// Helper: Get Google Maps URL
function getMapsUrl(category: string): string {
  const lowerCategory = category.toLowerCase();
  const isFutbol = lowerCategory.includes('fútbol') || 
                   lowerCategory.includes('futbol') || 
                   lowerCategory.includes('escuelita') || 
                   lowerCategory.includes('estrellita') ||
                   lowerCategory.includes('infantil') ||
                   lowerCategory.includes('juvenil');
  
  return isFutbol 
    ? 'https://maps.app.goo.gl/7qjS6oXQkdCQiL6X7'
    : 'https://maps.app.goo.gl/5n2sFhdCn7sFzQWD8';
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

    // ACTION: GET_INFO - Return prospect info and available slots
    if (action === "get_info" || !action) {
      const slots = getNextBestSlots(prospect.category, 2);
      
      return new Response(
        JSON.stringify({
          success: true,
          prospect: {
            player_name: prospect.player_name,
            tutor_name: prospect.tutor_name,
            category: prospect.category,
            status: prospect.status,
            location: getLocation(prospect.category),
            maps_url: getMapsUrl(prospect.category),
          },
          slots,
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
          preferred_schedule: getScheduleString(prospect.category, slotDate),
          status: "Reprogramado",
          attendance_marked_at: null,
          no_show_processed_at: null,
          reactivation_status: "completed",
          status_updated_at: now.toISOString(),
        })
        .eq("id", prospect.id);

      if (updateError) throw updateError;

      // Cancel pending no-show emails
      await supabase
        .from("email_queue")
        .update({ status: "canceled" })
        .eq("prospect_id", prospect.id)
        .eq("status", "queued");

      // Close open follow-up tasks
      await supabase
        .from("follow_up_tasks")
        .update({ status: "done", completed_at: now.toISOString() })
        .eq("prospect_id", prospect.id)
        .eq("status", "open");

      // Update token usage
      await supabase
        .from("reprogram_tokens")
        .update({
          uses_count: tokenData.uses_count + 1,
          last_used_at: now.toISOString(),
        })
        .eq("id", tokenData.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: "¡Listo! Tu clase muestra ha sido reprogramada",
          prospect: {
            player_name: prospect.player_name,
            tutor_name: prospect.tutor_name,
            category: prospect.category,
            new_date: getScheduleString(prospect.category, slotDate),
            location: getLocation(prospect.category),
            maps_url: getMapsUrl(prospect.category),
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

      // Close open tasks
      await supabase
        .from("follow_up_tasks")
        .update({ status: "done", completed_at: now.toISOString() })
        .eq("prospect_id", prospect.id)
        .eq("status", "open");

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
      const slots = getNextBestSlots(prospect.category, 8);
      
      return new Response(
        JSON.stringify({
          success: true,
          slots,
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
