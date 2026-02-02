import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  player_name: string;
  tutor_name: string;
  parent_email: string;
  sport: string;
  category: string;
  trial_date: string;
  location: string;
  schedule: string;
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ConfirmationEmailRequest = await req.json();
    
    console.log("Processing confirmation email for:", data.parent_email);
    console.log("Data received:", JSON.stringify(data));

    if (!data.parent_email || !data.parent_email.includes('@')) {
      throw new Error("Email del padre/tutor es requerido y debe ser válido");
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0F172A 0%, #1e293b 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #f59e0b; margin: 0; font-size: 28px; font-weight: bold;">🦁 White Lions Academy</h1>
      <p style="color: #94a3b8; margin: 12px 0 0; font-size: 16px;">¡Bienvenido al Reto White Lions!</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      
      <h2 style="color: #0F172A; margin: 0 0 20px; font-size: 24px;">
        ¡Hola ${data.tutor_name}! 👋
      </h2>
      
      <p style="color: #334155; line-height: 1.7; font-size: 16px; margin-bottom: 25px;">
        <strong>Tomaste una gran decisión.</strong> ${data.player_name} ya es parte de la familia White Lions.
      </p>
      
      <p style="color: #334155; line-height: 1.7; font-size: 16px; margin-bottom: 30px;">
        No es solo una inscripción. Es el inicio de 30 días de entrenamiento estructurado, 
        disciplina y una experiencia deportiva que va a transformar a tu hijo.
      </p>

      <!-- Registration Details Card -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
        <h3 style="color: #0F172A; margin: 0 0 20px; font-size: 18px;">📋 Detalles del Reto</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">🏅 Deporte:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.sport}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">👤 Jugador:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.player_name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">👥 Categoría:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.category}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">📅 Fecha de inicio:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.trial_date}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">📍 Sede:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.location}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">🕐 Horario:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: 600; font-size: 14px;">${data.schedule}</td>
          </tr>
        </table>
      </div>

      <!-- Kit Section -->
      <div style="background: #f1f5f9; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <h3 style="color: #0F172A; margin: 0 0 15px; font-size: 18px;">🎁 Tu Kit de Inicio White Lions</h3>
        <p style="color: #64748b; margin: 0 0 15px; font-size: 14px;">
          Recibirás tu kit el primer día de entrenamiento:
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          <span style="background: white; padding: 8px 12px; border-radius: 8px; font-size: 13px;">👕 Camiseta oficial</span>
          <span style="background: white; padding: 8px 12px; border-radius: 8px; font-size: 13px;">🧦 Calcetas</span>
          <span style="background: white; padding: 8px 12px; border-radius: 8px; font-size: 13px;">🛡️ Espinilleras</span>
          <span style="background: white; padding: 8px 12px; border-radius: 8px; font-size: 13px;">🥤 Termo</span>
        </div>
      </div>

      <!-- Payment Section -->
      <div style="background: linear-gradient(135deg, #0F172A 0%, #1e293b 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; text-align: center;">
        <h3 style="color: #f59e0b; margin: 0 0 10px; font-size: 20px;">💳 Siguiente paso: Completar el pago</h3>
        <p style="color: #94a3b8; margin: 0 0 20px; font-size: 14px;">
          Total: <strong style="color: #f59e0b; font-size: 24px;">$700 MXN</strong>
        </p>
        <p style="color: #94a3b8; margin: 0; font-size: 14px;">
          Te contactaremos por WhatsApp para coordinar el pago y la entrega de tu kit.
        </p>
      </div>

      ${getLocationMapLink(data.location, data.sport) ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${getLocationMapLink(data.location, data.sport)}" 
           target="_blank"
           style="display: inline-block; 
                  background-color: #f59e0b; 
                  color: #0F172A; 
                  padding: 16px 40px; 
                  border-radius: 10px; 
                  text-decoration: none; 
                  font-weight: bold; 
                  font-size: 16px;">
          📍 Ver ubicación en Google Maps
        </a>
      </div>
      ` : ''}

      <!-- Reminder Box -->
      <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #0F172A; font-size: 14px; line-height: 1.6;">
          <strong>📌 Para el primer día:</strong><br>
          Trae ropa deportiva cómoda, tenis adecuados y agua. 
          Nosotros te entregamos el kit y proporcionamos los balones.
        </p>
      </div>

      <!-- Guarantee -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6;">
          <strong style="color: #0F172A;">🛡️ Nuestra garantía:</strong> 
          Si al finalizar los 30 días no ves la organización que prometemos, 
          te devolvemos $400 MXN (tu inversión menos el kit).
        </p>
      </div>

      <p style="color: #334155; line-height: 1.6; font-size: 16px;">
        ¿Tienes preguntas? Responde a este correo o escríbenos por WhatsApp.
      </p>

      <p style="color: #334155; line-height: 1.6; margin-top: 25px; font-size: 16px;">
        ¡Nos vemos en la cancha! 🦁<br>
        <strong style="color: #f59e0b;">El equipo de White Lions Academy</strong>
      </p>
    </div>
    
    <!-- Footer -->
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
        subject: `🦁 ¡Bienvenido al Reto White Lions! - ${data.player_name}`,
        html: htmlContent,
      }),
    });

    const emailResult = await emailResponse.json();

    console.log("Email response status:", emailResponse.status);
    console.log("Email result:", emailResult);

    if (!emailResponse.ok) {
      throw new Error(emailResult.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, data: emailResult }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
