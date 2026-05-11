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

    // Insert into DB
    const { data: inserted, error: dbError } = await supabase
      .from("leads_verano")
      .insert({
        nombre_padre: lead.nombre_padre,
        telefono: lead.telefono,
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

    // Email admin
    const rows = Object.entries({
      Padre: lead.nombre_padre,
      WhatsApp: lead.telefono,
      Jugador: lead.nombre_jugador,
      Edad: lead.edad_jugador,
      Grupo: lead.grupo,
      Mes: lead.mes_interes,
      Paquete: lead.paquete_interes,
      "Forma de pago": lead.forma_pago ?? "—",
    })
      .map(([k, v]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;">${k}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${v ?? ""}</td></tr>`)
      .join("");

    await resend.emails.send({
      from: "Futcenter Verano <noreply@whitelionsacademy.com>",
      to: ["whitelionsacademy@gmail.com"],
      subject: `Nuevo lead Verano Futcenter — ${lead.nombre_jugador ?? ""}`,
      html: `<h2 style="font-family:sans-serif;color:#2D2B6B;">Nuevo registro Clínica de Verano</h2><table style="font-family:sans-serif;border-collapse:collapse;">${rows}</table>`,
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
