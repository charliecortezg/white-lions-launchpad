import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, AlertCircle, MailX } from "lucide-react";

export default function PausarReactivacion() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [prospectName, setProspectName] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Enlace inválido");
      setLoading(false);
      return;
    }
    
    pauseReactivation();
  }, [token]);

  const pauseReactivation = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reprogramar-api?action=pause&token=${token}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        setProspectName(result.prospect?.player_name);
      } else {
        if (result.code === "EXPIRED_TOKEN") {
          setError("Este enlace ha expirado.");
        } else if (result.code === "INVALID_TOKEN") {
          setError("Enlace inválido o expirado.");
        } else {
          setError(result.error || "Error al procesar la solicitud");
        }
      }
    } catch (err) {
      console.error("Error pausing reactivation:", err);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Procesando solicitud...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "https://whitelionsacademy.com"}
            >
              Volver al sitio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="bg-navy text-white py-6 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold text-gold mb-1">🦁 White Lions Academy</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <MailX className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Listo</h2>
          <p className="text-lg text-muted-foreground">
            Hemos pausado los mensajes por ahora
          </p>
        </div>

        {/* Confirmation Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-2">No recibirás más correos de seguimiento</p>
                <p className="text-sm text-muted-foreground">
                  Si en el futuro deseas agendar una clase muestra para {prospectName || "tu jugador"}, 
                  siempre puedes visitarnos en nuestro sitio web.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to site */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.href = "https://whitelionsacademy.com"}
        >
          Volver al sitio
        </Button>

        {/* Thank you message */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          ¡Gracias por tu interés en White Lions Academy! 🦁
        </p>
      </main>
    </div>
  );
}
