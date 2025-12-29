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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ConfirmationEmailRequest = await req.json();
    
    console.log("Sending notification for registration:", data.parent_email);
    console.log("Data received:", JSON.stringify(data));

    // Until domain is verified at resend.com/domains, send notification to admin
    const adminEmail = "whitelions.admn@gmail.com";

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
      <p style="color: white; margin: 10px 0 0; font-size: 14px;">Nueva Clase Muestra Registrada</p>
    </div>
    
    <div style="padding: 30px;">
      <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>Accion requerida:</strong> Contactar al tutor para confirmar.
        </p>
      </div>

      <h2 style="color: #1a1a2e; margin: 0 0 15px; font-size: 18px;">Datos del Tutor</h2>
      <div style="background-color: #e8f4f8; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${data.parent_email}</p>
        <p style="margin: 0;"><strong>Nombre:</strong> ${data.tutor_name}</p>
      </div>

      <h2 style="color: #1a1a2e; margin: 0 0 15px; font-size: 18px;">Datos del Registro</h2>
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px;">
        <p style="margin: 0 0 8px;"><strong>Jugador:</strong> ${data.player_name}</p>
        <p style="margin: 0 0 8px;"><strong>Deporte:</strong> ${data.sport}</p>
        <p style="margin: 0 0 8px;"><strong>Categoria:</strong> ${data.category}</p>
        <p style="margin: 0 0 8px;"><strong>Fecha:</strong> ${data.trial_date}</p>
        <p style="margin: 0 0 8px;"><strong>Ubicacion:</strong> ${data.location}</p>
        <p style="margin: 0;"><strong>Horario:</strong> ${data.schedule}</p>
      </div>
    </div>
    
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="color: #888; font-size: 12px; margin: 0;">Correo automatico del sistema de registro.</p>
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
        from: "White Lions Academy <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `Nueva Clase Muestra: ${data.sport} - ${data.player_name}`,
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
