import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, MapPin, Clock, Calendar, Loader2, AlertCircle } from "lucide-react";

export default function ReprogramarConfirm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const slot = searchParams.get("slot");
  const success = searchParams.get("success");
  
  const [loading, setLoading] = useState(!success);
  const [error, setError] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState<{
    player_name: string;
    tutor_name: string;
    new_date: string;
    location: string;
    maps_url: string;
  } | null>(null);

  useEffect(() => {
    if (success === "true" && token && slot) {
      // Already confirmed, just fetch display data
      fetchConfirmationData();
    } else if (token && slot) {
      // Need to confirm
      confirmReschedule();
    } else {
      setError("Enlace inválido");
      setLoading(false);
    }
  }, [token, slot, success]);

  const fetchConfirmationData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reprogramar-api?action=get_info&token=${token}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();
      if (response.ok) {
        // Format the slot for display
        const slotDate = new Date(slot!);
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        const timeStr = slotDate.toLocaleTimeString('es-MX', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/Tijuana'
        });

        setConfirmData({
          player_name: result.prospect.player_name,
          tutor_name: result.prospect.tutor_name,
          new_date: `${dayNames[slotDate.getDay()]} ${slotDate.getDate()} de ${monthNames[slotDate.getMonth()]} - ${timeStr}`,
          location: result.prospect.location,
          maps_url: result.prospect.maps_url,
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching confirmation data:", err);
      setLoading(false);
    }
  };

  const confirmReschedule = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reprogramar-api?action=confirm&token=${token}&slot=${encodeURIComponent(slot!)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setConfirmData({
          player_name: result.prospect.player_name,
          tutor_name: result.prospect.tutor_name,
          new_date: result.prospect.new_date,
          location: result.prospect.location,
          maps_url: result.prospect.maps_url,
        });
      } else {
        setError(result.error || "Error al confirmar la reprogramación");
      }
    } catch (err) {
      console.error("Error confirming reschedule:", err);
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
          <p className="text-muted-foreground">Confirmando tu reservación...</p>
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
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Listo! 🎉</h2>
          <p className="text-lg text-muted-foreground">
            Tu clase muestra ha sido reprogramada
          </p>
        </div>

        {/* Confirmation Details */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center pb-4 border-b">
              <p className="text-sm text-muted-foreground mb-1">Jugador</p>
              <p className="text-xl font-bold">{confirmData?.player_name}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha y hora</p>
                <p className="font-medium">{confirmData?.new_date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Ubicación</p>
                <p className="font-medium">{confirmData?.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Recomendación</p>
                <p className="font-medium">Llega 10 minutos antes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google Maps Button */}
        <Button 
          className="w-full mb-4" 
          variant="default"
          onClick={() => window.open(confirmData?.maps_url, '_blank')}
        >
          <MapPin className="h-4 w-4 mr-2" />
          📍 Cómo Llegar
        </Button>

        {/* Back to site */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.href = "https://whitelionsacademy.com"}
        >
          Volver al sitio
        </Button>

        {/* Reminder */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Te enviaremos un recordatorio por correo electrónico antes de tu clase muestra.
        </p>
      </main>
    </div>
  );
}
