import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface MethodologyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MethodologyModal = ({ open, onOpenChange }: MethodologyModalProps) => {
  const footballLevels = [
    "Leoncito",
    "Cazador I",
    "Cazador II",
    "Guerrero I",
    "Guerrero II",
    "Estratega I",
    "Estratega II",
    "Líder",
    "Capitán",
    "Leyenda"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-navy text-center">
            Metodología White Lions Academies
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 pt-4">
          {/* Sistema de Niveles - Fútbol */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-gold" />
              <h3 className="text-2xl font-bold text-navy">Sistema de Niveles – Fútbol</h3>
            </div>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              El "Sistema de Niveles White Lions Academies" es un modelo europeo certificado que 
              desarrolla a cada jugador mediante progresiones claras, evaluables y emocionalmente 
              motivantes. Cada nivel tiene una identidad visual, color, valor formativo, competencias 
              técnicas y actitudinales, y una rúbrica de avance.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {footballLevels.map((level, index) => (
                <div 
                  key={index}
                  className="bg-card border border-gold/20 rounded-xl p-4 text-center hover:border-gold/50 transition-colors"
                >
                  <div className="font-bold text-navy mb-2">{level}</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    disabled
                  >
                    Rúbrica de Avance
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Sistema de Niveles - Basketball */}
          <div className="bg-muted/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-gold" />
              <h3 className="text-2xl font-bold text-navy">Sistema de Niveles – Basketball</h3>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              El Sistema de Niveles de Basketball adoptará la misma progresión formativa que el de fútbol. 
              Actualmente se encuentra en desarrollo usando la misma metodología institucional White Lions Methodology.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MethodologyModal;
