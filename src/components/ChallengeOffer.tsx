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
    <section id="pricing" className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Tu Primer Paso: El Reto de 30 Días
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Prueba nuestra academia sin inscripciones anuales ni uniformes costosos desde el día 1.
            </p>
          </div>
        </AnimatedSection>

        {/* Benefits */}
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2">
                <Check className="w-4 h-4 text-accent" />
                <span className="text-primary-foreground text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Fútbol Card */}
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="bg-card rounded-2xl p-8 shadow-premium border-2 border-accent/20 hover:border-accent transition-all duration-300">
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">⚽</span>
                <h3 className="text-2xl font-bold text-foreground mb-2">FÚTBOL</h3>
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4" />
                  Hacienda del Bosque
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-foreground">
                  $450 <span className="text-lg font-normal text-muted-foreground">MXN / mes</span>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-sm text-muted-foreground">
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
                className="w-full font-bold"
                onClick={() => openModalWithSport("football")}
              >
                RESERVAR FÚTBOL
              </Button>
            </div>
          </AnimatedSection>

          {/* Basketball Card */}
          <AnimatedSection animation="fade-up" delay={300}>
            <div className="bg-card rounded-2xl p-8 shadow-premium border-2 border-accent/20 hover:border-accent transition-all duration-300">
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">🏀</span>
                <h3 className="text-2xl font-bold text-foreground mb-2">BASKETBALL</h3>
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4" />
                  Parque Quinta del Rey III
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-foreground">
                  $400 <span className="text-lg font-normal text-muted-foreground">MXN / mes</span>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Categorías:</p>
                <ul className="space-y-1">
                  <li>• Estrellita: 2016-2017</li>
                  <li>• Infantil: 2014-2015</li>
                </ul>
              </div>

              <Button 
                variant="gold" 
                size="lg" 
                className="w-full font-bold"
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
