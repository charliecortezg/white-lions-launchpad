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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ConfirmationEmailRequest = await req.json();
    
    console.log("Sending confirmation email to:", data.parent_email);
    console.log("Data received:", JSON.stringify(data));

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Clase Muestra - White Lions Academy</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: bold;">🦁 White Lions Academy</h1>
                    <p style="color: #ffffff; margin: 10px 0 0; font-size: 16px;">Confirmación de Clase Muestra</p>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #1a1a2e; margin: 0 0 20px; font-size: 22px;">¡Hola ${data.tutor_name}! 👋</h2>
                    <p style="color: #444; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                      Hemos recibido el registro para la <strong>clase muestra</strong> de <strong>${data.player_name}</strong>. Aquí están los detalles:
                    </p>
                    
                    <!-- Details Box -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 25px;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                                <span style="color: #666; font-size: 14px;">Deporte</span><br>
                                <span style="color: #1a1a2e; font-size: 16px; font-weight: 600;">${data.sport === "Fútbol" ? "⚽" : "🏀"} ${data.sport}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                                <span style="color: #666; font-size: 14px;">Categoría</span><br>
                                <span style="color: #1a1a2e; font-size: 16px; font-weight: 600;">${data.category}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                                <span style="color: #666; font-size: 14px;">Fecha</span><br>
                                <span style="color: #1a1a2e; font-size: 16px; font-weight: 600;">📅 ${data.trial_date}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                                <span style="color: #666; font-size: 14px;">Ubicación</span><br>
                                <span style="color: #1a1a2e; font-size: 16px; font-weight: 600;">📍 ${data.location}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #666; font-size: 14px;">Horario</span><br>
                                <span style="color: #1a1a2e; font-size: 16px; font-weight: 600;">🕕 ${data.schedule}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- What to bring -->
                    <h3 style="color: #1a1a2e; margin: 0 0 15px; font-size: 18px;">¿Qué traer?</h3>
                    <ul style="color: #444; font-size: 15px; line-height: 1.8; margin: 0 0 25px; padding-left: 20px;">
                      <li>Ropa deportiva cómoda</li>
                      <li>Tenis adecuados para ${data.sport === "Fútbol" ? "césped" : "cancha"}</li>
                      <li>Botella de agua</li>
                      <li>Muchas ganas de aprender 💪</li>
                    </ul>
                    
                    <p style="color: #444; font-size: 16px; line-height: 1.6; margin: 0;">
                      Si tienes alguna duda, no dudes en contactarnos.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #666; font-size: 14px; margin: 0 0 10px;">
                      <strong>White Lions Academy</strong>
                    </p>
                    <p style="color: #888; font-size: 12px; margin: 0;">
                      Formando campeones con valores 🏆
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
        reply_to: "whitelions.admn@gmail.com",
        to: [data.parent_email],
        subject: `✅ Confirmación: Clase Muestra de ${data.sport} - ${data.player_name}`,
        html: htmlContent,
      }),
    });

    const emailResult = await emailResponse.json();

    console.log("Email sent successfully:", emailResult);

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
