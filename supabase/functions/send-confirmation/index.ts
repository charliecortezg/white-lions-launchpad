import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TrialEmailRequest {
  player_name: string;
  tutor_name: string;
  parent_email: string;
  sport: string;
  category: string;
  trial_date: string;
  location: string;
  location_zone?: string;
  location_map?: string;
  schedule: string;
}

const DEFAULT_MAP = "https://share.google/JWKOVbkRTJ8bDJaMU";

const buildTrialEmail = (data: TrialEmailRequest): string => {
  const mapLink = data.location_map || DEFAULT_MAP;
  const zone = data.location_zone || "Zona Juventud 2000, Mexicali";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

    <div style="background: linear-gradient(135deg, #0F172A 0%, #1e293b 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #f59e0b; margin: 0; font-size: 28px; font-weight: bold;">🦁 White Lions Academy</h1>
      <p style="color: #94a3b8; margin: 12px 0 0; font-size: 16px;">¡Tu clase muestra está confirmada!</p>
    </div>

    <div style="padding: 40px 30px;">

      <h2 style="color: #0F172A; margin: 0 0 20px; font-size: 24px;">
        ¡Hola ${data.tutor_name}! 👋
      </h2>

      <p style="color: #334155; line-height: 1.7; font-size: 16px; margin-bottom: 15px;">
        <strong>¡Excelente!</strong> ${data.player_name} tiene reservado su lugar para vivir la experiencia White Lions.
      </p>

      <p style="color: #334155; line-height: 1.7; font-size: 16px; margin-bottom: 30px;">
        Esta clase es <strong>gratuita y sin compromiso</strong>. Queremos que vivan la metodología antes de tomar cualquier decisión.
      </p>

      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
        <h3 style="color: #0F172A; margin: 0 0 20px; font-size: 18px;">📋 Detalles de tu Clase Muestra</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">👤 Jugador:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.player_name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">👥 Categoría:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.category}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">📅 Fecha:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.trial_date}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">🕐 Horario:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.schedule}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">📍 Sede:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.location}<br><span style="color:#64748b; font-weight:400; font-size:13px;">${zone}</span></td>
          </tr>
        </table>
      </div>

      <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
        <h3 style="color: #0F172A; margin: 0 0 15px; font-size: 16px;">📌 Recomendaciones para el primer día:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
          <li>Entrenamos en <strong>campo natural de tierra</strong>: tenis deportivos o tacos multitaco</li>
          <li>Ropa cómoda</li>
          <li>Botella de agua</li>
          <li>Llegar 10 minutos antes</li>
        </ul>
        <p style="margin: 15px 0 0; color: #64748b; font-size: 13px;">
          Nosotros ponemos los balones.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${mapLink}" target="_blank"
           style="display: inline-block; background-color: #f59e0b; color: #0F172A; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px;">
          📍 Ver ubicación en Google Maps
        </a>
      </div>

      <p style="color: #334155; line-height: 1.6; font-size: 16px;">
        ¿Tienes preguntas? Responde a este correo o escríbenos por WhatsApp.
      </p>

      <p style="color: #334155; line-height: 1.6; margin-top: 25px; font-size: 16px;">
        ¡Nos vemos en la cancha! 🦁<br>
        <strong style="color: #f59e0b;">El equipo de White Lions Academy</strong>
      </p>
    </div>

    <div style="background-color: #0F172A; padding: 25px; text-align: center;">
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        White Lions Academy – Formamos personas a través del deporte<br>
        <a href="https://whitelionsacademy.com" style="color: #f59e0b; text-decoration: none;">whitelionsacademy.com</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: TrialEmailRequest = await req.json();

    if (!data.parent_email || !data.parent_email.includes('@')) {
      throw new Error("Email del padre/tutor es requerido y debe ser válido");
    }

    const htmlContent = buildTrialEmail(data);
    const subject = `🦁 ¡Tu clase muestra está confirmada! — ${data.player_name}`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "White Lions Academy <hola@whitelionsacademy.com>",
        to: [data.parent_email],
        bcc: ["whitelions.admn@gmail.com"],
        reply_to: "whitelions.admn@gmail.com",
        subject,
        html: htmlContent,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(emailResult.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, data: emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
