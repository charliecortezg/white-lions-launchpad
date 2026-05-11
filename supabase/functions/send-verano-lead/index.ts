// @ts-nocheck
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const lead = await req.json();

    const { data: inserted, error: dbError } = await supabase
      .from("leads_verano")
      .insert({
        nombre_padre: lead.nombre_padre,
        telefono: lead.telefono,
        email: lead.email || null,
        nombre_jugador: lead.nombre_jugador,
        edad_jugador: lead.edad_jugador,
        grupo: lead.grupo,
        mes_interes: lead.mes_interes,
        paquete_interes: lead.paquete_interes,
        forma_pago: lead.forma_pago ?? null,
        fuente: lead.fuente ?? "web",
        estado: "lead",
      })
      .select()
      .single();

    if (dbError) throw dbError;

    const html = `
<h2>Nuevo lead — Clínica de Verano Futcenter</h2>
<table style="font-family:sans-serif;border-collapse:collapse;">
  <tr><td style="padding:6px 12px;border-bottom:1px solid #eee;"><b>Padre/Mamá</b></td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${lead.nombre_padre}</td></tr>
  <tr><td style="padding:6px 12px;border-bottom:1px solid #eee;"><b>WhatsApp</b></td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${lead.telefono}</td></tr>
  <tr><td style="padding:6px 12px;border-bottom:1px solid #eee;"><b>Email</b></td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${lead.email ?? '—'}</td></tr>
  <tr><td style="padding:6px 12px;border-bottom:1px solid #eee;"><b>Jugador</b></td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${lead.nombre_jugador}</td></tr>
  <tr><td style="padding:6px 12px;border-bottom:1px solid #eee;"><b>Edad</b></td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${lead.edad_jugador} años</td></tr>
  <tr><td style="padding:6px 12px;border-bottom:1px solid #eee;"><b>Grupo</b></td><td style="padding:6px 12px;border-bottom:1px solid #eee;">Grupo ${lead.grupo}</td></tr>
  <tr><td style="padding:6px 12px;border-bottom:1px solid #eee;"><b>Mes</b></td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${lead.mes_interes}</td></tr>
  <tr><td style="padding:6px 12px;border-bottom:1px solid #eee;"><b>Paquete</b></td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${lead.paquete_interes}</td></tr>
  <tr><td style="padding:6px 12px;border-bottom:1px solid #eee;"><b>Forma de pago</b></td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${lead.forma_pago ?? '—'}</td></tr>
</table>`;

    await resend.emails.send({
      from: "Clínica Verano Futcenter <noreply@whitelionsacademy.com>",
      to: ["whitelionsacademy@gmail.com"],
      subject: `Nuevo lead Verano Futcenter — ${lead.nombre_jugador ?? ""}`,
      html,
    }).catch((e) => console.error("Email error:", e));

    return new Response(JSON.stringify({ ok: true, id: inserted.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
