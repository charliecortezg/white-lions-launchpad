import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Spanish month names for parsing
const SPANISH_MONTHS: Record<string, number> = {
  'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
  'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
  'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
};

// Get Google Maps link based on location or sport
const getLocationMapLink = (location: string, sport: string): string => {
  const loc = (location || '').toLowerCase();
  const sp = (sport || '').toLowerCase();
  
  // Check location first
  if (loc.includes('hacienda') || loc.includes('bosque')) {
    return 'https://maps.app.goo.gl/QUwr6WjptEKwRg6b8';
  }
  if (loc.includes('quinta') || loc.includes('rey')) {
    return 'https://maps.app.goo.gl/1o1iuUroqA4yD86M8';
  }
  
  // Fallback to sport
  if (sp.includes('fútbol') || sp.includes('futbol') || sp.includes('soccer')) {
    return 'https://maps.app.goo.gl/QUwr6WjptEKwRg6b8';
  }
  if (sp.includes('basketball') || sp.includes('basquet') || sp.includes('básquet')) {
    return 'https://maps.app.goo.gl/1o1iuUroqA4yD86M8';
  }
  
  return '';
};

// Parse preferred_schedule to extract date and sport info
// Format: "miércoles 31 de diciembre - Lunes y miércoles, 6:00–8:00 pm"
function parsePreferredSchedule(schedule: string): { date: Date | null; sport: string; hour: number; minute: number } {
  console.log(`📅 Parsing schedule: "${schedule}"`);
  
  // Default result
  const result = { date: null as Date | null, sport: 'Fútbol', hour: 18, minute: 0 };
  
  if (!schedule) {
    console.log(`⚠️ Empty schedule`);
    return result;
  }
  
  // Determine sport from schedule pattern
  // Fútbol: "Lunes y miércoles, 6:00–8:00 pm" -> 18:00
  // Basketball: "Martes y jueves, 6:30–8:00 pm" -> 18:30
  if (schedule.toLowerCase().includes('martes y jueves') || schedule.toLowerCase().includes('6:30')) {
    result.sport = 'Basketball';
    result.hour = 18;
    result.minute = 30;
  } else {
    result.sport = 'Fútbol';
    result.hour = 18;
    result.minute = 0;
  }
  
  // Extract date: "miércoles 31 de diciembre" or similar patterns
  // Pattern: day_of_week day de month
  const datePattern = /(\d{1,2})\s+de\s+(\w+)/i;
  const match = schedule.match(datePattern);
  
  if (match) {
    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();
    const month = SPANISH_MONTHS[monthName];
    
    if (month !== undefined && day >= 1 && day <= 31) {
      // Determine year - if month is in the past, it's next year
      const now = new Date();
      let year = now.getFullYear();
      
      // If the month is before current month, or same month but day passed, use next year
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      
      if (month < currentMonth || (month === currentMonth && day < currentDay)) {
        year = year + 1;
      }
      
      // Create date in Tijuana timezone (UTC-8)
      // We create the date in UTC and add 8 hours to compensate for Tijuana offset
      result.date = new Date(Date.UTC(year, month, day, result.hour + 8, result.minute, 0));
      
      console.log(`✅ Parsed date: ${result.date.toISOString()} (${day} de ${monthName} ${year}, ${result.hour}:${result.minute.toString().padStart(2, '0')})`);
    } else {
      console.log(`⚠️ Could not parse month: "${monthName}" or day: ${day}`);
    }
  } else {
    console.log(`⚠️ Could not extract date from schedule: "${schedule}"`);
  }
  
  console.log(`📊 Result: sport=${result.sport}, hour=${result.hour}:${result.minute}`);
  
  return result;
}

// Check if a registration needs a reminder
function needsReminder(classTime: Date, now: Date, reminderType: 'reminder_24h' | 'reminder_2h'): boolean {
  const diffMs = classTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  console.log(`⏰ Time check: classTime=${classTime.toISOString()}, now=${now.toISOString()}, diffHours=${diffHours.toFixed(2)}`);
  
  if (reminderType === 'reminder_24h') {
    // Send 24h reminder if class is between 23-25 hours away
    const needs = diffHours >= 23 && diffHours <= 25;
    console.log(`   ${reminderType}: ${needs ? '✅ NEEDS REMINDER' : '❌ Not in window'} (23-25h window)`);
    return needs;
  } else {
    // Send 2h reminder if class is between 1.5-2.5 hours away
    const needs = diffHours >= 1.5 && diffHours <= 2.5;
    console.log(`   ${reminderType}: ${needs ? '✅ NEEDS REMINDER' : '❌ Not in window'} (1.5-2.5h window)`);
    return needs;
  }
}

// Format date for email display
function formatDateForEmail(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Tijuana'
  };
  return date.toLocaleDateString('es-MX', options);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("🔔 Starting reminder check...");
  console.log("=" .repeat(60));
  const now = new Date();
  console.log(`Current time (UTC): ${now.toISOString()}`);
  console.log(`Current time (Tijuana): ${now.toLocaleString('es-MX', { timeZone: 'America/Tijuana' })}`);

  try {
    // Initialize Supabase client with service role for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query trial_class_registrations (the correct table!)
    const { data: registrations, error: registrationsError } = await supabase
      .from('trial_class_registrations')
      .select('*')
      .not('parent_email', 'is', null)
      .neq('status', 'cancelled')
      .neq('status', 'Cancelado');

    if (registrationsError) {
      console.error("❌ Error fetching registrations:", registrationsError);
      throw registrationsError;
    }

    console.log(`📋 Found ${registrations?.length || 0} registrations with parent emails`);
    console.log("=" .repeat(60));

    const results: { sent: number; skipped: number; errors: number; processed: number } = {
      sent: 0,
      skipped: 0,
      errors: 0,
      processed: 0
    };

    for (const registration of registrations || []) {
      results.processed++;
      console.log(`\n📝 Processing registration ${results.processed}/${registrations?.length || 0}:`);
      console.log(`   ID: ${registration.id}`);
      console.log(`   Player: ${registration.player_name}`);
      console.log(`   Email: ${registration.parent_email}`);
      console.log(`   Schedule: ${registration.preferred_schedule}`);
      
      if (!registration.parent_email || !registration.preferred_schedule) {
        console.log(`⏭️ Skipping: missing parent_email or preferred_schedule`);
        results.skipped++;
        continue;
      }

      // Parse the preferred_schedule to get date and sport
      const parsed = parsePreferredSchedule(registration.preferred_schedule);
      
      if (!parsed.date) {
        console.log(`⏭️ Skipping: could not parse date from schedule`);
        results.skipped++;
        continue;
      }

      // Check if the class date is in the past
      if (parsed.date.getTime() < now.getTime()) {
        console.log(`⏭️ Skipping: class date is in the past`);
        results.skipped++;
        continue;
      }

      // Check both reminder types
      for (const reminderType of ['reminder_24h', 'reminder_2h'] as const) {
        if (!needsReminder(parsed.date, now, reminderType)) {
          continue;
        }

        console.log(`📧 Registration ${registration.id} needs ${reminderType}!`);

        // Check comm_log for existing reminder using the registration id
        // We'll use a custom identifier since comm_log references booking_intent_id
        const commLogIdentifier = `tcr_${registration.id}`;
        
        const { data: existingLogs, error: logError } = await supabase
          .from('comm_log')
          .select('id')
          .eq('recipient_email', registration.parent_email)
          .eq('comm_type', reminderType)
          .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()); // Last 48 hours

        if (logError) {
          console.error(`Error checking comm_log:`, logError);
          results.errors++;
          continue;
        }

        // Also check if we already sent for this specific registration
        const { data: existingForReg } = await supabase
          .from('comm_log')
          .select('id')
          .eq('subject', `¡Mañana es tu clase muestra de ${parsed.sport}! 🦁`)
          .eq('recipient_email', registration.parent_email)
          .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

        if ((existingLogs && existingLogs.length > 0) || (existingForReg && existingForReg.length > 0)) {
          console.log(`⏭️ ${reminderType} already sent recently for this email`);
          results.skipped++;
          continue;
        }

        // Prepare email content
        const is24h = reminderType === 'reminder_24h';
        const subject = is24h 
          ? `¡Mañana es tu clase muestra de ${parsed.sport}! 🦁`
          : `¡Nos vemos en 2 horas! - White Lions Academy ⚽`;
        
        const mainMessage = is24h
          ? "¡Mañana es tu clase muestra en White Lions! Te esperamos."
          : "¡Nos vemos en 2 horas! Recuerda traer agua y ropa cómoda.";

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
              <tr>
                <td style="padding: 40px 20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
                        <h1 style="margin: 0; color: #f4c430; font-size: 28px; font-weight: bold;">
                          🦁 White Lions Academy
                        </h1>
                        <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">
                          ${is24h ? 'Recordatorio - ¡Mañana!' : '¡Ya casi es hora!'}
                        </p>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #1a1a2e; font-size: 22px;">
                          ¡Hola ${registration.tutor_name || 'familia'}! 👋
                        </h2>
                        
                        <p style="margin: 0 0 25px 0; color: #333; font-size: 18px; line-height: 1.6;">
                          ${mainMessage}
                        </p>

                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
                          <tr>
                            <td style="padding: 25px;">
                              <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
                                <strong style="color: #1a1a2e;">👤 Jugador:</strong> ${registration.player_name}
                              </p>
                              <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
                                <strong style="color: #1a1a2e;">⚽ Deporte:</strong> ${parsed.sport}
                              </p>
                              <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
                                <strong style="color: #1a1a2e;">🏷️ Categoría:</strong> ${registration.category}
                              </p>
                              <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
                                <strong style="color: #1a1a2e;">📅 Fecha:</strong> ${formatDateForEmail(parsed.date)}
                              </p>
                              ${registration.preferred_location ? `
                              <p style="margin: 0; color: #666; font-size: 14px;">
                                <strong style="color: #1a1a2e;">📍 Ubicación:</strong> ${registration.preferred_location}
                              </p>
                              ` : ''}
                            </td>
                          </tr>
                        </table>

                        ${getLocationMapLink(registration.preferred_location || '', parsed.sport) ? `
                        <div style="text-align: center; margin: 25px 0;">
                          <a href="${getLocationMapLink(registration.preferred_location || '', parsed.sport)}" 
                             target="_blank"
                             style="display: inline-block; 
                                    background-color: #d4af37; 
                                    color: #1a1a2e; 
                                    padding: 16px 32px; 
                                    border-radius: 8px; 
                                    text-decoration: none; 
                                    font-weight: bold; 
                                    font-size: 16px;">
                            📍 Cómo Llegar
                          </a>
                        </div>
                        ` : ''}

                        <p style="margin: 25px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                          Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #1a1a2e; padding: 25px 30px; text-align: center;">
                        <p style="margin: 0; color: #999; font-size: 12px;">
                          White Lions Academy - Formando Campeones 🏆
                        </p>
                        <p style="margin: 10px 0 0 0; color: #666; font-size: 11px;">
                          Tijuana, Baja California
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

        // Send email
        try {
          console.log(`📤 Sending ${reminderType} email to ${registration.parent_email}...`);
          
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "White Lions Academy <hola@whitelionsacademy.com>",
              to: [registration.parent_email],
              bcc: ["whitelions.admn@gmail.com"],
              reply_to: "whitelions.admn@gmail.com",
              subject: subject,
              html: htmlContent
            }),
          });

          const emailResult = await emailResponse.json();
          
          if (!emailResponse.ok) {
            throw new Error(emailResult.message || "Failed to send reminder email");
          }

          console.log(`✅ ${reminderType} sent successfully!`);

          // Log to comm_log
          const { error: insertError } = await supabase
            .from('comm_log')
            .insert({
              comm_type: reminderType,
              recipient_email: registration.parent_email,
              subject: subject,
              body_preview: `${mainMessage} - Player: ${registration.player_name}, Sport: ${parsed.sport}`,
              status: 'sent',
              sent_at: new Date().toISOString()
            });

          if (insertError) {
            console.error(`⚠️ Error logging to comm_log:`, insertError);
          }

          results.sent++;
        } catch (emailError) {
          console.error(`❌ Error sending ${reminderType}:`, emailError);
          
          // Log failed attempt
          await supabase
            .from('comm_log')
            .insert({
              comm_type: reminderType,
              recipient_email: registration.parent_email,
              subject: subject,
              status: 'failed',
              error_message: emailError instanceof Error ? emailError.message : 'Unknown error'
            });

          results.errors++;
        }
      }
    }

    console.log("\n" + "=" .repeat(60));
    console.log(`🏁 Reminder run complete!`);
    console.log(`   📊 Processed: ${results.processed}`);
    console.log(`   ✅ Sent: ${results.sent}`);
    console.log(`   ⏭️ Skipped: ${results.skipped}`);
    console.log(`   ❌ Errors: ${results.errors}`);
    console.log("=" .repeat(60));

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("❌ Fatal error in run-reminders:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);
