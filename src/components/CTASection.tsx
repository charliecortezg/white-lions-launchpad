import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarCheck } from "lucide-react";
import trainingImage from "@/assets/training-facility.jpg";
import TrialClassModal from "./TrialClassModal";
import JoinFamilyModal from "./modals/JoinFamilyModal";

const CTASection = () => {
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-premium">
            {/* Background Image */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${trainingImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-navy/95 to-navy/80"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 md:p-16 text-center">
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="inline-block bg-gold/10 backdrop-blur-sm text-gold text-sm font-semibold px-4 py-2 rounded-full">
                  Únete a Nosotros
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground">
                  Inicia Tu Historia
                  <span className="block text-gold">Con White Lions</span>
                </h2>

                <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                  Agenda tu clase muestra gratuita y descubre por qué somos la academia deportiva 
                  preferida de Mexicali. Sin costo, sin compromiso.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Button 
                    variant="gold" 
                    size="xl"
                    className="group"
                    onClick={() => setIsTrialModalOpen(true)}
                  >
                    <CalendarCheck className="w-5 h-5" />
                    Registrar Clase Muestra
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <Button 
                    variant="hero" 
                    size="xl"
                    onClick={() => setIsJoinModalOpen(true)}
                  >
                    Unirme a la Familia White Lions
                  </Button>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                  <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
                    <div className="text-3xl mb-2">✓</div>
                    <h3 className="font-bold text-primary-foreground mb-2">Clase Gratuita</h3>
                    <p className="text-primary-foreground/80 text-sm">
                      Prueba sin costo ni compromiso
                    </p>
                  </div>

                  <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
                    <div className="text-3xl mb-2">✓</div>
                    <h3 className="font-bold text-primary-foreground mb-2">Evaluación Inicial</h3>
                    <p className="text-primary-foreground/80 text-sm">
                      Conoce el nivel de tu hijo
                    </p>
                  </div>

                  <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
                    <div className="text-3xl mb-2">✓</div>
                    <h3 className="font-bold text-primary-foreground mb-2">Conoce Nuestras Sedes</h3>
                    <p className="text-primary-foreground/80 text-sm">
                      Visita nuestras instalaciones
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TrialClassModal open={isTrialModalOpen} onOpenChange={setIsTrialModalOpen} />
      <JoinFamilyModal open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen} />
    </section>
  );
};

export default CTASection;
