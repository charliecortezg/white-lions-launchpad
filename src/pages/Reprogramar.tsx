import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Slot {
  formatted: string;
  iso: string;
}

interface ProspectInfo {
  player_name: string;
  tutor_name: string;
  category: string;
  status: string;
  location: string;
  maps_url: string;
}

export default function Reprogramar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prospect, setProspect] = useState<ProspectInfo | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [confirmingSlot, setConfirmingSlot] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Enlace inválido");
      setLoading(false);
      return;
    }
    
    fetchProspectInfo();
  }, [token]);

  const fetchProspectInfo = async () => {
    try {
      const { data, error: apiError } = await supabase.functions.invoke("reprogramar-api", {
        body: null,
        headers: {},
      });

      // Use query params approach
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reprogramar-api?action=get_info&token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (result.code === "EXPIRED_TOKEN") {
          setError("Este enlace ha expirado. Por favor solicita uno nuevo.");
        } else if (result.code === "INVALID_TOKEN") {
          setError("Enlace inválido o expirado.");
        } else {
          setError(result.error || "Error al cargar la información");
        }
        setLoading(false);
        return;
      }

      setProspect(result.prospect);
      setSlots(result.slots || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching prospect info:", err);
      setError("Error al conectar con el servidor");
      setLoading(false);
    }
  };

  const loadAllSlots = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reprogramar-api?action=get_all_slots&token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      if (response.ok && result.slots) {
        setAllSlots(result.slots);
        setShowAllSlots(true);
      }
    } catch (err) {
      console.error("Error loading all slots:", err);
    }
  };

  const confirmSlot = async (slotIso: string) => {
    setConfirmingSlot(slotIso);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reprogramar-api?action=confirm&token=${token}&slot=${encodeURIComponent(slotIso)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Navigate to confirmation page
        navigate(`/reprogramar/confirm?token=${token}&slot=${encodeURIComponent(slotIso)}&success=true`);
      } else {
        setError(result.error || "Error al confirmar la reprogramación");
      }
    } catch (err) {
      console.error("Error confirming slot:", err);
      setError("Error al conectar con el servidor");
    } finally {
      setConfirmingSlot(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando información...</p>
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

  const displaySlots = showAllSlots ? allSlots : slots;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="bg-navy text-white py-6 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold text-gold mb-1">🦁 White Lions Academy</h1>
          <p className="text-sm text-white/80">Reprogramar Clase Muestra</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            ¡Hola {prospect?.tutor_name?.split(' ')[0] || 'familia'}! 👋
          </h2>
          <p className="text-muted-foreground">
            Queremos reservarte el mejor horario para <span className="font-semibold">{prospect?.player_name}</span>.
          </p>
        </div>

        {/* Location Info */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium">{prospect?.location}</p>
                <a 
                  href={prospect?.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Ver en Google Maps →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slot Options */}
        <div className="space-y-3 mb-6">
          <p className="font-medium text-sm text-muted-foreground">
            {showAllSlots ? "Todos los horarios disponibles:" : "Te sugerimos estos horarios:"}
          </p>
          
          {displaySlots.map((slot, idx) => (
            <Card 
              key={slot.iso}
              className={`transition-all hover:border-primary cursor-pointer ${
                idx === 0 && !showAllSlots ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{slot.formatted.split(' - ')[0]}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {slot.formatted.split(' - ')[1]}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={idx === 0 && !showAllSlots ? "default" : "outline"}
                    onClick={() => confirmSlot(slot.iso)}
                    disabled={confirmingSlot !== null}
                  >
                    {confirmingSlot === slot.iso ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Reservar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Show More */}
        {!showAllSlots && (
          <Button 
            variant="ghost" 
            className="w-full mb-8"
            onClick={loadAllSlots}
          >
            Ver más horarios disponibles →
          </Button>
        )}

        {/* Pause Link */}
        <div className="text-center border-t pt-6">
          <a 
            href={`/reactivacion/pausar?token=${token}`}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Pausar mensajes por ahora
          </a>
        </div>
      </main>
    </div>
  );
}
