import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Gift, Shield, Calendar, Users } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import ChallengeRegistrationModal from "./ChallengeRegistrationModal";

const ChallengeOffer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const kitItems = [
    { icon: "👕", name: "Camiseta oficial White Lions" },
    { icon: "🧦", name: "Calcetas deportivas" },
    { icon: "🛡️", name: "Espinilleras de entrenamiento" },
    { icon: "🥤", name: "Termo White Lions" },
  ];

  const challengeIncludes = [
    "30 días de entrenamiento estructurado",
    "8 a 12 sesiones con metodología profesional",
    "Seguimiento de asistencia y actitud",
    "Integración completa al grupo",
    "Evaluación inicial del jugador",
  ];

  return (
    <section id="pricing" className="py-20 bg-background-alt">
      <div className="container mx-auto px-4">
        {/* Header */}
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-4">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium font-body">
                La experiencia completa
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display uppercase tracking-wide">
              Reto White Lions – 30 Días
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              No es una prueba. Es tu primer mes completo como parte de la familia White Lions.
              Compromiso desde el día 1, experiencia real desde el día 1.
            </p>
          </div>
        </AnimatedSection>

        {/* Main Card */}
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="max-w-4xl mx-auto">
            <div className="bento-card border-2 border-primary/30 overflow-hidden">
              
              {/* Price Header */}
              <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 md:p-8 text-center border-b border-border">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <span className="text-5xl md:text-6xl font-bold text-primary font-display">$700</span>
                  <div className="text-left">
                    <span className="text-lg text-muted-foreground font-body">MXN</span>
                    <p className="text-sm text-muted-foreground font-body">Pago único · Kit incluido</p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  
                  {/* What's Included */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 font-display uppercase">
                      <Check className="w-5 h-5 text-primary" />
                      Qué incluye el Reto
                    </h3>
                    <ul className="space-y-3">
                      {challengeIncludes.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground font-body text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Kit de Inicio */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 font-display uppercase">
                      <Gift className="w-5 h-5 text-primary" />
                      Kit de Inicio White Lions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {kitItems.map((item, index) => (
                        <div 
                          key={index} 
                          className="bg-card/50 border border-border/50 rounded-lg p-3 text-center"
                        >
                          <span className="text-2xl block mb-1">{item.icon}</span>
                          <span className="text-xs text-muted-foreground font-body">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Guarantee */}
                <div className="mt-8 p-4 bg-card/50 border border-border/50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-foreground font-display uppercase text-sm mb-1">
                        Garantía White Lions
                      </h4>
                      <p className="text-sm text-muted-foreground font-body">
                        Si al finalizar los 30 días no ves la organización y estructura que prometemos, 
                        te devolvemos tu inversión menos el valor del kit entregado ($300 MXN). 
                        Sin preguntas, sin complicaciones.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8 text-center">
                  <Button 
                    variant="hero" 
                    size="xl"
                    className="w-full md:w-auto px-12"
                    onClick={() => setIsModalOpen(true)}
                  >
                    🦁 Inscribirme al Reto
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3 font-body">
                    Cupos limitados por grupo para mantener calidad
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Continuity Section */}
        <AnimatedSection animation="fade-up" delay={200}>
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <div className="bento-card">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground font-display uppercase">
                  Después del Reto
                </h3>
              </div>
              <p className="text-muted-foreground font-body mb-4">
                Si decides continuar (y confiamos en que lo harás), la mensualidad regular es de:
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 border border-primary/30">
                <span className="text-3xl font-bold text-primary font-display">$500</span>
                <span className="text-muted-foreground font-body">MXN / mes</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-body">
                Sin reinscripción anual · Sin costos ocultos
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>

      <ChallengeRegistrationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </section>
  );
};

export default ChallengeOffer;
