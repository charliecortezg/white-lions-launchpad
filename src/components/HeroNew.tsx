import { useState } from "react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-training.jpg";
import TrialClassModal from "./TrialClassModal";

const HeroNew = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* H1 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight animate-fade-in-up">
            Estructura, Disciplina y Desarrollo Deportivo en Mexicali.
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl lg:text-2xl text-primary-foreground/90 font-light max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Fútbol y Basketball para niños y jóvenes (6-15 años).
            <br className="hidden md:block" />
            <span className="block mt-2">
              Olvida los equipos desorganizados. En White Lions usamos tecnología y metodología para medir el progreso real de tu hijo.
            </span>
          </p>
          
          {/* Badge de urgencia */}
          <div className="inline-block bg-destructive/90 backdrop-blur-sm rounded-full px-6 py-3 animate-fade-in-scale" style={{ animationDelay: '0.4s' }}>
            <p className="text-primary-foreground text-base md:text-lg font-semibold flex items-center gap-2">
              <span className="w-3 h-3 bg-primary-foreground rounded-full animate-pulse" />
              Cupos limitados para el grupo de 6-11 años.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button 
              variant="gold" 
              size="xl"
              className="group text-lg px-8 py-6 font-bold animate-pulse-subtle hover:animate-none w-full sm:w-auto"
              onClick={() => setIsModalOpen(true)}
            >
              🦁 INICIAR EL RETO DE 30 DÍAS
            </Button>

            <Button 
              variant="outline" 
              size="xl"
              onClick={() => scrollToSection("horarios")}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
            >
              Ver Horarios y Ubicaciones
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-accent rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-accent rounded-full" />
        </div>
      </div>

      <TrialClassModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </section>
  );
};

export default HeroNew;
