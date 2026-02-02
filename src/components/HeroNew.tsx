import { useState } from "react";
import { Button } from "@/components/ui/button";
import ChallengeRegistrationModal from "./ChallengeRegistrationModal";

const HeroNew = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0A1628 0%, #0F172A 50%, #020617 100%)',
      }}
    >
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          
          {/* Micro-badge - Cupos limitados */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm animate-fade-in"
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-primary font-medium font-body">
              Cupos limitados · Niños de 6 a 11 años
            </span>
          </div>

          {/* H1 - Main headline */}
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-display animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            White Lions no es una prueba,{' '}
            <span className="text-primary">es una decisión.</span>
          </h1>
          
          {/* Subtitle */}
          <p 
            className="text-base md:text-lg text-muted-foreground font-light max-w-xl mx-auto leading-relaxed font-body animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            30 días de entrenamiento estructurado, kit de inicio incluido
            <br className="hidden md:block" />
            y la experiencia completa de pertenecer a una comunidad deportiva real.
          </p>

          {/* Price highlight */}
          <div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm animate-fade-in-up"
            style={{ animationDelay: '0.25s' }}
          >
            <span className="text-2xl md:text-3xl font-bold text-primary font-display">$700 MXN</span>
            <span className="text-sm text-muted-foreground font-body">Kit + 30 días</span>
          </div>

          {/* Single CTA Button */}
          <div 
            className="pt-4 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Button 
              variant="hero" 
              size="xl"
              className="text-base md:text-lg px-8 md:px-10 py-6 md:py-7 w-full sm:w-auto shadow-gold"
              onClick={() => setIsModalOpen(true)}
            >
              🦁 Inscribirse al Reto White Lions
            </Button>
          </div>

          {/* Guarantee micro-text */}
          <p 
            className="text-xs text-muted-foreground/70 font-body animate-fade-in-up"
            style={{ animationDelay: '0.35s' }}
          >
            Garantía: Si no ves organización, te devolvemos tu inversión menos el kit.
          </p>

        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      <ChallengeRegistrationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </section>
  );
};

export default HeroNew;
