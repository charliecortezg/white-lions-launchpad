import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper: Get class start time based on sport (America/Tijuana timezone)
function getClassStartTime(trialDate: string, sport: string): Date {
  // Parse the date (YYYY-MM-DD format from Supabase)
  const [year, month, day] = trialDate.split('-').map(Number);
  
  // Default hours based on sport (in 24h format, Tijuana time)
  // Fútbol: 18:00, Basketball: 18:30
  const sportLower = sport.toLowerCase();
  let hour = 18;
  let minute = 0;
  
  if (sportLower.includes('basket') || sportLower.includes('baloncesto')) {
    hour = 18;
    minute = 30;
  }
  
  // Create date in Tijuana timezone (UTC-8 in winter, UTC-7 in summer)
  // We'll work in UTC and add the offset
  // For simplicity, we'll calculate based on typical PST (-8 hours)
  const tijuanaDate = new Date(Date.UTC(year, month - 1, day, hour + 8, minute, 0));
  
  return tijuanaDate;
}

// Helper: Check if a booking needs a reminder
function needsReminder(classTime: Date, now: Date, reminderType: 'reminder_24h' | 'reminder_2h'): boolean {
  const diffMs = classTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (reminderType === 'reminder_24h') {
    // Send 24h reminder if class is between 23-25 hours away
    return diffHours >= 23 && diffHours <= 25;
  } else {
    // Send 2h reminder if class is between 1.5-2.5 hours away
    return diffHours >= 1.5 && diffHours <= 2.5;
  }
}

// Helper: Format date for email display
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
  const now = new Date();
  console.log(`Current time (UTC): ${now.toISOString()}`);

  try {
    // Initialize Supabase client with service role for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get bookings with a trial_date in the future (or today)
    const today = now.toISOString().split('T')[0];
    const { data: bookings, error: bookingsError } = await supabase
      .from('booking_intents')
      .select('*')
      .gte('trial_date', today)
      .not('parent_email', 'is', null)
      .neq('status', 'cancelled');

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      throw bookingsError;
    }

    console.log(`Found ${bookings?.length || 0} upcoming bookings with parent emails`);

    const results: { sent: number; skipped: number; errors: number } = {
      sent: 0,
      skipped: 0,
      errors: 0
    };

    for (const booking of bookings || []) {
      if (!booking.parent_email || !booking.trial_date || !booking.sport) {
        console.log(`⏭️ Skipping booking ${booking.id}: missing required fields`);
        results.skipped++;
        continue;
      }

      const classTime = getClassStartTime(booking.trial_date, booking.sport);
      console.log(`Booking ${booking.id}: Class time is ${classTime.toISOString()}`);

      // Check both reminder types
      for (const reminderType of ['reminder_24h', 'reminder_2h'] as const) {
        if (!needsReminder(classTime, now, reminderType)) {
          continue;
        }

        console.log(`📧 Booking ${booking.id} needs ${reminderType}`);

        // Check comm_log for existing reminder
        const { data: existingLog, error: logError } = await supabase
          .from('comm_log')
          .select('id')
          .eq('booking_intent_id', booking.id)
          .eq('comm_type', reminderType)
          .maybeSingle();

        if (logError) {
          console.error(`Error checking comm_log for booking ${booking.id}:`, logError);
          results.errors++;
          continue;
        }

        if (existingLog) {
          console.log(`⏭️ ${reminderType} already sent for booking ${booking.id}`);
          results.skipped++;
          continue;
        }

        // Prepare email content
        const is24h = reminderType === 'reminder_24h';
        const subject = is24h 
          ? `¡Mañana es tu clase muestra de ${booking.sport}! 🦁`
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
                          ¡Hola ${booking.tutor_name || 'familia'}! 👋
                        </h2>
                        
                        <p style="margin: 0 0 25px 0; color: #333; font-size: 18px; line-height: 1.6;">
                          ${mainMessage}
                        </p>

                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
                          <tr>
                            <td style="padding: 25px;">
                              <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
                                <strong style="color: #1a1a2e;">👤 Jugador:</strong> ${booking.player_name}
                              </p>
                              <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
                                <strong style="color: #1a1a2e;">⚽ Deporte:</strong> ${booking.sport}
                              </p>
                              <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
                                <strong style="color: #1a1a2e;">📅 Fecha:</strong> ${formatDateForEmail(classTime)}
                              </p>
                              ${booking.preferred_location ? `
                              <p style="margin: 0; color: #666; font-size: 14px;">
                                <strong style="color: #1a1a2e;">📍 Ubicación:</strong> ${booking.preferred_location}
                              </p>
                              ` : ''}
                            </td>
                          </tr>
                        </table>

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
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "White Lions Academy <hola@whitelionsacademy.com>",
              to: [booking.parent_email],
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

          console.log(`✅ ${reminderType} sent to ${booking.parent_email}:`, emailResponse);

          // Log to comm_log
          const { error: insertError } = await supabase
            .from('comm_log')
            .insert({
              booking_intent_id: booking.id,
              comm_type: reminderType,
              recipient_email: booking.parent_email,
              subject: subject,
              body_preview: mainMessage,
              status: 'sent',
              sent_at: new Date().toISOString()
            });

          if (insertError) {
            console.error(`Error logging to comm_log:`, insertError);
          }

          results.sent++;
        } catch (emailError) {
          console.error(`❌ Error sending ${reminderType} for booking ${booking.id}:`, emailError);
          
          // Log failed attempt
          await supabase
            .from('comm_log')
            .insert({
              booking_intent_id: booking.id,
              comm_type: reminderType,
              recipient_email: booking.parent_email,
              subject: subject,
              status: 'failed',
              error_message: emailError instanceof Error ? emailError.message : 'Unknown error'
            });

          results.errors++;
        }
      }
    }

    console.log(`🏁 Reminder run complete:`, results);

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
