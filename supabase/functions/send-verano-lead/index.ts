// @ts-nocheck
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const lead = await req.json();
    const rows = Object.entries(lead)
      .map(([k, v]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;">${k}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${v ?? ""}</td></tr>`)
      .join("");

    await resend.emails.send({
      from: "Futcenter Verano <noreply@whitelionsacademy.com>",
      to: ["whitelionsacademy@gmail.com"],
      subject: `Nuevo lead Verano Futcenter — ${lead.nombre_jugador ?? ""}`,
      html: `<h2 style="font-family:sans-serif;color:#2D2B6B;">Nuevo registro Clínica de Verano</h2><table style="font-family:sans-serif;border-collapse:collapse;">${rows}</table>`,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
