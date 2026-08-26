import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Shield, Star } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import ChallengeRegistrationModal from "./ChallengeRegistrationModal";

const ChallengeOffer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const challengeBenefits = [
    "Vive la experiencia real de la academia",
    "Entrena con metodología estructurada",
    "Se integra a un grupo con reglas y valores",
    "Comienza un proceso de seguimiento deportivo",
  ];

  const challengeExperience = [
    "Entrenamientos dos veces por semana",
    "Adaptación progresiva al sistema White Lions",
    "Desarrollo de hábitos deportivos",
    "Integración al grupo y entrenadores",
    "Evaluación real de si este sistema es para tu familia",
  ];

  return (
    <section id="pricing" className="py-20 bg-background-alt">
      <div className="container mx-auto px-4">
        {/* Header */}
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-4">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium font-body">
                La forma más segura de iniciar
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display uppercase tracking-wide">
              Reto White Lions – 30 días
            </h2>
          </div>
        </AnimatedSection>

        {/* Main Offer Card */}
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="max-w-4xl mx-auto">
            <div className="bento-card border-2 border-primary/40 overflow-hidden relative">
              {/* Recommended badge */}
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase">
                Recomendado
              </div>
              
              {/* Price Header */}
              <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 md:p-8 text-center border-b border-border">
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  <div className="text-center">
                    <span className="text-sm text-muted-foreground font-body">Inscripción</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-bold text-primary font-display">$500</span>
                      <span className="text-lg text-muted-foreground font-body">MXN</span>
                    </div>
                  </div>
                  <span className="text-2xl text-muted-foreground font-light">+</span>
                  <div className="text-center">
                    <span className="text-sm text-muted-foreground font-body">Mensualidad</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-bold text-primary font-display">$500</span>
                      <span className="text-lg text-muted-foreground font-body">MXN</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-muted-foreground/80 font-body">
                    Inscripción válida para el ciclo Agosto–Junio · Pago en campo
                  </p>
                  <p className="text-xs text-primary/90 font-body">
                    Para las categorías Biberón, Escuelita y Estrellita, tu Reto inicia con el arranque del ciclo actual.
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <p className="text-center text-muted-foreground font-body mb-8 max-w-2xl mx-auto">
                  El Reto White Lions es una experiencia de integración de 30 días. Tu hijo conocerá nuestra metodología, 
                  se adaptará al grupo y vivirá el sistema White Lions desde dentro.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Benefits */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 font-display uppercase">
                      <Check className="w-5 h-5 text-primary" />
                      Durante 30 días
                    </h3>
                    <ul className="space-y-3">
                      {challengeBenefits.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground font-body text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Experience */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 font-display uppercase">
                      <Star className="w-5 h-5 text-primary" />
                      Durante el Reto tu hijo vivirá
                    </h3>
                    <ul className="space-y-3">
                      {challengeExperience.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground font-body text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground/70 mt-4 font-body italic">
                      Los partidos oficiales y el kit White Lions se habilitan al finalizar el Reto y completar la inscripción.
                    </p>
                  </div>
                </div>

                {/* After Reto pricing */}
                <div className="mt-8 p-4 bg-muted/30 border border-border/50 rounded-xl text-center">
                  <p className="text-sm text-muted-foreground font-body">
                    Después del Reto: <span className="font-semibold text-foreground">Mensualidad $500 MXN</span> · Un solo plan, sin complicaciones.
                  </p>
                </div>

                {/* Guarantee */}
                <div className="mt-4 p-4 bg-card/50 border border-border/50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-foreground font-display uppercase text-sm mb-1">
                        Garantía de satisfacción – 30 días
                      </h4>
                      <p className="text-sm text-muted-foreground font-body">
                        Si después de 30 días tu hijo no se divierte más, no se mueve más 
                        y no se adapta al entorno White Lions, te devolvemos tu dinero. 
                        Solo necesitas completar un breve formulario de retroalimentación para procesar el reembolso.
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
                    👉 Agendar clase muestra gratuita
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>

      <ChallengeRegistrationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </section>
  );
};

export default ChallengeOffer;
