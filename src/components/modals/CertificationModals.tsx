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
  type: 'barca' | 'coerver' | 'whitelions' | 'fifa';
}

export const CertificationModal = ({ open, onOpenChange, type }: CertificationModalProps) => {
  const content = {
    barca: {
      title: "Barça Innovation Hub",
      description: "El Barça Innovation Hub es el ecosistema global de educación, ciencia y conocimiento del FC Barcelona. Su programa \"Barça Coach Academy: Nivel I\" ofrece formación en metodología, psicología del deporte, desarrollo del jugador, liderazgo, prevención de lesiones y gestión de las sesiones de entrenamiento.",
      link: "https://elearning.barcainnovationhub.com/coach-academy-program/"
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
    },
    fifa: {
      title: "FIFA Grassroots",
      description: "El programa FIFA Grassroots se enfoca en el desarrollo de base, inclusión, diversión y principios pedagógicos FIFA. Utiliza el fútbol como herramienta social con un enfoque en la formación de personas antes que atletas, promoviendo valores, trabajo en equipo y desarrollo integral desde edades tempranas.",
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
