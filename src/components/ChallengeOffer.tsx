import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Gift, Shield, Calendar, Users, Star, Zap } from "lucide-react";
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

  const challengeIncludes = [
    { icon: "⚽", name: "Entrenamientos" },
    { icon: "👕", name: "Kit de inicio White Lions" },
    { icon: "🤝", name: "Acompañamiento inicial" },
    { icon: "✓", name: "Garantía de satisfacción" },
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
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bento-card border-2 border-primary/40 overflow-hidden relative">
              {/* Recommended badge */}
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase">
                Recomendado
              </div>
              
              {/* Price Header */}
              <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 md:p-8 text-center border-b border-border">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <span className="text-5xl md:text-6xl font-bold text-primary font-display">$1,100</span>
                  <div className="text-left">
                    <span className="text-lg text-muted-foreground font-body">MXN</span>
                    <p className="text-sm text-muted-foreground font-body">Pago único</p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <p className="text-center text-muted-foreground font-body mb-8 max-w-2xl mx-auto">
                  El Reto White Lions es la forma más segura y recomendada de iniciar.
                  <br className="hidden md:block" />
                  Durante 30 días tu hijo:
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

                  {/* What's Included */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 font-display uppercase">
                      <Gift className="w-5 h-5 text-primary" />
                      Incluye
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {challengeIncludes.map((item, index) => (
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
                        Garantía de satisfacción
                      </h4>
                      <p className="text-sm text-muted-foreground font-body">
                        Si después de 30 días tu hijo no se divierte más, no se mueve más 
                        y no se adapta al entorno White Lions, te devolvemos tu dinero (menos el kit).
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
                    🦁 Iniciar el Reto White Lions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Pricing Comparison Table */}
        <AnimatedSection animation="fade-up" delay={200}>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-foreground mb-8 font-display uppercase">
              Formas de iniciar en White Lions
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Reto - Recomendado */}
              <div className="bento-card border-2 border-primary/40 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase whitespace-nowrap">
                  Recomendado
                </div>
                <div className="pt-4">
                  <h4 className="text-sm text-primary font-bold uppercase font-display mb-2">
                    Reto White Lions
                  </h4>
                  <p className="text-3xl font-bold text-foreground font-display mb-2">$1,100</p>
                  <p className="text-xs text-muted-foreground font-body mb-4">30 días</p>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-3 h-3 text-primary" /> Kit incluido
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-3 h-3 text-primary" /> Garantía
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-3 h-3 text-primary" /> Experiencia completa
                    </li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-4 font-body">
                    👉 La mayoría inicia aquí
                  </p>
                </div>
              </div>

              {/* Inscripción Estándar */}
              <div className="bento-card">
                <h4 className="text-sm text-muted-foreground font-bold uppercase font-display mb-2">
                  Inscripción Estándar
                </h4>
                <p className="text-3xl font-bold text-foreground font-display mb-2">$950</p>
                <p className="text-xs text-muted-foreground font-body mb-4">Registro + primer mes</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <X className="w-3 h-3 text-destructive" /> Sin kit
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <X className="w-3 h-3 text-destructive" /> Sin garantía
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-4 font-body">
                  Solo para quienes ya conocen el sistema
                </p>
              </div>

              {/* Mensualidad */}
              <div className="bento-card">
                <h4 className="text-sm text-muted-foreground font-bold uppercase font-display mb-2">
                  Mensualidad Regular
                </h4>
                <p className="text-3xl font-bold text-foreground font-display mb-2">$500</p>
                <p className="text-xs text-muted-foreground font-body mb-4">Por mes</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-3 h-3 text-primary" /> Entrenamientos
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-3 h-3 text-primary" /> Evaluaciones mensuales
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-3 h-3 text-primary" /> Plataforma STRYK
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-4 font-body">
                  Continuidad después del Reto
                </p>
              </div>

              {/* Evaluación Individual */}
              <div className="bento-card">
                <h4 className="text-sm text-muted-foreground font-bold uppercase font-display mb-2">
                  Evaluación Individual
                </h4>
                <p className="text-3xl font-bold text-foreground font-display mb-2">$300</p>
                <p className="text-xs text-muted-foreground font-body mb-4">Por sesión</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2 text-foreground">
                    <Zap className="w-3 h-3 text-primary" /> Evaluación técnica
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Zap className="w-3 h-3 text-primary" /> Reporte personalizado
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-4 font-body">
                  Para jugadores externos
                </p>
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
