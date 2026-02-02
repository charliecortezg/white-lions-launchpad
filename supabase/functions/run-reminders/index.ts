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
  
  if (loc.includes('hacienda') || loc.includes('bosque')) {
    return 'https://maps.app.goo.gl/ZoLbWvaQgFAsoDYa8';
  }
  if (loc.includes('quinta') || loc.includes('rey')) {
    return 'https://maps.app.goo.gl/1o1iuUroqA4yD86M8';
  }
  
  if (sp.includes('fútbol') || sp.includes('futbol') || sp.includes('soccer')) {
    return 'https://maps.app.goo.gl/ZoLbWvaQgFAsoDYa8';
  }
  if (sp.includes('basketball') || sp.includes('basquet') || sp.includes('básquet')) {
    return 'https://maps.app.goo.gl/1o1iuUroqA4yD86M8';
  }
  
  return '';
};

// Parse preferred_schedule to extract date and sport info
function parsePreferredSchedule(schedule: string): { date: Date | null; sport: string; hour: number; minute: number } {
  console.log(`📅 Parsing schedule: "${schedule}"`);
  
  const result = { date: null as Date | null, sport: 'Fútbol', hour: 18, minute: 0 };
  
  if (!schedule) {
    console.log(`⚠️ Empty schedule`);
    return result;
  }
  
  if (schedule.toLowerCase().includes('martes y jueves') || schedule.toLowerCase().includes('6:30')) {
    result.sport = 'Basketball';
    result.hour = 18;
    result.minute = 30;
  } else {
    result.sport = 'Fútbol';
    result.hour = 18;
    result.minute = 0;
  }
  
  const datePattern = /(\d{1,2})\s+de\s+(\w+)/i;
  const match = schedule.match(datePattern);
  
  if (match) {
    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();
    const month = SPANISH_MONTHS[monthName];
    
    if (month !== undefined && day >= 1 && day <= 31) {
      const now = new Date();
      let year = now.getFullYear();
      
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      
      if (month < currentMonth || (month === currentMonth && day < currentDay)) {
        year = year + 1;
      }
      
      result.date = new Date(Date.UTC(year, month, day, result.hour + 8, result.minute, 0));
      
      console.log(`✅ Parsed date: ${result.date.toISOString()}`);
    } else {
      console.log(`⚠️ Could not parse month: "${monthName}" or day: ${day}`);
    }
  } else {
    console.log(`⚠️ Could not extract date from schedule: "${schedule}"`);
  }
  
  return result;
}

// Check if a registration needs a reminder
function needsReminder(classTime: Date, now: Date, reminderType: 'reminder_24h' | 'reminder_2h'): boolean {
  const diffMs = classTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  console.log(`⏰ Time check: classTime=${classTime.toISOString()}, now=${now.toISOString()}, diffHours=${diffHours.toFixed(2)}`);
  
  if (reminderType === 'reminder_24h') {
    const needs = diffHours >= 23 && diffHours <= 25;
    console.log(`   ${reminderType}: ${needs ? '✅ NEEDS REMINDER' : '❌ Not in window'} (23-25h window)`);
    return needs;
  } else {
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("🔔 Starting reminder check...");
  console.log("=" .repeat(60));
  const now = new Date();
  console.log(`Current time (UTC): ${now.toISOString()}`);
  console.log(`Current time (Tijuana): ${now.toLocaleString('es-MX', { timeZone: 'America/Tijuana' })}`);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: registrations, error: registrationsError } = await supabase
      .from('trial_class_registrations')
      .select('*')
      .not('parent_email', 'is', null)
      .neq('status', 'cancelled')
      .neq('status', 'Cancelado')
      .neq('status', 'Perdido')
      .neq('status', 'Inscrito');

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

      const parsed = parsePreferredSchedule(registration.preferred_schedule);
      
      if (!parsed.date) {
        console.log(`⏭️ Skipping: could not parse date from schedule`);
        results.skipped++;
        continue;
      }

      if (parsed.date.getTime() < now.getTime()) {
        console.log(`⏭️ Skipping: class date is in the past`);
        results.skipped++;
        continue;
      }

      for (const reminderType of ['reminder_24h', 'reminder_2h'] as const) {
        if (!needsReminder(parsed.date, now, reminderType)) {
          continue;
        }

        console.log(`📧 Registration ${registration.id} needs ${reminderType}!`);

        // Check for existing reminder in email_queue
        const dateKey = parsed.date.toISOString().split('T')[0];
        const idempotencyKey = `${reminderType}_${registration.id}_${dateKey}`;
        
        const { data: existingEmail } = await supabase
          .from('email_queue')
          .select('id')
          .eq('idempotency_key', idempotencyKey)
          .maybeSingle();

        if (existingEmail) {
          console.log(`⏭️ ${reminderType} already exists in queue for this registration`);
          results.skipped++;
          continue;
        }

        // Also check comm_log
        const { data: existingLogs } = await supabase
          .from('comm_log')
          .select('id')
          .eq('recipient_email', registration.parent_email)
          .eq('comm_type', reminderType)
          .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

        if (existingLogs && existingLogs.length > 0) {
          console.log(`⏭️ ${reminderType} already sent recently for this email`);
          results.skipped++;
          continue;
        }

        // Prepare email content - UPDATED COPY
        const is24h = reminderType === 'reminder_24h';
        const subject = is24h 
          ? `🦁 ¡Mañana inicia tu Reto White Lions! - ${registration.player_name}`
          : `⏰ ¡Nos vemos en 2 horas! - White Lions Academy`;
        
        const mainMessage = is24h
          ? `¡Mañana es el día! ${registration.player_name} comienza su Reto White Lions. Recuerda traer su kit de inicio y muchas ganas.`
          : `¡Ya casi es hora! Nos vemos en 2 horas para el entrenamiento. Recuerda traer agua y ropa cómoda.`;

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
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #0F172A 0%, #1e293b 100%); padding: 35px; text-align: center;">
                        <h1 style="margin: 0; color: #f59e0b; font-size: 28px; font-weight: bold;">
                          🦁 White Lions Academy
                        </h1>
                        <p style="margin: 12px 0 0 0; color: #94a3b8; font-size: 16px;">
                          ${is24h ? '¡Mañana es el día!' : '¡Ya casi es hora!'}
                        </p>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #0F172A; font-size: 22px;">
                          ¡Hola ${registration.tutor_name || 'familia'}! 👋
                        </h2>
                        
                        <p style="margin: 0 0 25px 0; color: #334155; font-size: 17px; line-height: 1.7;">
                          ${mainMessage}
                        </p>

                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-radius: 12px; margin: 25px 0;">
                          <tr>
                            <td style="padding: 25px;">
                              <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">
                                <strong style="color: #0F172A;">👤 Jugador:</strong> ${registration.player_name}
                              </p>
                              <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">
                                <strong style="color: #0F172A;">⚽ Deporte:</strong> ${parsed.sport}
                              </p>
                              <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">
                                <strong style="color: #0F172A;">🏷️ Categoría:</strong> ${registration.category}
                              </p>
                              <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">
                                <strong style="color: #0F172A;">📅 Fecha:</strong> ${formatDateForEmail(parsed.date)}
                              </p>
                              ${registration.preferred_location ? `
                              <p style="margin: 0; color: #64748b; font-size: 14px;">
                                <strong style="color: #0F172A;">📍 Ubicación:</strong> ${registration.preferred_location}
                              </p>
                              ` : ''}
                            </td>
                          </tr>
                        </table>

                        ${getLocationMapLink(registration.preferred_location || '', parsed.sport) ? `
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${getLocationMapLink(registration.preferred_location || '', parsed.sport)}" 
                             target="_blank"
                             style="display: inline-block; 
                                    background-color: #f59e0b; 
                                    color: #0F172A; 
                                    padding: 16px 40px; 
                                    border-radius: 10px; 
                                    text-decoration: none; 
                                    font-weight: bold; 
                                    font-size: 16px;">
                            📍 Cómo Llegar
                          </a>
                        </div>
                        ` : ''}

                        ${is24h ? `
                        <div style="background: #f1f5f9; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                          <p style="margin: 0; color: #0F172A; font-size: 14px; line-height: 1.6;">
                            <strong>🎁 Recuerda:</strong> Mañana recibirás tu Kit de Inicio White Lions 
                            (camiseta, calcetas, espinilleras y termo).
                          </p>
                        </div>
                        ` : ''}

                        <p style="margin: 25px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                          Si tienes alguna pregunta, responde a este correo o escríbenos por WhatsApp.
                        </p>

                        <p style="margin: 25px 0 0 0; color: #334155; font-size: 16px;">
                          ¡Nos vemos en la cancha! 🦁<br>
                          <strong style="color: #f59e0b;">El equipo de White Lions Academy</strong>
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #0F172A; padding: 25px 30px; text-align: center;">
                        <p style="margin: 0; color: #64748b; font-size: 12px;">
                          White Lions Academy – Formamos personas a través del deporte 🏆
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
          await supabase
            .from('comm_log')
            .insert({
              comm_type: reminderType,
              recipient_email: registration.parent_email,
              subject: subject,
              body_preview: `${mainMessage} - Player: ${registration.player_name}, Sport: ${parsed.sport}`,
              status: 'sent',
              sent_at: new Date().toISOString()
            });

          results.sent++;
        } catch (emailError) {
          console.error(`❌ Error sending ${reminderType}:`, emailError);
          
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
    console.log(`📊 Results: ${results.sent} sent, ${results.skipped} skipped, ${results.errors} errors`);
    console.log("=" .repeat(60));

    return new Response(
      JSON.stringify({
        success: true,
        results: results,
        timestamp: now.toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error) {
    console.error("❌ Fatal error in reminder handler:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

serve(handler);
