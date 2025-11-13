import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-training.jpg";
import TrialClassModal from "./TrialClassModal";

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-tight">
            White Lions
            <span className="block text-gold">Academies</span>
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-primary-foreground/90 font-light max-w-3xl mx-auto">
            La experiencia deportiva más inspiradora de Mexicali
          </p>
          
          <div className="inline-block bg-gold/10 backdrop-blur-sm border border-gold/30 rounded-full px-6 py-3">
            <p className="text-gold text-lg md:text-xl font-semibold">
              Tu Mejor Versión. Inicia Aquí.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              variant="gold" 
              size="xl"
              className="group"
              onClick={() => setIsModalOpen(true)}
            >
              Agendar Clase Muestra
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="hero" 
              size="xl"
            >
              Conocer Metodología
            </Button>
          </div>

          <TrialClassModal open={isModalOpen} onOpenChange={setIsModalOpen} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-3xl mx-auto">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gold">+500</div>
              <div className="text-sm text-primary-foreground/80">Jugadores</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gold">15+</div>
              <div className="text-sm text-primary-foreground/80">Años</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gold">20+</div>
              <div className="text-sm text-primary-foreground/80">Entrenadores</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gold">2</div>
              <div className="text-sm text-primary-foreground/80">Deportes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-gold rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-gold rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
