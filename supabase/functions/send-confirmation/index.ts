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
  const loc = location.toLowerCase();
  const sp = sport.toLowerCase();
  
  // Check location first
  if (loc.includes('hacienda') || loc.includes('bosque')) {
    return 'https://maps.app.goo.gl/QUwr6WjptEKwRg6b8';
  }
  if (loc.includes('quinta') || loc.includes('rey')) {
    return 'https://maps.app.goo.gl/1o1iuUroqA4yD86M8';
  }
  
  // Fallback to sport
  if (sp.includes('fútbol') || sp.includes('futbol') || sp.includes('soccer')) {
    return 'https://maps.app.goo.gl/QUwr6WjptEKwRg6b8';
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

    // Validate parent_email exists and is valid
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
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
      <h1 style="color: #d4af37; margin: 0; font-size: 24px;">White Lions Academy</h1>
      <p style="color: white; margin: 10px 0 0; font-size: 14px;">¡Confirmación de Clase Muestra!</p>
    </div>
    
    <div style="padding: 30px;">
      <h2 style="color: #1a1a2e; margin: 0 0 15px; font-size: 20px;">¡Hola ${data.tutor_name}!</h2>
      
      <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
        ¡Gracias por registrar a <strong>${data.player_name}</strong> para una clase muestra con nosotros! 
        Estamos emocionados de conocerlo/a y mostrarle lo que White Lions Academy tiene para ofrecer.
      </p>

      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1a1a2e; margin: 0 0 15px; font-size: 16px;">📋 Detalles de la Clase Muestra</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 40%;">🏅 Deporte:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${data.sport}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">👥 Categoría:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${data.category}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">📅 Fecha:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${data.trial_date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">📍 Ubicación:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${data.location}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">🕐 Horario:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${data.schedule}</td>
          </tr>
        </table>
      </div>

      ${getLocationMapLink(data.location, data.sport) ? `
      <div style="text-align: center; margin: 25px 0;">
        <a href="${getLocationMapLink(data.location, data.sport)}" 
           target="_blank"
           style="display: inline-block; 
                  background-color: #d4af37; 
                  color: #1a1a2e; 
                  padding: 16px 32px; 
                  border-radius: 8px; 
                  text-decoration: none; 
                  font-weight: bold; 
                  font-size: 16px;">
          📍 Cómo Llegar
        </a>
      </div>
      ` : ''}

      <div style="background-color: #e8f4f8; border-left: 4px solid #d4af37; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; color: #1a1a2e; font-size: 14px;">
          <strong>📌 Recuerda:</strong> Por favor llega 10 minutos antes. 
          Trae ropa deportiva cómoda y agua.
        </p>
      </div>

      <p style="color: #333; line-height: 1.6;">
        Si tienes alguna pregunta o necesitas reprogramar, no dudes en responder a este correo o contactarnos directamente.
      </p>

      <p style="color: #333; line-height: 1.6; margin-top: 20px;">
        ¡Te esperamos!<br>
        <strong style="color: #d4af37;">El equipo de White Lions Academy</strong>
      </p>
    </div>
    
    <div style="background-color: #1a1a2e; padding: 20px; text-align: center;">
      <p style="color: #888; font-size: 12px; margin: 0;">
        White Lions Academy - Formando Campeones<br>
        <a href="https://whitelionsacademy.com" style="color: #d4af37; text-decoration: none;">whitelionsacademy.com</a>
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
        subject: `Confirmación: Clase Muestra de ${data.sport} - White Lions Academy`,
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
