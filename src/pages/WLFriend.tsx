import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, CalendarCheck, Eye, Settings, ThumbsUp } from "lucide-react";
import logoWhiteLions from "@/assets/logo-white-lions.png";
import AnimatedSection from "@/components/AnimatedSection";
import ChallengeRegistrationModal from "@/components/ChallengeRegistrationModal";

const WLFriend = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = [
    { icon: CalendarCheck, title: "Agenda la clase muestra", description: "Gratuita y sin compromiso" },
    { icon: Eye, title: "Tu hijo vive la experiencia", description: "Entrenamiento real con el grupo" },
    { icon: Settings, title: "Conocen el sistema White Lions", description: "Metodología, ambiente y valores" },
    { icon: ThumbsUp, title: "Deciden sin presión", description: "La decisión es de tu familia" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Logo Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex justify-center">
          <img src={logoWhiteLions} alt="White Lions Academy" className="h-10 w-auto" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection animation="fade-up" className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
              Te invitaron a conocer<br />
              <span className="text-primary">White Lions Academy</span> 🦁
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-body max-w-lg mx-auto">
              Una experiencia formativa de fútbol para niños de 6 a 13 años en Mexicali.
            </p>
            <p className="text-sm text-muted-foreground/80 font-body italic">
              Esta invitación viene de una familia que ya entrena con nosotros.
            </p>
            <Button
              variant="gold"
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="glow-gold text-base px-8 py-6"
            >
              📅 Agendar clase muestra gratuita
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* ¿Por qué estás aquí? */}
      <section className="py-12 sm:py-16 bg-background-alt">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="max-w-xl mx-auto text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              ¿Por qué estás aquí?
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed">
              Alguien que forma parte de White Lions pensó que tu hijo podría disfrutar esta experiencia.
            </p>
            <p className="text-muted-foreground font-body leading-relaxed">
              No es una promoción ni un descuento.{" "}
              <span className="text-foreground font-medium">
                Es una invitación personal
              </span>{" "}
              para vivir una clase y conocer nuestra metodología.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ¿Qué vivirá tu hijo? */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="max-w-xl mx-auto text-center space-y-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              ¿Qué vivirá tu hijo?
            </h2>
            <div className="grid gap-4 text-left">
              {[
                { emoji: "⚽", text: "Entrenamiento con metodología europea" },
                { emoji: "👥", text: "Grupos reducidos" },
                { emoji: "💪", text: "Disciplina, confianza y diversión" },
                { emoji: "🌱", text: "Ambiente sano y formativo" },
              ].map((item, i) => (
                <AnimatedSection key={i} animation="fade-left" delay={i * 100}>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-foreground font-body font-medium">{item.text}</span>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <p className="text-primary font-display text-lg sm:text-xl font-bold uppercase tracking-wide">
              Aquí inicia su mejor versión.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ¿Cómo funciona? */}
      <section className="py-12 sm:py-16 bg-background-alt">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              ¿Cómo funciona?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {steps.map((s, i) => (
                <AnimatedSection key={i} animation="scale" delay={i * 120}>
                  <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-card border border-border/50 text-center h-full">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <s.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center">
                        {i + 1}
                      </span>
                      <h3 className="font-display font-bold text-foreground text-sm uppercase">
                        {s.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-body">{s.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <p className="text-muted-foreground font-body text-sm">
              Sin compromiso. Sin presión.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="max-w-md mx-auto text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              ¿Listo para la experiencia?
            </h2>
            <p className="text-muted-foreground font-body text-sm">
              Agenda la clase muestra gratuita para tu hijo y descubre por qué las familias White Lions nos recomiendan.
            </p>
            <Button
              variant="gold"
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="glow-gold text-base px-8 py-6 w-full sm:w-auto"
            >
              🦁 Agendar clase muestra gratuita
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer operativo */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground font-body">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Campo Hacienda del Bosque, Mexicali</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Lunes y Miércoles · 6:00–8:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Edades: 6 a 13 años</span>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground/60 mt-4">
            © {new Date().getFullYear()} White Lions Academy. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      <ChallengeRegistrationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        referralSource="WL-FRIEND"
      />
    </div>
  );
};

export default WLFriend;
