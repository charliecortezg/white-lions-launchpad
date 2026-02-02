import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get tomorrow at 9 AM in Tijuana timezone
function getTomorrowAt9AM(): Date {
  const now = new Date();
  const tijuanaOffset = -8 * 60;
  const localOffset = now.getTimezoneOffset();
  const diff = tijuanaOffset - localOffset;
  
  const tijuanaNow = new Date(now.getTime() + diff * 60 * 1000);
  tijuanaNow.setDate(tijuanaNow.getDate() + 1);
  tijuanaNow.setHours(9, 0, 0, 0);
  
  return new Date(tijuanaNow.getTime() - diff * 60 * 1000);
}

function getIdempotencyDate(): string {
  return new Date().toISOString().split('T')[0];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const now = new Date();

    // GET - Fetch all prospects
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("trial_class_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST - Update prospect or perform actions
    if (req.method === "POST") {
      const body = await req.json();
      const { id, action, status, notes, newSchedule, trialStartAt } = body;

      if (!id) {
        return new Response(
          JSON.stringify({ error: "ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Handle special actions
      if (action === "mark_attended") {
        // Mark as attended
        const { data, error } = await supabase
          .from("trial_class_registrations")
          .update({
            status: "Asistió",
            attendance_marked_at: now.toISOString(),
            attendance_marked_by: "admin",
            status_updated_at: now.toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Close any open tasks for this prospect
        await supabase
          .from("follow_up_tasks")
          .update({ status: "done", completed_at: now.toISOString() })
          .eq("prospect_id", id)
          .eq("status", "open");

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "mark_no_show") {
        // Mark as no-show manually
        const { data, error } = await supabase
          .from("trial_class_registrations")
          .update({
            status: "No Asistió",
            attendance_marked_at: now.toISOString(),
            attendance_marked_by: "admin",
            status_updated_at: now.toISOString(),
            no_show_processed_at: now.toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Create follow-up task (with idempotency)
        const taskIdempotencyKey = `call_no_show_${id}_${getIdempotencyDate()}`;
        
        const { data: existingTask } = await supabase
          .from("follow_up_tasks")
          .select("id")
          .eq("idempotency_key", taskIdempotencyKey)
          .maybeSingle();

        if (!existingTask) {
          await supabase
            .from("follow_up_tasks")
            .insert({
              prospect_id: id,
              type: "call_no_show",
              due_at: getTomorrowAt9AM().toISOString(),
              status: "open",
              assigned_to: "Carlos",
              idempotency_key: taskIdempotencyKey,
            });
        }

        // Queue no-show emails (with idempotency)
        if (data.parent_email) {
          const dateKey = getIdempotencyDate();
          
          // Email 1
          const email1Key = `no_show_1_${id}_${dateKey}`;
          const { data: existingEmail1 } = await supabase
            .from("email_queue")
            .select("id")
            .eq("idempotency_key", email1Key)
            .maybeSingle();

          if (!existingEmail1) {
            await supabase
              .from("email_queue")
              .insert({
                prospect_id: id,
                template: "no_show_1",
                to_email: data.parent_email,
                scheduled_for: now.toISOString(),
                status: "queued",
                idempotency_key: email1Key,
              });
          }

          // Email 2
          const email2Key = `no_show_2_${id}_${dateKey}`;
          const { data: existingEmail2 } = await supabase
            .from("email_queue")
            .select("id")
            .eq("idempotency_key", email2Key)
            .maybeSingle();

          if (!existingEmail2) {
            const scheduledFor = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            await supabase
              .from("email_queue")
              .insert({
                prospect_id: id,
                template: "no_show_2",
                to_email: data.parent_email,
                scheduled_for: scheduledFor.toISOString(),
                status: "queued",
                idempotency_key: email2Key,
              });
          }
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "mark_enrolled") {
        // Mark as enrolled
        const { data, error } = await supabase
          .from("trial_class_registrations")
          .update({
            status: "Inscrito",
            status_updated_at: now.toISOString(),
            reactivation_status: "completed",
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Close any open tasks
        await supabase
          .from("follow_up_tasks")
          .update({ status: "done", completed_at: now.toISOString() })
          .eq("prospect_id", id)
          .eq("status", "open");

        // Cancel pending no-show emails
        await supabase
          .from("email_queue")
          .update({ status: "canceled" })
          .eq("prospect_id", id)
          .eq("status", "queued");

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "mark_lost") {
        // Mark as lost manually
        const { data, error } = await supabase
          .from("trial_class_registrations")
          .update({
            status: "Perdido",
            status_updated_at: now.toISOString(),
            lost_at: now.toISOString(),
            lost_reason: "manual",
            reactivation_status: "completed",
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Close any open tasks
        await supabase
          .from("follow_up_tasks")
          .update({ status: "done", completed_at: now.toISOString() })
          .eq("prospect_id", id)
          .eq("status", "open");

        // Cancel pending emails
        await supabase
          .from("email_queue")
          .update({ status: "canceled" })
          .eq("prospect_id", id)
          .eq("status", "queued");

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "reschedule") {
        // Reschedule the trial class
        const { data, error } = await supabase
          .from("trial_class_registrations")
          .update({
            status: "Reprogramado",
            preferred_schedule: newSchedule,
            trial_start_at: trialStartAt,
            attendance_marked_at: null,
            no_show_processed_at: null,
            status_updated_at: now.toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Cancel pending emails for this prospect
        await supabase
          .from("email_queue")
          .update({ status: "canceled" })
          .eq("prospect_id", id)
          .eq("status", "queued");

        // Close any open tasks
        await supabase
          .from("follow_up_tasks")
          .update({ status: "done", completed_at: now.toISOString() })
          .eq("prospect_id", id)
          .eq("status", "open");

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Default: Update status/notes
      const updateData: Record<string, unknown> = {};
      if (status !== undefined) {
        updateData.status = status;
        updateData.status_updated_at = now.toISOString();
      }
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from("trial_class_registrations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE - Remove prospect
    if (req.method === "DELETE") {
      const body = await req.json();
      const { id } = body;

      if (!id) {
        return new Response(
          JSON.stringify({ error: "ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("trial_class_registrations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
