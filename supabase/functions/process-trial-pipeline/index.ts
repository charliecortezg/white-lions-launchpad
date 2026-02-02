import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

// Format date in Spanish for email
function formatDateForEmail(date: Date): string {
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Tijuana'
  });
}

// Get tomorrow at 9 AM in Tijuana timezone
function getTomorrowAt9AM(): Date {
  const now = new Date();
  // Convert to Tijuana time
  const tijuanaOffset = -8 * 60; // UTC-8
  const localOffset = now.getTimezoneOffset();
  const diff = tijuanaOffset - localOffset;
  
  const tijuanaNow = new Date(now.getTime() + diff * 60 * 1000);
  tijuanaNow.setDate(tijuanaNow.getDate() + 1);
  tijuanaNow.setHours(9, 0, 0, 0);
  
  // Convert back to UTC for storage
  return new Date(tijuanaNow.getTime() - diff * 60 * 1000);
}

// Generate idempotency key for a specific date
function getIdempotencyDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Send no-show email
async function sendNoShowEmail(
  registration: Record<string, unknown>,
  template: 'no_show_1' | 'no_show_2'
): Promise<boolean> {
  const isImmediate = template === 'no_show_1';
  
  const subject = isImmediate 
    ? `Te extrañamos hoy - White Lions Academy 🦁`
    : `¿Agendamos otra fecha? - White Lions Academy`;
    
  const mainMessage = isImmediate
    ? `Notamos que ${registration.player_name} no pudo asistir a su clase muestra de hoy. ¡No te preocupes! Podemos agendar otra fecha.`
    : `Queremos asegurarnos de que ${registration.player_name} tenga la oportunidad de conocer nuestra academia. ¿Te gustaría reprogramar la clase muestra?`;

  const location = (registration.preferred_location as string) || '';
  const category = (registration.category as string) || '';
  const sport = category.toLowerCase().includes('basket') ? 'Basketball' : 'Fútbol';
  
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
                    ${isImmediate ? 'Te extrañamos hoy' : 'Recordatorio para reprogramar'}
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

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://whitelionsacademy.com" 
                       target="_blank"
                       style="display: inline-block; 
                              background-color: #d4af37; 
                              color: #1a1a2e; 
                              padding: 18px 40px; 
                              border-radius: 8px; 
                              text-decoration: none; 
                              font-weight: bold; 
                              font-size: 18px;">
                      📅 Reprogramar mi Clase Muestra
                    </a>
                  </div>

                  ${getLocationMapLink(location, sport) ? `
                  <p style="text-align: center; margin: 20px 0; color: #666; font-size: 14px;">
                    Misma ubicación: 
                    <a href="${getLocationMapLink(location, sport)}" 
                       target="_blank"
                       style="color: #d4af37; text-decoration: none;">
                      📍 Ver en Google Maps
                    </a>
                  </p>
                  ` : ''}

                  <p style="margin: 25px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                    Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo o por WhatsApp.
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

  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "White Lions Academy <hola@whitelionsacademy.com>",
        to: [registration.parent_email as string],
        bcc: ["whitelions.admn@gmail.com"],
        reply_to: "whitelions.admn@gmail.com",
        subject: subject,
        html: htmlContent
      }),
    });

    const result = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error(`❌ Failed to send ${template}:`, result);
      return false;
    }
    
    console.log(`✅ Sent ${template} to ${registration.parent_email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending ${template}:`, error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("🚀 Starting process-trial-pipeline...");
  console.log("=" .repeat(60));
  const now = new Date();
  console.log(`Current time (UTC): ${now.toISOString()}`);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results = {
      autoNoShow: { processed: 0, updated: 0, errors: 0 },
      tasksCreated: 0,
      emailsQueued: 0,
      emailsSent: 0
    };

    // ========================================
    // RULE 1: Auto No-Show with grace window
    // ========================================
    console.log("\n📋 RULE 1: Checking for auto no-show...");
    
    // Find prospects where:
    // - status is 'Pendiente' or 'Reprogramado'
    // - attendance_marked_at is NULL
    // - no_show_processed_at is NULL
    // - trial_start_at + duration + grace < now
    const { data: pendingProspects, error: fetchError } = await supabase
      .from('trial_class_registrations')
      .select('*')
      .in('status', ['Pendiente', 'Reprogramado'])
      .is('attendance_marked_at', null)
      .is('no_show_processed_at', null)
      .not('trial_start_at', 'is', null);

    if (fetchError) {
      console.error("❌ Error fetching prospects:", fetchError);
      throw fetchError;
    }

    console.log(`📝 Found ${pendingProspects?.length || 0} pending prospects with trial_start_at`);

    for (const prospect of pendingProspects || []) {
      results.autoNoShow.processed++;
      
      const trialStart = new Date(prospect.trial_start_at);
      const duration = prospect.trial_duration_min || 120;
      const grace = prospect.attendance_grace_min || 120;
      const deadline = new Date(trialStart.getTime() + (duration + grace) * 60 * 1000);
      
      console.log(`\n   Prospect: ${prospect.player_name}`);
      console.log(`   Trial start: ${trialStart.toISOString()}`);
      console.log(`   Deadline: ${deadline.toISOString()}`);
      console.log(`   Now: ${now.toISOString()}`);
      
      if (now < deadline) {
        console.log(`   ⏳ Not yet past deadline, skipping`);
        continue;
      }
      
      console.log(`   ⚠️ Past deadline! Processing no-show...`);
      
      // Update prospect to No Asistió
      const { error: updateError } = await supabase
        .from('trial_class_registrations')
        .update({
          status: 'No Asistió',
          status_updated_at: now.toISOString(),
          no_show_processed_at: now.toISOString()
        })
        .eq('id', prospect.id);

      if (updateError) {
        console.error(`   ❌ Error updating prospect:`, updateError);
        results.autoNoShow.errors++;
        continue;
      }

      results.autoNoShow.updated++;
      console.log(`   ✅ Updated to 'No Asistió'`);

      // Create follow-up task (with idempotency)
      const taskIdempotencyKey = `call_no_show_${prospect.id}_${getIdempotencyDate()}`;
      
      const { data: existingTask } = await supabase
        .from('follow_up_tasks')
        .select('id')
        .eq('idempotency_key', taskIdempotencyKey)
        .maybeSingle();

      if (!existingTask) {
        const { error: taskError } = await supabase
          .from('follow_up_tasks')
          .insert({
            prospect_id: prospect.id,
            type: 'call_no_show',
            due_at: getTomorrowAt9AM().toISOString(),
            status: 'open',
            assigned_to: 'Carlos',
            idempotency_key: taskIdempotencyKey
          });

        if (taskError) {
          console.error(`   ❌ Error creating task:`, taskError);
        } else {
          results.tasksCreated++;
          console.log(`   ✅ Created follow-up task for tomorrow 9 AM`);
        }
      } else {
        console.log(`   ⏭️ Task already exists for this prospect/date`);
      }

      // Queue no-show emails (with idempotency)
      if (prospect.parent_email) {
        const dateKey = getIdempotencyDate();
        
        // Email 1: Immediate
        const email1Key = `no_show_1_${prospect.id}_${dateKey}`;
        const { data: existingEmail1 } = await supabase
          .from('email_queue')
          .select('id')
          .eq('idempotency_key', email1Key)
          .maybeSingle();

        if (!existingEmail1) {
          // Send immediately
          const sent = await sendNoShowEmail(prospect, 'no_show_1');
          
          await supabase
            .from('email_queue')
            .insert({
              prospect_id: prospect.id,
              template: 'no_show_1',
              to_email: prospect.parent_email,
              scheduled_for: now.toISOString(),
              status: sent ? 'sent' : 'failed',
              idempotency_key: email1Key,
              sent_at: sent ? now.toISOString() : null
            });

          if (sent) {
            results.emailsSent++;
            
            // Log to comm_log
            await supabase
              .from('comm_log')
              .insert({
                comm_type: 'no_show_1',
                recipient_email: prospect.parent_email,
                subject: `Te extrañamos hoy - White Lions Academy 🦁`,
                body_preview: `No-show email para ${prospect.player_name}`,
                status: 'sent',
                sent_at: now.toISOString()
              });
          }
        }

        // Email 2: Scheduled for +24h
        const email2Key = `no_show_2_${prospect.id}_${dateKey}`;
        const { data: existingEmail2 } = await supabase
          .from('email_queue')
          .select('id')
          .eq('idempotency_key', email2Key)
          .maybeSingle();

        if (!existingEmail2) {
          const scheduledFor = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          
          await supabase
            .from('email_queue')
            .insert({
              prospect_id: prospect.id,
              template: 'no_show_2',
              to_email: prospect.parent_email,
              scheduled_for: scheduledFor.toISOString(),
              status: 'queued',
              idempotency_key: email2Key
            });

          results.emailsQueued++;
          console.log(`   ✅ Queued no_show_2 for ${scheduledFor.toISOString()}`);
        }
      }
    }

    // ========================================
    // RULE 2: Process email queue
    // ========================================
    console.log("\n📋 RULE 2: Processing email queue...");
    
    const { data: queuedEmails, error: queueError } = await supabase
      .from('email_queue')
      .select('*, trial_class_registrations(*)')
      .eq('status', 'queued')
      .lte('scheduled_for', now.toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(20);

    if (queueError) {
      console.error("❌ Error fetching email queue:", queueError);
    } else {
      console.log(`📧 Found ${queuedEmails?.length || 0} emails to send`);

      for (const email of queuedEmails || []) {
        const registration = email.trial_class_registrations;
        if (!registration) {
          console.log(`   ⏭️ Skipping email ${email.id}: no registration found`);
          continue;
        }

        const sent = await sendNoShowEmail(registration, email.template as 'no_show_1' | 'no_show_2');
        
        await supabase
          .from('email_queue')
          .update({
            status: sent ? 'sent' : 'failed',
            sent_at: sent ? now.toISOString() : null,
            error: sent ? null : 'Failed to send'
          })
          .eq('id', email.id);

        if (sent) {
          results.emailsSent++;
          
          await supabase
            .from('comm_log')
            .insert({
              comm_type: email.template,
              recipient_email: email.to_email,
              subject: email.template === 'no_show_2' 
                ? `¿Agendamos otra fecha? - White Lions Academy`
                : `Te extrañamos hoy - White Lions Academy 🦁`,
              body_preview: `No-show email para ${registration.player_name}`,
              status: 'sent',
              sent_at: now.toISOString()
            });
        }
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🏁 Pipeline run complete!");
    console.log(`   Auto No-Show: ${results.autoNoShow.updated}/${results.autoNoShow.processed} updated`);
    console.log(`   Tasks created: ${results.tasksCreated}`);
    console.log(`   Emails queued: ${results.emailsQueued}`);
    console.log(`   Emails sent: ${results.emailsSent}`);

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      timestamp: now.toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Pipeline error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
