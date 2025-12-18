import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-training.jpg";
import TrialClassModal from "./TrialClassModal";
import JoinFamilyModal from "./modals/JoinFamilyModal";

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

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
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-tight opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Agenda una
            <span className="block text-gold">Clase Muestra</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-primary-foreground/90 font-light max-w-3xl mx-auto opacity-0 animate-blur-in" style={{ animationDelay: '0.4s' }}>
            Conoce White Lions Academies y vive la experiencia deportiva
          </p>
          
          {/* Badge */}
          <div className="inline-block bg-gold/10 backdrop-blur-sm border border-gold/30 rounded-full px-6 py-3 opacity-0 animate-fade-in-scale" style={{ animationDelay: '0.6s' }}>
            <p className="text-gold text-lg md:text-xl font-semibold">
              Fútbol y Basketball • Mexicali
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-4 justify-center items-center pt-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <Button 
              variant="gold" 
              size="xl"
              className="group text-lg md:text-xl px-10 py-6 animate-pulse-subtle hover:animate-none"
              onClick={() => setIsModalOpen(true)}
            >
              Agendar Clase Muestra
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button 
              variant="hero" 
              size="xl"
              onClick={() => setIsJoinModalOpen(true)}
            >
              Únete a la Familia
            </Button>
          </div>

          <TrialClassModal open={isModalOpen} onOpenChange={setIsModalOpen} />
          <JoinFamilyModal open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen} />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
            <div className="space-y-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '1s' }}>
              <div className="text-4xl font-bold text-gold">+500</div>
              <div className="text-sm text-primary-foreground/80">Jugadores</div>
            </div>
            <div className="space-y-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.15s' }}>
              <div className="text-4xl font-bold text-gold">10+</div>
              <div className="text-sm text-primary-foreground/80">Años de Experiencia</div>
            </div>
            <div className="space-y-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.3s' }}>
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
