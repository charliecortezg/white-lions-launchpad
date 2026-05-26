// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const lead = await req.json();

    // Calcular montos en servidor (no confiar 100% en el cliente)
    const MONTOS: Record<string, { deposito: number; saldo: number }> = {
      mes_completo__completo: { deposito: 3600, saldo: 0 },
      mes_completo__deposito: { deposito: 1000, saldo: 3000 },
      "2_semanas__completo":  { deposito: 1800, saldo: 0 },
      "2_semanas__deposito":  { deposito: 1000, saldo: 1000 },
    };
    const key = `${lead.paquete_interes}__${lead.forma_pago}`;
    const m = MONTOS[key];

    const { data: inserted, error: dbError } = await supabase
      .from("leads_verano")
      .insert({
        nombre_padre: lead.nombre_padre,
        telefono: lead.telefono,
        email: lead.email || null,
        nombre_jugador: lead.nombre_jugador,
        edad_jugador: lead.edad_jugador,
        grupo: lead.grupo,
        venue: lead.venue ?? null,
        mes_interes: lead.mes_interes,
        paquete_interes: lead.paquete_interes,
        forma_pago: lead.forma_pago ?? null,
        deposito_monto: m?.deposito ?? lead.deposito_monto ?? null,
        saldo_monto:    m?.saldo    ?? lead.saldo_monto    ?? null,
        fuente: lead.fuente ?? "web",
        estado: "lead",
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", JSON.stringify(dbError), "payload:", JSON.stringify(lead));
      return new Response(
        JSON.stringify({
          ok: false,
          error: dbError.message,
          code: (dbError as any).code ?? null,
          details: (dbError as any).details ?? null,
          hint: (dbError as any).hint ?? null,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = `
<h2>Nuevo lead — Clínica de Verano Futcenter</h2>
<table border="1" cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;">
  <tr><td><b>Padre/Mamá</b></td><td>${lead.nombre_padre}</td></tr>
  <tr><td><b>WhatsApp</b></td><td>${lead.telefono}</td></tr>
  <tr><td><b>Email</b></td><td>${lead.email ?? '—'}</td></tr>
  <tr><td><b>Jugador</b></td><td>${lead.nombre_jugador}</td></tr>
  <tr><td><b>Edad</b></td><td>${lead.edad_jugador} años</td></tr>
  <tr><td><b>Grupo</b></td><td>Grupo ${lead.grupo}</td></tr>
  <tr><td><b>Mes</b></td><td>${lead.mes_interes}</td></tr>
  <tr><td><b>Paquete</b></td><td>${lead.paquete_interes}</td></tr>
  <tr><td><b>Forma de pago</b></td><td>${lead.forma_pago ?? '—'}</td></tr>
</table>`;

    try {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "White Lions Academy <hola@whitelionsacademy.com>",
          to: ["whitelions.admn@gmail.com"],
          reply_to: "whitelions.admn@gmail.com",
          subject: `Nuevo lead Verano Futcenter — ${lead.nombre_jugador ?? ""}`,
          html,
        }),
      });
      const emailResult = await emailResponse.json();
      if (!emailResponse.ok) {
        console.error("Resend error:", emailResult);
      } else {
        console.log("Email sent:", emailResult);
      }
    } catch (mailErr) {
      console.error("Email send threw:", mailErr);
    }

    return new Response(JSON.stringify({ ok: true, id: inserted.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("send-verano-lead error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: e?.message ?? String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
