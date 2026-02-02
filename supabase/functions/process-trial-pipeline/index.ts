import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = "https://whitelionsacademy.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper: Hash token for secure storage
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: Get next best slots based on sport
function getNextBestSlots(category: string, limit: number = 2): { formatted: string; iso: string }[] {
  const now = new Date();
  const tijuanaOffset = -8 * 60;
  const localOffset = now.getTimezoneOffset();
  const diff = tijuanaOffset - localOffset;
  const tijuanaNow = new Date(now.getTime() + diff * 60 * 1000);
  
  const lowerCategory = category.toLowerCase();
  const isFutbol = lowerCategory.includes('fútbol') || 
                   lowerCategory.includes('futbol') || 
                   lowerCategory.includes('escuelita') || 
                   lowerCategory.includes('estrellita') ||
                   lowerCategory.includes('infantil') ||
                   lowerCategory.includes('juvenil');
  
  const validDays = isFutbol ? [1, 3] : [2, 4];
  const hour = isFutbol ? 18 : 18;
  const minute = isFutbol ? 0 : 30;
  
  const slots: { formatted: string; iso: string }[] = [];
  const checkDate = new Date(tijuanaNow);
  checkDate.setDate(checkDate.getDate() + 1);
  
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  while (slots.length < limit && checkDate.getTime() < tijuanaNow.getTime() + 30 * 24 * 60 * 60 * 1000) {
    if (validDays.includes(checkDate.getDay())) {
      const slotDate = new Date(checkDate);
      slotDate.setHours(hour, minute, 0, 0);
      
      const utcSlot = new Date(slotDate.getTime() - diff * 60 * 1000);
      const dayName = dayNames[slotDate.getDay()];
      const monthName = monthNames[slotDate.getMonth()];
      const timeStr = isFutbol ? '6:00 PM' : '6:30 PM';
      
      slots.push({
        formatted: `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${slotDate.getDate()} de ${monthName} - ${timeStr}`,
        iso: utcSlot.toISOString(),
      });
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  return slots;
}

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

// Generate idempotency key for a specific date
function getIdempotencyDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Send no-show email with Magic Link
async function sendNoShowEmail(
  registration: Record<string, unknown>,
  template: 'no_show_1' | 'no_show_2' | 'no_show_3',
  token: string
): Promise<boolean> {
  const slots = getNextBestSlots(registration.category as string, 2);
  const location = (registration.preferred_location as string) || '';
  const category = (registration.category as string) || '';
  const sport = category.toLowerCase().includes('basket') ? 'Basketball' : 'Fútbol';
  const mapsLink = getLocationMapLink(location, sport);
  
  const reprogramLink = `${SITE_URL}/reprogramar?token=${token}`;
  const pauseLink = `${SITE_URL}/reactivacion/pausar?token=${token}`;
  
  let subject: string;
  let mainMessage: string;
  let showSlots = true;
  let showPauseLink = false;
  
  if (template === 'no_show_1') {
    subject = `Te extrañamos hoy - White Lions Academy 🦁`;
    mainMessage = `Notamos que <strong>${registration.player_name}</strong> no pudo asistir a su clase muestra de hoy. ¡No te preocupes! Sabemos que las agendas cambian.`;
  } else if (template === 'no_show_2') {
    subject = `¿Agendamos otra fecha? - White Lions Academy`;
    mainMessage = `Solo un recordatorio de que <strong>${registration.player_name}</strong> todavía puede conocer nuestra academia. ¡Nos encantaría verlo/a!`;
  } else {
    subject = `Cerramos tu lugar por ahora - White Lions`;
    mainMessage = `Como no hemos podido coordinar una nueva fecha para <strong>${registration.player_name}</strong>, vamos a cerrar tu lugar por ahora.`;
    showSlots = false;
    showPauseLink = true;
  }

  const slotButtons = slots.map((slot, idx) => `
    <a href="${SITE_URL}/reprogramar/confirm?token=${token}&slot=${encodeURIComponent(slot.iso)}" 
       target="_blank"
       style="display: block; 
              background-color: ${idx === 0 ? '#d4af37' : '#f8f9fa'}; 
              color: ${idx === 0 ? '#1a1a2e' : '#1a1a2e'}; 
              padding: 16px 24px; 
              border-radius: 8px; 
              text-decoration: none; 
              font-weight: bold; 
              font-size: 16px;
              margin: 8px 0;
              border: 2px solid ${idx === 0 ? '#d4af37' : '#ddd'};
              text-align: center;">
      📅 ${slot.formatted}
    </a>
  `).join('');

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

                  ${showSlots ? `
                  <p style="margin: 0 0 15px 0; color: #666; font-size: 16px; font-weight: bold;">
                    Te reservamos los mejores horarios disponibles:
                  </p>
                  
                  <div style="margin: 20px 0;">
                    ${slotButtons}
                  </div>

                  <p style="text-align: center; margin: 20px 0;">
                    <a href="${reprogramLink}" 
                       target="_blank"
                       style="color: #d4af37; text-decoration: underline; font-size: 14px;">
                      Ver más horarios disponibles →
                    </a>
                  </p>
                  ` : `
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${reprogramLink}" 
                       target="_blank"
                       style="display: inline-block; 
                              background-color: #d4af37; 
                              color: #1a1a2e; 
                              padding: 18px 40px; 
                              border-radius: 8px; 
                              text-decoration: none; 
                              font-weight: bold; 
                              font-size: 18px;">
                      🗓️ Agendar Clase Muestra
                    </a>
                  </div>
                  `}

                  ${mapsLink ? `
                  <p style="text-align: center; margin: 20px 0; color: #666; font-size: 14px;">
                    📍 <a href="${mapsLink}" target="_blank" style="color: #d4af37; text-decoration: none;">
                      Ver ubicación en Google Maps
                    </a>
                  </p>
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
                  ${showPauseLink ? `
                  <p style="margin: 15px 0 0 0;">
                    <a href="${pauseLink}" target="_blank" style="color: #666; font-size: 11px; text-decoration: underline;">
                      No deseo recibir más mensajes
                    </a>
                  </p>
                  ` : ''}
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

  console.log("🚀 Starting process-trial-pipeline v2...");
  console.log("=" .repeat(60));
  const now = new Date();
  console.log(`Current time (UTC): ${now.toISOString()}`);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results = {
      autoNoShow: { processed: 0, updated: 0, errors: 0 },
      tokensCreated: 0,
      emailsQueued: 0,
      emailsSent: 0,
      lostMarked: 0
    };

    // ========================================
    // RULE 1: Auto No-Show with grace window
    // ========================================
    console.log("\n📋 RULE 1: Checking for auto no-show...");
    
    const { data: pendingProspects, error: fetchError } = await supabase
      .from('trial_class_registrations')
      .select('*')
      .in('status', ['Pendiente', 'Reprogramado'])
      .is('attendance_marked_at', null)
      .is('no_show_processed_at', null)
      .eq('reactivation_status', 'active')
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

      // Create or reuse Magic Link token (72h expiry)
      let token: string;
      
      // Check for existing valid token
      const { data: existingToken } = await supabase
        .from('reprogram_tokens')
        .select('*')
        .eq('prospect_id', prospect.id)
        .gt('expires_at', now.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingToken) {
        // We need the original token, but we only have the hash
        // For existing tokens, we'll create a new one since we can't recover the original
        console.log(`   ⏭️ Found existing token, creating new one for fresh links`);
      }
      
      // Generate new token
      token = crypto.randomUUID();
      const tokenHash = await hashToken(token);
      const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);
      
      const { error: tokenError } = await supabase
        .from('reprogram_tokens')
        .insert({
          prospect_id: prospect.id,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString()
        });

      if (tokenError) {
        console.error(`   ❌ Error creating token:`, tokenError);
      } else {
        results.tokensCreated++;
        console.log(`   ✅ Created Magic Link token (expires: ${expiresAt.toISOString()})`);
      }

      // Queue 3 no-show emails + lost_check
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
          const sent = await sendNoShowEmail(prospect, 'no_show_1', token);
          
          await supabase.from('email_queue').insert({
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
            await supabase.from('comm_log').insert({
              comm_type: 'no_show_1',
              recipient_email: prospect.parent_email,
              subject: `Te extrañamos hoy - White Lions Academy 🦁`,
              body_preview: `No-show email 1 para ${prospect.player_name}`,
              status: 'sent',
              sent_at: now.toISOString()
            });
          }
        }

        // Email 2: +24h
        const email2Key = `no_show_2_${prospect.id}_${dateKey}`;
        const { data: existingEmail2 } = await supabase
          .from('email_queue')
          .select('id')
          .eq('idempotency_key', email2Key)
          .maybeSingle();

        if (!existingEmail2) {
          const scheduledFor = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          await supabase.from('email_queue').insert({
            prospect_id: prospect.id,
            template: 'no_show_2',
            to_email: prospect.parent_email,
            scheduled_for: scheduledFor.toISOString(),
            status: 'queued',
            idempotency_key: email2Key
          });
          results.emailsQueued++;
          console.log(`   ✅ Queued no_show_2 for +24h`);
        }

        // Email 3: +72h
        const email3Key = `no_show_3_${prospect.id}_${dateKey}`;
        const { data: existingEmail3 } = await supabase
          .from('email_queue')
          .select('id')
          .eq('idempotency_key', email3Key)
          .maybeSingle();

        if (!existingEmail3) {
          const scheduledFor = new Date(now.getTime() + 72 * 60 * 60 * 1000);
          await supabase.from('email_queue').insert({
            prospect_id: prospect.id,
            template: 'no_show_3',
            to_email: prospect.parent_email,
            scheduled_for: scheduledFor.toISOString(),
            status: 'queued',
            idempotency_key: email3Key
          });
          results.emailsQueued++;
          console.log(`   ✅ Queued no_show_3 for +72h`);
        }

        // Lost check: +78h (6h after email 3)
        const lostCheckKey = `lost_check_${prospect.id}_${dateKey}`;
        const { data: existingLostCheck } = await supabase
          .from('email_queue')
          .select('id')
          .eq('idempotency_key', lostCheckKey)
          .maybeSingle();

        if (!existingLostCheck) {
          const scheduledFor = new Date(now.getTime() + 78 * 60 * 60 * 1000);
          await supabase.from('email_queue').insert({
            prospect_id: prospect.id,
            template: 'lost_check',
            to_email: prospect.parent_email,
            scheduled_for: scheduledFor.toISOString(),
            status: 'queued',
            idempotency_key: lostCheckKey
          });
          console.log(`   ✅ Queued lost_check for +78h`);
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
      console.log(`📧 Found ${queuedEmails?.length || 0} queued items to process`);

      for (const email of queuedEmails || []) {
        const registration = email.trial_class_registrations;
        if (!registration) {
          console.log(`   ⏭️ Skipping ${email.id}: no registration found`);
          await supabase.from('email_queue').update({ status: 'canceled' }).eq('id', email.id);
          continue;
        }

        // Re-validate eligibility
        const currentStatus = registration.status;
        const reactivationStatus = registration.reactivation_status;
        
        if (['Asistió', 'Inscrito', 'Pendiente', 'Reprogramado', 'Perdido'].includes(currentStatus)) {
          console.log(`   ⏭️ Canceling ${email.template}: status changed to ${currentStatus}`);
          await supabase.from('email_queue').update({ status: 'canceled' }).eq('id', email.id);
          continue;
        }
        
        if (reactivationStatus === 'paused') {
          console.log(`   ⏭️ Canceling ${email.template}: reactivation paused`);
          await supabase.from('email_queue').update({ status: 'canceled' }).eq('id', email.id);
          continue;
        }

        // Handle lost_check (internal job, not an email)
        if (email.template === 'lost_check') {
          if (currentStatus === 'No Asistió') {
            console.log(`   🚨 Processing lost_check for ${registration.player_name}`);
            
            await supabase
              .from('trial_class_registrations')
              .update({
                status: 'Perdido',
                lost_at: now.toISOString(),
                lost_reason: 'no_response_72h',
                status_updated_at: now.toISOString()
              })
              .eq('id', registration.id);

            // Cancel remaining queued emails
            await supabase
              .from('email_queue')
              .update({ status: 'canceled' })
              .eq('prospect_id', registration.id)
              .eq('status', 'queued');

            results.lostMarked++;
            console.log(`   ✅ Marked as Perdido (no_response_72h)`);
          }
          
          await supabase.from('email_queue').update({ status: 'sent', sent_at: now.toISOString() }).eq('id', email.id);
          continue;
        }

        // Get valid token for this prospect
        const { data: tokenData } = await supabase
          .from('reprogram_tokens')
          .select('*')
          .eq('prospect_id', registration.id)
          .gt('expires_at', now.toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!tokenData) {
          // Create new token if none exists
          const token = crypto.randomUUID();
          const tokenHash = await hashToken(token);
          const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);
          
          await supabase.from('reprogram_tokens').insert({
            prospect_id: registration.id,
            token_hash: tokenHash,
            expires_at: expiresAt.toISOString()
          });

          // For the current email, we have the token in memory
          const sent = await sendNoShowEmail(registration, email.template as 'no_show_1' | 'no_show_2' | 'no_show_3', token);
          
          await supabase.from('email_queue').update({
            status: sent ? 'sent' : 'failed',
            sent_at: sent ? now.toISOString() : null,
            error: sent ? null : 'Failed to send'
          }).eq('id', email.id);

          if (sent) {
            results.emailsSent++;
            await supabase.from('comm_log').insert({
              comm_type: email.template,
              recipient_email: email.to_email,
              subject: email.template === 'no_show_3' 
                ? 'Cerramos tu lugar por ahora - White Lions'
                : email.template === 'no_show_2'
                  ? '¿Agendamos otra fecha? - White Lions Academy'
                  : 'Te extrañamos hoy - White Lions Academy 🦁',
              body_preview: `${email.template} para ${registration.player_name}`,
              status: 'sent',
              sent_at: now.toISOString()
            });
          }
        } else {
          // We have a token but need to regenerate it since we only store the hash
          const token = crypto.randomUUID();
          const tokenHash = await hashToken(token);
          const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);
          
          await supabase.from('reprogram_tokens').insert({
            prospect_id: registration.id,
            token_hash: tokenHash,
            expires_at: expiresAt.toISOString()
          });

          const sent = await sendNoShowEmail(registration, email.template as 'no_show_1' | 'no_show_2' | 'no_show_3', token);
          
          await supabase.from('email_queue').update({
            status: sent ? 'sent' : 'failed',
            sent_at: sent ? now.toISOString() : null,
            error: sent ? null : 'Failed to send'
          }).eq('id', email.id);

          if (sent) {
            results.emailsSent++;
            await supabase.from('comm_log').insert({
              comm_type: email.template,
              recipient_email: email.to_email,
              subject: email.template === 'no_show_3' 
                ? 'Cerramos tu lugar por ahora - White Lions'
                : email.template === 'no_show_2'
                  ? '¿Agendamos otra fecha? - White Lions Academy'
                  : 'Te extrañamos hoy - White Lions Academy 🦁',
              body_preview: `${email.template} para ${registration.player_name}`,
              status: 'sent',
              sent_at: now.toISOString()
            });
          }
        }
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🏁 Pipeline run complete!");
    console.log(`   Auto No-Show: ${results.autoNoShow.updated}/${results.autoNoShow.processed} updated`);
    console.log(`   Tokens created: ${results.tokensCreated}`);
    console.log(`   Emails queued: ${results.emailsQueued}`);
    console.log(`   Emails sent: ${results.emailsSent}`);
    console.log(`   Lost marked: ${results.lostMarked}`);

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
