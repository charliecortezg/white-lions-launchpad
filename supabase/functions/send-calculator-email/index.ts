import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WL_BLUE = '#1B3A6B';
const WL_GOLD = '#D4A017';
const WL_LIGHT_BLUE = '#2E6CC7';
const WL_GREEN = '#2E9E6C';
const WL_CORAL = '#C05538';

function tierColor(tier: string) {
  if (tier === 'León Dorado') return WL_GOLD;
  if (tier === 'León Azul') return WL_LIGHT_BLUE;
  return '#888780';
}

function tierBg(tier: string) {
  if (tier === 'León Dorado') return '#FFFBF0';
  if (tier === 'León Azul') return '#F0F6FF';
  return '#F9F9F7';
}

function tierBadge(tier: string) {
  const bg = tierColor(tier);
  const textColor = tier === 'León Dorado' ? WL_BLUE : '#FFFFFF';
  return `<span style="display:inline-block;padding:8px 20px;border-radius:20px;background:${bg};color:${textColor};font-weight:bold;font-size:14px;">🦁 ${tier.toUpperCase()}</span>`;
}

function pctText(pct: number | null, name: string, age: number) {
  if (!pct) return `${name} está dando sus primeros pasos en el camino León de su edad.`;
  return `${name} está en el <strong>top ${pct}%</strong> de los jugadores de ${age} años evaluados.`;
}

function tierDesc(tier: string, name: string) {
  const map: Record<string, string> = {
    'León Blanco': `${name} está en el punto de partida ideal. En White Lions construimos la base desde cero con metodología formativa seria. Esta es la etapa más valiosa del proceso — todo está por escribirse.`,
    'León Azul': `${name} tiene una base sólida que acelera su desarrollo. Su perfil indica que puede crecer significativamente dentro del sistema formativo. Ya tiene lo más importante: actitud y disposición.`,
    'León Dorado': `${name} tiene un perfil excepcional. La combinación de sus capacidades físicas, cognitivas y actitud es poco común para su edad. Con el sistema formativo correcto, su techo es muy alto.`,
  };
  return map[tier] || '';
}

function bar(label: string, score: number, color: string) {
  return `
    <tr><td style="padding:6px 0;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:13px;color:#374151;font-weight:500;">${label}</td>
        <td style="font-size:13px;color:${color};font-weight:bold;text-align:right;">${score}/100</td>
      </tr><tr>
        <td colspan="2" style="padding-top:4px;">
          <div style="background:#F3F4F6;border-radius:8px;height:10px;overflow:hidden;">
            <div style="width:${score}%;background:${color};height:100%;border-radius:8px;"></div>
          </div>
        </td>
      </tr></table>
    </td></tr>`;
}

function btn(text: string, url: string, color: string) {
  return `<a href="${url}" target="_blank" style="display:block;text-align:center;padding:14px;border-radius:12px;background:${color};color:#FFFFFF;font-weight:bold;font-size:14px;text-decoration:none;">${text}</a>`;
}

function wa(msg: string) {
  return `https://wa.me/526864408021?text=${encodeURIComponent(msg)}`;
}

interface EmailData {
  parentName: string;
  playerName: string;
  parentEmail: string;
  phone: string | null;
  coeficiente: number;
  tier: string;
  age: number;
  percentile: number | null;
  dimensions: { coord: number; energy: number; conexion: number; actitud: number };
  location: string;
  parentGoal: string;
  category: string;
}

function buildEmail(d: EmailData): string {
  const tc = tierColor(d.tier);
  const tb = tierBg(d.tier);
  const tierLabel = d.tier.replace('León ', '');

  // Header
  const header = `
    <div style="text-align:center;padding:30px 20px 20px;">
      <h1 style="margin:0;font-size:22px;letter-spacing:4px;color:${WL_BLUE};font-weight:800;">WHITE LIONS</h1>
      <p style="margin:4px 0 0;font-size:12px;color:${WL_GOLD};letter-spacing:3px;">Academy · Mexicali</p>
    </div>
    <div style="padding:0 24px 20px;text-align:center;">
      <h2 style="margin:0;font-size:20px;color:${WL_BLUE};">Hola, ${d.parentName}</h2>
      <p style="margin:8px 0 0;font-size:14px;color:#6B7280;">El perfil deportivo de tu jugador está listo.</p>
    </div>`;

  // Result block
  const resultBlock = `
    <div style="background:${tb};border-radius:16px;padding:30px;text-align:center;margin:0 16px 20px;">
      <p style="font-size:56px;font-weight:800;color:${tc};margin:0;line-height:1;">${d.coeficiente}</p>
      <p style="font-size:14px;color:#6B7280;margin:8px 0 16px;">Coeficiente León de ${d.playerName}</p>
      ${tierBadge(d.tier)}
      <p style="font-size:13px;color:#6B7280;margin-top:16px;">${pctText(d.percentile, d.playerName, d.age)}</p>
    </div>`;

  // Dimensions
  const dims = `
    <div style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;padding:20px;margin:0 16px 20px;">
      <h3 style="font-size:16px;color:${WL_BLUE};margin:0 0 12px;">Perfil en 4 dimensiones</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${bar('Coordinación Física', d.dimensions.coord, WL_LIGHT_BLUE)}
        ${bar('Energía y Vitalidad', d.dimensions.energy, WL_GREEN)}
        ${bar('Conexión con el Juego', d.dimensions.conexion, WL_GOLD)}
        ${bar('Actitud y Motivación', d.dimensions.actitud, WL_CORAL)}
      </table>
    </div>`;

  // Description
  const desc = `
    <div style="background:${tb};border-radius:16px;padding:20px;margin:0 16px 20px;">
      <p style="font-size:14px;color:#374151;line-height:1.6;margin:0;">${tierDesc(d.tier, d.playerName)}</p>
    </div>`;

  // CTAs by location
  let ctas = '';
  if (d.location === 'mexicali') {
    const waClass = wa(`Hola, acabo de hacer la Calculadora de Rendimiento de White Lions para ${d.playerName}. Obtuvo un coeficiente de ${d.coeficiente} (${d.tier}) y me gustaría agendar una clase muestra gratuita.`);
    const waVideo = wa(`Hola, me interesa la evaluación por video para ${d.playerName}. Su coeficiente fue ${d.coeficiente} (${d.tier}).`);
    ctas = `
      <div style="margin:0 16px 20px;">
        <h3 style="font-size:18px;color:${WL_BLUE};margin:0 0 8px;">¿Cuál es el siguiente paso para ${d.playerName}?</h3>
        <p style="font-size:13px;color:#6B7280;margin:0 0 16px;">Como están en Mexicali, tienen acceso directo a la academia.</p>
        <div style="border:2px solid ${WL_LIGHT_BLUE};border-radius:16px;padding:20px;background:#F0F6FF;margin-bottom:12px;">
          <span style="display:inline-block;background:${WL_LIGHT_BLUE};color:white;font-size:11px;padding:2px 10px;border-radius:10px;font-weight:bold;margin-bottom:8px;">RECOMENDADO</span>
          <p style="font-size:16px;font-weight:bold;color:${WL_BLUE};margin:8px 0 4px;">🥇 Clase muestra gratuita</p>
          <p style="font-size:13px;color:#6B7280;margin:0 0 12px;">1 sesión sin costo, sin compromiso. Ven a conocer el campo y a los entrenadores en Hacienda del Bosque, Mexicali.</p>
          ${btn('Agendar clase muestra →', waClass, WL_BLUE)}
        </div>
        <div style="border:1px solid #E5E7EB;border-radius:16px;padding:20px;">
          <p style="font-size:14px;font-weight:bold;color:${WL_BLUE};margin:0 0 4px;">📹 Evaluación por video desde casa</p>
          <p style="font-size:13px;color:#6B7280;margin:0 0 12px;">Graba a ${d.playerName} realizando 3 ejercicios y recibe un Plan de Desarrollo Individual (IDP) en 48 horas.</p>
          ${btn('Solicitar evaluación por video →', waVideo, WL_LIGHT_BLUE)}
        </div>
      </div>`;
  } else if (d.location === 'otra_ciudad') {
    const waVideo = wa(`Hola, me interesa la evaluación por video para ${d.playerName}. Su coeficiente fue ${d.coeficiente} (${d.tier}). Estamos en otra ciudad de México.`);
    ctas = `
      <div style="margin:0 16px 20px;">
        <h3 style="font-size:18px;color:${WL_BLUE};margin:0 0 8px;">White Lions también llega a donde están</h3>
        <p style="font-size:13px;color:#6B7280;margin:0 0 16px;">Sin importar la ciudad, podemos acompañar el desarrollo de ${d.playerName}.</p>
        <div style="border:2px solid ${WL_GREEN};border-radius:16px;padding:20px;background:#F0FFF5;">
          <span style="display:inline-block;background:${WL_GREEN};color:white;font-size:11px;padding:2px 10px;border-radius:10px;font-weight:bold;margin-bottom:8px;">RECOMENDADO</span>
          <p style="font-size:16px;font-weight:bold;color:${WL_BLUE};margin:8px 0 4px;">📹 Evaluación por video (IDP)</p>
          <p style="font-size:13px;color:#6B7280;margin:0 0 12px;">Graba a ${d.playerName} con los ejercicios que te indicamos y recibe en 48 horas un Plan de Desarrollo Individual personalizado.</p>
          ${btn('Solicitar evaluación por video →', waVideo, WL_GREEN)}
        </div>
      </div>`;
  } else {
    const waIntl = wa(`Hola, hice la Calculadora de Rendimiento de White Lions para ${d.playerName}. Estamos fuera de México y me interesa la evaluación por video. Su coeficiente fue ${d.coeficiente} (${d.tier}).`);
    ctas = `
      <div style="margin:0 16px 20px;">
        <h3 style="font-size:18px;color:${WL_BLUE};margin:0 0 8px;">El método White Lions no tiene fronteras</h3>
        <p style="font-size:13px;color:#6B7280;margin:0 0 16px;">Trabajamos con jugadores de cualquier parte del mundo.</p>
        <div style="border:2px solid ${WL_GOLD};border-radius:16px;padding:20px;background:#FFFBF0;">
          <span style="display:inline-block;background:${WL_GOLD};color:${WL_BLUE};font-size:11px;padding:2px 10px;border-radius:10px;font-weight:bold;margin-bottom:8px;">RECOMENDADO</span>
          <p style="font-size:16px;font-weight:bold;color:${WL_BLUE};margin:8px 0 4px;">📹 Evaluación por video internacional</p>
          <p style="font-size:13px;color:#6B7280;margin:0 0 12px;">Graba a ${d.playerName} con los ejercicios que te indicamos y recibe en 48 horas un reporte completo. Sin importar el país.</p>
          ${btn('Solicitar evaluación →', waIntl, WL_GOLD)}
        </div>
      </div>`;
  }

  // Re-eval
  const reeval = `
    <div style="background:#FFFBF0;border-radius:16px;padding:20px;margin:0 16px 20px;text-align:center;">
      <p style="font-size:13px;color:#374151;margin:0 0 8px;">📅 Vuelve a evaluar a ${d.playerName} en 3 meses para ver su progreso León.</p>
      <a href="https://whitelionsacademy.com/calculadora-deportiva" style="font-size:13px;color:${WL_LIGHT_BLUE};text-decoration:none;">Agendar re-evaluación →</a>
    </div>`;

  // Footer
  const footer = `
    <div style="padding:20px 24px;text-align:center;">
      <p style="font-size:11px;color:#9CA3AF;margin:0 0 8px;">White Lions Academy · Mexicali, Baja California</p>
      <p style="font-size:11px;color:#9CA3AF;margin:0 0 12px;font-style:italic;">Este resultado es una guía formativa, no una evaluación de selección. En White Lions Academy todos los niños tienen un lugar.</p>
      <a href="https://whitelionsacademy.com/calculadora-deportiva" style="font-size:12px;color:${WL_LIGHT_BLUE};text-decoration:none;">Hacer la evaluación para otro jugador</a>
    </div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#F3F4F6;font-family:'Inter',Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#FFFFFF;">
        ${header}${resultBlock}${dims}${desc}${ctas}${reeval}${footer}
      </div>
    </body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: EmailData = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    // Save lead to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("calculator_leads").insert({
      player_name: data.playerName,
      player_age: data.age,
      parent_name: data.parentName,
      parent_email: data.parentEmail,
      parent_phone: data.phone,
      location: data.location,
      coeficiente: data.coeficiente,
      tier: data.tier,
      category: data.category,
      parent_goal: data.parentGoal,
      dimensions: data.dimensions,
    });

    // Build and send email
    const html = buildEmail(data);
    const tierLabel = data.tier.replace('León ', '');
    const subject = `${data.playerName} es un León ${tierLabel} · Coeficiente ${data.coeficiente} · White Lions Academy`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "White Lions Academy <hola@whitelionsacademy.com>",
        reply_to: "info@whitelionsacademy.com",
        to: [data.parentEmail],
        subject,
        html,
      }),
    });

    const emailResult = await emailRes.json();

    if (!emailRes.ok) {
      console.error("Resend error:", emailResult);
      return new Response(JSON.stringify({ success: false, error: emailResult }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
