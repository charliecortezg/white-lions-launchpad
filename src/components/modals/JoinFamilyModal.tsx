import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DollarSign, ClipboardCheck, MapPin, ExternalLink } from "lucide-react";

interface JoinFamilyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinFamilyModal = ({ open, onOpenChange }: JoinFamilyModalProps) => {
  const locations = [
    {
      name: "Fútbol – Campo Hacienda del Bosque",
      address: "Av Bosque Almendros S/N, Del Bosque",
      mapLink: "https://maps.app.goo.gl/fxARNWmBn1RixYPZV"
    },
    {
      name: "Basketball – Quinta del Rey III",
      address: "Residencial Quinta del Rey, 3ra Etapa",
      mapLink: "https://maps.app.goo.gl/NRWYDi000BtXGXM8u"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-navy text-center">
            Únete a la Familia White Lions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 pt-4">
          {/* Costos */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-gold" />
              <h3 className="text-xl font-bold text-navy">Costos</h3>
            </div>
            
            <div className="space-y-3 bg-muted/30 rounded-2xl p-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Inscripción</span>
                <span className="font-bold text-navy">$300 MXN</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Incluye inscripción a torneos del curso actual + derecho a entrenamientos + derecho a certificaciones internas White Lions
              </p>
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Mensualidad Fútbol</span>
                  <span className="font-bold text-navy">$600 MXN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Mensualidad Basketball</span>
                  <span className="font-bold text-navy">$600 MXN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Requisitos */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ClipboardCheck className="w-6 h-6 text-gold" />
              <h3 className="text-xl font-bold text-navy">Requisitos</h3>
            </div>
            
            <ul className="space-y-2">
              {[
                "Foto del jugador",
                "Datos del tutor",
                "Pago de inscripción y mensualidad",
                "Compromiso con la asistencia y valores institucionales"
              ].map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-gold font-bold mt-1">✓</span>
                  <span className="text-muted-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ubicaciones */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-gold" />
              <h3 className="text-xl font-bold text-navy">Ubicaciones</h3>
            </div>
            
            <div className="space-y-3">
              {locations.map((location, index) => (
                <div key={index} className="bg-card border border-gold/20 rounded-xl p-4">
                  <h4 className="font-bold text-navy mb-1">{location.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{location.address}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(location.mapLink, '_blank')}
                  >
                    Ver en Google Maps
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinFamilyModal;
