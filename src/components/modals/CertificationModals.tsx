import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface CertificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'barca' | 'coerver' | 'whitelions';
}

export const CertificationModal = ({ open, onOpenChange, type }: CertificationModalProps) => {
  const content = {
    barca: {
      title: "Barça Innovation Hub",
      description: "El Barça Innovation Hub es el ecosistema global de educación, ciencia y conocimiento del FC Barcelona. Su programa \"Barça Coach Academy: Nivel I\" ofrece formación en metodología, psicología del deporte, desarrollo del jugador, liderazgo, prevención de lesiones y gestión de las sesiones de entrenamiento.",
      link: "https://barcainnovationhub.fcbarcelona.com/product/barca-coach-academy-level-1/"
    },
    coerver: {
      title: "Coerver Coaching",
      description: "Coerver Coaching es la metodología técnica número uno del mundo, basada en el dominio del balón, conducción, cambios de ritmo, fintas, regates y creatividad ofensiva. En White Lions utilizamos sus principios para desarrollar jugadores técnicamente superiores y con autosuficiencia en situaciones 1 vs 1.",
      link: null
    },
    whitelions: {
      title: "White Lions Methodology",
      description: null,
      link: null
    }
  };

  const current = content[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-navy text-center">
            {current.title}
          </DialogTitle>
        </DialogHeader>

        <div className="pt-4 space-y-6">
          {type === 'whitelions' ? (
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                La White Lions Methodology combina:
              </p>
              <ul className="space-y-2 list-none">
                {[
                  "Sistema formativo por niveles",
                  "Principios metodológicos europeos",
                  "Modelos pedagógicos del Barça Innovation Hub",
                  "Competencias técnico-tácticas progresivas",
                  "Valores institucionales",
                  "Sistema de evaluación y rúbricas"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-gold font-bold mt-1">✓</span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground leading-relaxed pt-2">
                Es una metodología integral orientada a formar personas y deportistas de alto rendimiento 
                dentro de un ambiente seguro, inspirador y profesional.
              </p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground leading-relaxed">
                {current.description}
              </p>
              {current.link && (
                <Button 
                  variant="gold" 
                  className="w-full"
                  onClick={() => window.open(current.link, '_blank')}
                >
                  Ver Más Información
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
