import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EvalEmailRequest {
  guardian_name: string;
  guardian_email: string;
  player_name: string;
  event_title: string;
  event_date: string;
  location_name: string;
  address: string;
  maps_url: string | null;
  check_in_time: string;
  start_time: string;
  end_time: string;
  fee: number;
  is_partner_school: boolean;
  school_name: string;
}

const buildConfirmationEmail = (data: EvalEmailRequest): string => {
  const feeSection = data.fee === 0
    ? `<div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #0F172A; font-size: 14px;">
          ✅ <strong>Sin costo</strong> — Escuela aliada: ${data.school_name}
        </p>
      </div>`
    : `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #0F172A; font-size: 14px;">
          💳 <strong>Costo: $${data.fee} MXN</strong> — Se paga en campo el día del evento (tarjeta, transferencia o efectivo).
        </p>
      </div>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    
    <div style="background: linear-gradient(135deg, #0F172A 0%, #1e293b 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #f59e0b; margin: 0; font-size: 28px; font-weight: bold;">🦁 White Lions Academies</h1>
      <p style="color: #94a3b8; margin: 12px 0 0; font-size: 16px;">Día de Evaluación — Confirmación</p>
    </div>
    
    <div style="padding: 40px 30px;">
      <h2 style="color: #0F172A; margin: 0 0 20px; font-size: 24px;">
        ¡Hola ${data.guardian_name}! 👋
      </h2>
      
      <p style="color: #334155; line-height: 1.7; font-size: 16px; margin-bottom: 25px;">
        <strong>${data.player_name}</strong> está registrado para el <strong>${data.event_title}</strong>. 
        Aquí tienes todos los detalles:
      </p>

      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
        <h3 style="color: #0F172A; margin: 0 0 20px; font-size: 18px;">📋 Detalles del evento</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">📅 Fecha:</td>
            <td style="padding: 8px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.event_date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">📍 Sede:</td>
            <td style="padding: 8px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.location_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">🕐 Check-in:</td>
            <td style="padding: 8px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.check_in_time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">⏰ Horario:</td>
            <td style="padding: 8px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.start_time} – ${data.end_time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">👤 Jugador:</td>
            <td style="padding: 8px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.player_name}</td>
          </tr>
        </table>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
        <h3 style="color: #0F172A; margin: 0 0 15px; font-size: 16px;">📋 Cronograma por categoría</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 0; color: #f59e0b; font-weight: 600; font-size: 14px;">9:00 – 9:40</td>
            <td style="padding: 8px 0; color: #0F172A; font-weight: 600; font-size: 14px;">Escuelita</td>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; text-align: right;">2018–2019</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 0; color: #f59e0b; font-weight: 600; font-size: 14px;">9:40 – 10:00</td>
            <td style="padding: 8px 0; color: #0F172A; font-weight: 600; font-size: 14px;">Estrellita</td>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; text-align: right;">2016–2017</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #f59e0b; font-weight: 600; font-size: 14px;">10:00 – 11:00</td>
            <td style="padding: 8px 0; color: #0F172A; font-weight: 600; font-size: 14px;">Infantil</td>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; text-align: right;">2014–2015</td>
          </tr>
        </table>
      </div>

      ${feeSection}

      <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
        <h3 style="color: #0F172A; margin: 0 0 15px; font-size: 16px;">📌 Para el día del evento:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
          <li>Llegar <strong>10–15 minutos antes</strong> (check-in: ${data.check_in_time})</li>
          <li>Ropa deportiva cómoda</li>
          <li>Tenis adecuados (de preferencia para pasto)</li>
          <li>Agua o bebida hidratante</li>
        </ul>
      </div>

      ${data.maps_url ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.maps_url}" target="_blank"
           style="display: inline-block; background-color: #f59e0b; color: #0F172A; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px;">
          📍 Ver ubicación en Google Maps
        </a>
      </div>` : ''}

      <div style="background: #f1f5f9; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #0F172A; margin: 0 0 15px; font-size: 18px;">📊 ¿Y después del evento?</h3>
        <p style="color: #334155; margin: 0; font-size: 14px; line-height: 1.6;">
          Recibirás un <strong>reporte de evaluación personalizado</strong> por correo electrónico dentro de las 24–48 horas posteriores al evento.
        </p>
      </div>

      <p style="color: #334155; line-height: 1.6; font-size: 16px;">
        ¿Tienes preguntas? Responde a este correo o escríbenos por WhatsApp.
      </p>

      <p style="color: #334155; line-height: 1.6; margin-top: 25px; font-size: 16px;">
        ¡Nos vemos en la cancha! 🦁<br>
        <strong style="color: #f59e0b;">El equipo de White Lions Academies</strong>
      </p>
    </div>
    
    <div style="background-color: #0F172A; padding: 25px; text-align: center;">
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        White Lions Academies – Formamos personas a través del deporte<br>
        <a href="https://whitelionsacademy.com" style="color: #f59e0b; text-decoration: none;">whitelionsacademy.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: EvalEmailRequest = await req.json();
    console.log("Processing evaluation confirmation for:", data.player_name);

    if (!data.guardian_email || !data.guardian_email.includes("@")) {
      throw new Error("Email del tutor es requerido y debe ser válido");
    }

    const htmlContent = buildConfirmationEmail(data);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "White Lions Academies <hola@whitelionsacademy.com>",
        to: [data.guardian_email],
        bcc: ["whitelions.admn@gmail.com"],
        reply_to: "whitelions.admn@gmail.com",
        subject: `🦁 Confirmación — ${data.event_title} — ${data.player_name}`,
        html: htmlContent,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email response status:", emailResponse.status);

    if (!emailResponse.ok) {
      throw new Error(emailResult.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, data: emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-evaluation-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
