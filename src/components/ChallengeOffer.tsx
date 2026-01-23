import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, MapPin } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import TrialClassModal from "./TrialClassModal";

const ChallengeOffer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<"football" | "basketball" | null>(null);

  const benefits = [
    "8 a 12 sesiones semipersonalizadas",
    "Evaluación inicial",
    "Reportes de asistencia",
    "Garantía de devolución",
  ];

  const openModalWithSport = (sport: "football" | "basketball") => {
    setSelectedSport(sport);
    setIsModalOpen(true);
  };

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display uppercase tracking-wide">
              Tu Primer Paso: El Reto de 30 Días
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Prueba nuestra academia sin inscripciones anuales ni uniformes costosos desde el día 1.
            </p>
          </div>
        </AnimatedSection>

        {/* Benefits */}
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-foreground text-sm font-body">{benefit}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Fútbol Card */}
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="bento-card border-2 border-primary/30 hover:border-primary">
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">⚽</span>
                <h3 className="text-2xl font-bold text-foreground mb-2 font-display uppercase">FÚTBOL</h3>
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm font-body">
                  <MapPin className="w-4 h-4" />
                  Hacienda del Bosque
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-foreground font-display">
                  $450 <span className="text-lg font-normal text-muted-foreground font-body">MXN / mes</span>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-sm text-muted-foreground font-body">
                <p className="font-medium text-foreground">Categorías:</p>
                <ul className="space-y-1">
                  <li>• Escuelita: 2018-2019</li>
                  <li>• Estrellita: 2016-2017</li>
                  <li>• Infantil: 2014-2015</li>
                </ul>
              </div>

              <Button 
                variant="gold" 
                size="lg" 
                className="w-full"
                onClick={() => openModalWithSport("football")}
              >
                RESERVAR FÚTBOL
              </Button>
            </div>
          </AnimatedSection>

          {/* Basketball Card */}
          <AnimatedSection animation="fade-up" delay={300}>
            <div className="bento-card border-2 border-primary/30 hover:border-primary">
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">🏀</span>
                <h3 className="text-2xl font-bold text-foreground mb-2 font-display uppercase">BASKETBALL</h3>
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm font-body">
                  <MapPin className="w-4 h-4" />
                  Parque Quinta del Rey III
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-foreground font-display">
                  $400 <span className="text-lg font-normal text-muted-foreground font-body">MXN / mes</span>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-sm text-muted-foreground font-body">
                <p className="font-medium text-foreground">Categorías:</p>
                <ul className="space-y-1">
                  <li>• Estrellita: 2016-2017</li>
                  <li>• Infantil: 2014-2015</li>
                </ul>
              </div>

              <Button 
                variant="gold" 
                size="lg" 
                className="w-full"
                onClick={() => openModalWithSport("basketball")}
              >
                RESERVAR BASKET
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <TrialClassModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </section>
  );
};

export default ChallengeOffer;